const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// CORS ayarları
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Production'da tüm origin'lere izin ver
    : 'http://localhost:3000',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/uploads/banners', express.static('uploads/banners'));

// Production'da React build dosyalarını serve et
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Dosya yükleme konfigürasyonu
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = req.body.type === 'banner' ? 'uploads/banners' : 'uploads';
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Alan adına göre ayrım yap
    if (file.fieldname === 'banner') {
      // Banner için resim dosyaları
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = file.mimetype.startsWith('image/');
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'));
      }
    } else if (file.fieldname === 'audio') {
      // Müzik dosyaları
      const allowedTypes = /mp3|wav|ogg|m4a/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = file.mimetype.startsWith('audio/');
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Sadece müzik dosyaları yüklenebilir!'));
      }
    } else {
      cb(new Error('Geçersiz dosya alanı!'));
    }
  }
});

// Tabloları oluştur
async function initDb() {
  await pool.query(`CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT,
    artist TEXT,
    description TEXT,
    filename TEXT,
    originalName TEXT,
    uploadDate TEXT,
    plays INTEGER
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    about TEXT,
    contact TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT,
    text TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS theme (
    id SERIAL PRIMARY KEY,
    title TEXT,
    primaryColor TEXT,
    secondaryColor TEXT,
    accentColor TEXT,
    backgroundColor TEXT,
    textColor TEXT,
    navbarButtonColor TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS banner (
    id SERIAL PRIMARY KEY,
    filename TEXT,
    originalName TEXT,
    uploadDate TEXT
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);

  // Varsayılan içerik ekle (eğer yoksa)
  const { rows: contentRows } = await pool.query('SELECT COUNT(*) as count FROM content');
  if (parseInt(contentRows[0].count) === 0) {
    await pool.query('INSERT INTO content (title, description, about, contact) VALUES ($1, $2, $3, $4)',
      ['ByBrawo', 'Official Web Site', 'Buraya kendinizle ilgili bilgileri ekleyebilirsiniz.', 'İletişim bilgileri buraya.']);
  }
  const { rows: themeRows } = await pool.query('SELECT COUNT(*) as count FROM theme');
  if (parseInt(themeRows[0].count) === 0) {
    await pool.query('INSERT INTO theme (title, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, navbarButtonColor) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      ['ByBrawo', '#7ecbff', '#b3e0ff', '#7ecbff', '#1a1036', '#FFFFFF', '#7ecbff']);
  }
  const { rows: adminRows } = await pool.query('SELECT COUNT(*) as count FROM admin_users');
  if (parseInt(adminRows[0].count) === 0) {
    await pool.query('INSERT INTO admin_users (username, password) VALUES ($1, $2)', ['ByBrawo', '1358963rk']);
  }
}

initDb();

// Routes

// Şarkıları getir
app.get('/api/songs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM songs ORDER BY uploadDate DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Şarkılar yüklenirken hata oluştu' });
  }
});

// Şarkı ekle
app.post('/api/songs', upload.single('audio'), async (req, res) => {
  const { title, artist, description } = req.body;
  const audioFile = req.file;
  if (!audioFile) return res.status(400).json({ error: 'Müzik dosyası gerekli' });
  const id = Date.now().toString();
  const uploadDate = new Date().toISOString();
  try {
    const result = await pool.query(
      'INSERT INTO songs (id, title, artist, description, filename, originalName, uploadDate, plays) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, title || 'Bilinmeyen Şarkı', artist || 'Bilinmeyen Sanatçı', description || '', audioFile.filename, audioFile.originalname, uploadDate, 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Şarkı eklenirken hata oluştu' });
  }
});

// Şarkı sil
app.delete('/api/songs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const songResult = await pool.query('SELECT * FROM songs WHERE id = $1', [id]);
    const song = songResult.rows[0];
    if (!song) return res.status(404).json({ error: 'Şarkı bulunamadı' });
    const filePath = path.join('uploads', song.filename);
    if (fs.existsSync(filePath)) fs.removeSync(filePath);
    await pool.query('DELETE FROM songs WHERE id = $1', [id]);
    res.json({ message: 'Şarkı başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Şarkı silinirken hata oluştu' });
  }
});

// İçerik getir
app.get('/api/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM content LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'İçerik yüklenirken hata oluştu' });
  }
});

// İçerik güncelle
app.put('/api/content', async (req, res) => {
  const { title, description, about, contact } = req.body;
  try {
    await pool.query('UPDATE content SET title = $1, description = $2, about = $3, contact = $4 WHERE id = 1', [title, description, about, contact]);
    const result = await pool.query('SELECT * FROM content WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'İçerik güncellenirken hata oluştu' });
  }
});

// Tema getir
app.get('/api/theme', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM theme LIMIT 1');
    console.log('Tema getirildi:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Tema getirme hatası:', err);
    res.status(500).json({ error: 'Tema yüklenirken hata oluştu' });
  }
});

// Tema güncelle
app.put('/api/theme', async (req, res) => {
  const { title, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, navbarButtonColor } = req.body;
  
  console.log('Tema güncelleme isteği:', req.body);
  
  try {
    const updateResult = await pool.query('UPDATE theme SET title = $1, primaryColor = $2, secondaryColor = $3, accentColor = $4, backgroundColor = $5, textColor = $6, navbarButtonColor = $7 WHERE id = 1',
      [title, primaryColor, secondaryColor, accentColor, backgroundColor, textColor, navbarButtonColor]);
    
    console.log('Update sonucu:', updateResult.rowCount, 'satır güncellendi');
    
    const result = await pool.query('SELECT * FROM theme WHERE id = 1');
    console.log('Güncellenmiş tema:', result.rows[0]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Tema güncelleme hatası:', err);
    res.status(500).json({ error: 'Tema güncellenirken hata oluştu: ' + err.message });
  }
});

// Mesajları getir
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar yüklenirken hata oluştu' });
  }
});

// Mesaj ekle
app.post('/api/messages', async (req, res) => {
  const { name, text } = req.body;
  try {
    const result = await pool.query('INSERT INTO messages (name, text) VALUES ($1, $2) RETURNING *', [name, text]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Mesaj eklenirken hata oluştu' });
  }
});

// Mesaj sil
app.delete('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM messages WHERE id = $1', [id]);
    res.json({ message: 'Mesaj silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj silinirken hata oluştu' });
  }
});

// Şarkı dinleme sayısını artır
app.post('/api/songs/:id/play', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE songs SET plays = plays + 1 WHERE id = $1', [id]);
    const result = await pool.query('SELECT plays FROM songs WHERE id = $1', [id]);
    res.json({ plays: result.rows[0] ? result.rows[0].plays : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Dinleme sayısı güncellenirken hata oluştu' });
  }
});

// Banner getir
app.get('/api/banner', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banner LIMIT 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Banner yüklenirken hata oluştu' });
  }
});

// Banner yükle
app.post('/api/banner', upload.single('banner'), async (req, res) => {
  const bannerFile = req.file;
  if (!bannerFile) return res.status(400).json({ error: 'Banner resmi gerekli' });
  const uploadDate = new Date().toISOString();
  try {
    // Önceki banner'ı sil
    const oldBannerResult = await pool.query('SELECT * FROM banner LIMIT 1');
    const oldBanner = oldBannerResult.rows[0];
    if (oldBanner) {
      const oldFilePath = path.join('uploads/banners', oldBanner.filename);
      if (fs.existsSync(oldFilePath)) fs.removeSync(oldFilePath);
      await pool.query('DELETE FROM banner');
    }
    const result = await pool.query('INSERT INTO banner (filename, originalName, uploadDate) VALUES ($1, $2, $3) RETURNING *',
      [bannerFile.filename, bannerFile.originalname, uploadDate]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Banner yüklenirken hata oluştu' });
  }
});

// Banner sil
app.delete('/api/banner', async (req, res) => {
  try {
    const bannerResult = await pool.query('SELECT * FROM banner LIMIT 1');
    const banner = bannerResult.rows[0];
    if (banner) {
      const filePath = path.join('uploads/banners', banner.filename);
      if (fs.existsSync(filePath)) fs.removeSync(filePath);
    }
    await pool.query('DELETE FROM banner');
    res.json({ message: 'Banner başarıyla silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Banner silinirken hata oluştu' });
  }
});

// Admin giriş kontrolü
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
  }
  try {
    const result = await pool.query('SELECT * FROM admin_users WHERE username = $1 AND password = $2', [username, password]);
    if (result.rows[0]) {
      res.json({ success: true, message: 'Giriş başarılı' });
    } else {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Giriş kontrolü sırasında hata oluştu' });
  }
});

// Production'da React router için catch-all route
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Bir şeyler ters gitti!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Sayfa bulunamadı' });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
}); 