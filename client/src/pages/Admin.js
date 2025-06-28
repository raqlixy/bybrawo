import React, { useState } from 'react';
import axios from 'axios';
import { LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const TABS = [
  { key: 'theme', label: 'Tema' },
  { key: 'banner', label: 'Banner' },
  { key: 'songs', label: 'Şarkılar' },
  { key: 'content', label: 'İçerik' },
  { key: 'zdefteri', label: 'Z Defteri' },
];

const Admin = ({ songs, setSongs, onSongsChange, content, setContent, onContentChange, messages, setMessages, onMessagesChange, theme, setTheme, onThemeChange, banner, onBannerChange }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [tab, setTab] = useState('theme');
  const [songForm, setSongForm] = useState({ title: '', artist: '', description: '', file: null });
  const [contentForm, setContentForm] = useState(content);
  const [themeForm, setThemeForm] = useState({
    ...theme,
    navbarButtonColor: theme.navbarButtonColor || '#7ecbff',
    textboxBgColor: theme.textboxBgColor || '#23203a',
    cardBgColor: theme.cardBgColor || '#18162a',
    borderColor: theme.borderColor || '#7ecbff',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Giriş kontrolü - SQL veritabanından
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/login', {
        username: login.username,
        password: login.password
      });
      
      if (response.data.success) {
        setLoggedIn(true);
        setError('');
        setSuccess('Giriş başarılı!');
      }
    } catch (err) {
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Giriş yapılırken hata oluştu!');
      }
    }
    setLoading(false);
  };

  // Şarkı ekle
  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!songForm.title || !songForm.artist || !songForm.file) {
      setError('Tüm şarkı alanlarını doldurun!');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', songForm.file);
      formData.append('title', songForm.title);
      formData.append('artist', songForm.artist);
      formData.append('description', songForm.description);
      await axios.post('/api/songs', formData);
      setSongForm({ title: '', artist: '', description: '', file: null });
      setSuccess('Şarkı başarıyla eklendi!');
      setError('');
      onSongsChange();
    } catch (err) {
      setError('Şarkı eklenirken hata oluştu!');
    }
    setLoading(false);
  };

  // Şarkı sil
  const handleDeleteSong = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/songs/${id}`);
      setSuccess('Şarkı silindi!');
      setError('');
      onSongsChange();
    } catch (err) {
      setError('Şarkı silinirken hata oluştu!');
    }
    setLoading(false);
  };

  // İçerik güncelle
  const handleContentSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/content', contentForm);
      setSuccess('İçerik güncellendi!');
      setError('');
      onContentChange();
    } catch (err) {
      setError('İçerik güncellenirken hata oluştu!');
    }
    setLoading(false);
  };

  // Tema güncelle
  const handleThemeSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onThemeChange({
        title: themeForm.title || '',
        primaryColor: themeForm.primaryColor || '#7ecbff',
        secondaryColor: themeForm.secondaryColor || '#b3e0ff',
        accentColor: themeForm.accentColor || '#7ecbff',
        backgroundColor: themeForm.backgroundColor || '#1a1036',
        textColor: themeForm.textColor || '#FFFFFF',
        navbarButtonColor: themeForm.navbarButtonColor || '#7ecbff',
        textboxBgColor: themeForm.textboxBgColor || '#23203a',
        cardBgColor: themeForm.cardBgColor || '#18162a',
        borderColor: themeForm.borderColor || '#7ecbff',
      });
      setSuccess('Tema güncellendi!');
      setError('');
    } catch (err) {
      setError('Tema güncellenirken hata oluştu!');
    }
    setLoading(false);
  };

  // Banner yükle
  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!bannerFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('banner', bannerFile);
    formData.append('type', 'banner');
    try {
      await axios.post('/api/banner', formData);
      setBannerFile(null);
      setSuccess('Banner yüklendi!');
      setError('');
      onBannerChange();
    } catch (err) {
      setError('Banner yüklenirken hata oluştu!');
    }
    setLoading(false);
  };

  // Banner sil
  const handleBannerDelete = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/banner');
      setSuccess('Banner silindi!');
      setError('');
      onBannerChange();
    } catch (err) {
      setError('Banner silinirken hata oluştu!');
    }
    setLoading(false);
  };

  // Z Defteri yorumu sil (API)
  const handleDeleteMessage = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/messages/${id}`);
      setSuccess('Mesaj silindi!');
      setError('');
      onMessagesChange();
    } catch (err) {
      setError('Mesaj silinirken hata oluştu!');
    }
    setLoading(false);
  };

  // Tab değişince formları güncelle
  React.useEffect(() => {
    setContentForm(content);
  }, [content]);
  React.useEffect(() => {
    setThemeForm(theme);
    // Arka planı güncel tema rengine göre ayarla
    document.body.style.backgroundColor = theme.backgroundColor || '#1a0d0d';
  }, [theme]);

  // Otomatik başarı mesajı temizle
  React.useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // Otomatik hata mesajı temizle
  React.useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start px-2 md:px-0" style={{ background: 'repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)', backgroundColor: 'var(--theme-background)', minHeight: '100vh' }}>
        <div className="fixed top-0 left-0 w-full z-50">
          <Navbar theme={theme} banner={banner} />
        </div>
        <div className="w-full max-w-2xl bg-black/80 rounded-2xl p-8 shadow-2xl border-4 border-theme mb-12 flex flex-col items-center" style={{ marginTop: '7rem' }}>
          <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col space-y-4">
            <h2 className="text-3xl font-bold text-yellow-200 text-center mb-2">Admin Girişi</h2>
            <input type="text" placeholder="Kullanıcı Adı" value={login.username} onChange={e => setLogin({ ...login, username: e.target.value })} 
              style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }}
              className="rounded px-3 py-3 placeholder-yellow-400 focus:outline-none text-lg" />
            <input type="password" placeholder="Şifre" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} 
              style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }}
              className="rounded px-3 py-3 placeholder-yellow-400 focus:outline-none text-lg" />
            <button type="submit" 
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' }}
              className="font-bold px-4 py-3 rounded transition text-lg hover:opacity-80 disabled:opacity-50" disabled={loading}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
            {error && <div className="text-red-400 text-center flex items-center justify-center gap-2"><AlertCircle className="w-5 h-5" />{error}</div>}
            {success && <div className="text-green-400 text-center flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />{success}</div>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 md:px-0" style={{ background: 'repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)', backgroundColor: 'var(--theme-background)', minHeight: '100vh' }}>
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar theme={theme} banner={banner} />
      </div>
      <div className="w-full max-w-2xl bg-black/80 rounded-2xl p-4 sm:p-8 shadow-2xl border-4 border-theme mb-12" style={{ marginTop: '7rem' }}>
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} 
              style={{ backgroundColor: tab===t.key ? 'var(--theme-primary)' : 'var(--theme-accent)', color: 'var(--theme-text)' }}
              className="px-4 py-2 rounded font-bold transition">{t.label}</button>
          ))}
          <button onClick={() => setLoggedIn(false)} 
            style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)' }}
            className="ml-auto px-4 py-2 rounded font-bold flex items-center gap-2 hover:opacity-80 transition"><LogOut className="w-4 h-4" />Çıkış</button>
        </div>
        {(success || error) && (
          <div className={`mb-4 flex items-center gap-2 px-4 py-2 rounded ${success ? 'bg-green-700 text-white' : 'bg-red-700 text-white'}`}>
            {success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {success || error}
          </div>
        )}
        {/* Tema Ayarları */}
        {tab === 'theme' && (
          <form onSubmit={handleThemeSave} className="flex flex-col space-y-4">
            <h3 className="text-2xl font-bold text-theme">Tema Ayarları</h3>
            <label className="text-theme">Başlık
              <input type="text" value={themeForm.title || ''} onChange={e => setThemeForm({ ...themeForm, title: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="block w-full rounded px-3 py-2 mt-1" />
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="text-theme">Ana Renk
                <input type="color" value={themeForm.primaryColor || '#7ecbff'} onChange={e => setThemeForm({ ...themeForm, primaryColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
              <label className="text-theme">İkincil Renk
                <input type="color" value={themeForm.secondaryColor || '#b3e0ff'} onChange={e => setThemeForm({ ...themeForm, secondaryColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
              <label className="text-theme">Vurgu Rengi
                <input type="color" value={themeForm.accentColor || '#7ecbff'} onChange={e => setThemeForm({ ...themeForm, accentColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
              <label className="text-theme">Arka Plan
                <input type="color" value={themeForm.backgroundColor || '#1a1036'} onChange={e => setThemeForm({ ...themeForm, backgroundColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
              <label className="text-theme">Metin
                <input type="color" value={themeForm.textColor || '#FFFFFF'} onChange={e => setThemeForm({ ...themeForm, textColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
              <label className="text-theme">Navbar Buton Rengi
                <input type="color" value={themeForm.navbarButtonColor || '#7ecbff'} onChange={e => setThemeForm({ ...themeForm, navbarButtonColor: e.target.value })} className="block w-16 h-10 mt-1" />
              </label>
            </div>
            <button type="submit" 
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' }}
              className="font-bold px-4 py-2 rounded transition disabled:opacity-50 hover:opacity-80" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </form>
        )}
        {/* Banner Yönetimi */}
        {tab === 'banner' && (
          <div className="flex flex-col space-y-4">
            <h3 className="text-2xl font-bold text-theme">Banner Yönetimi</h3>
            <div className="flex flex-col space-y-2">
              <button onClick={handleBannerDelete} 
                style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)' }}
                className="font-bold px-4 py-2 rounded transition" disabled={loading}>{loading ? 'Siliniyor...' : 'Bannerı Sil'}</button>
            </div>
            <form onSubmit={handleBannerUpload} className="flex flex-col space-y-2">
              <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files[0])} className="rounded px-3 py-2 bg-yellow-900 text-theme" />
              <button type="submit" disabled={!bannerFile || loading} 
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' }}
                className="font-bold px-4 py-2 rounded transition disabled:opacity-50 hover:opacity-80">{loading ? 'Yükleniyor...' : 'Banner Yükle'}</button>
            </form>
          </div>
        )}
        {/* Şarkı Yönetimi */}
        {tab === 'songs' && (
          <div>
            <h3 className="text-2xl font-bold text-theme mb-4">Şarkı Yönetimi</h3>
            <form onSubmit={handleAddSong} className="flex flex-col space-y-2 mb-6">
              <input type="text" placeholder="Şarkı Adı" value={songForm.title} onChange={e => setSongForm({ ...songForm, title: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="rounded px-3 py-2" />
              <input type="text" placeholder="Sanatçı" value={songForm.artist} onChange={e => setSongForm({ ...songForm, artist: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="rounded px-3 py-2" />
              <input type="text" placeholder="Açıklama" value={songForm.description} onChange={e => setSongForm({ ...songForm, description: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="rounded px-3 py-2" />
              <input type="file" accept="audio/*" onChange={e => setSongForm({ ...songForm, file: e.target.files[0] })} className="rounded px-3 py-2 bg-yellow-900 text-theme" />
              <button type="submit" 
                style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' }}
                className="font-bold px-4 py-2 rounded transition disabled:opacity-50 hover:opacity-80" disabled={loading}>{loading ? 'Ekleniyor...' : 'Şarkı Ekle'}</button>
            </form>
            <ul className="space-y-2">
              {songs.map((song, i) => (
                <li key={song.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 rounded-lg bg-yellow-900/30">
                  <span className="text-theme font-semibold text-base sm:text-lg">{String(i+1).padStart(2, '0')}. {song.title} <span className="text-theme-400">{song.artist && `- ${song.artist}`}</span></span>
                  <button onClick={() => handleDeleteSong(song.id)} 
                    style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)' }}
                    className="mt-2 sm:mt-0 sm:ml-4 px-4 py-2 rounded font-bold shadow text-base sm:text-lg hover:opacity-80 disabled:opacity-50" disabled={loading}>{loading ? 'Siliniyor...' : 'Sil'}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* İçerik Yönetimi */}
        {tab === 'content' && (
          <form onSubmit={handleContentSave} className="flex flex-col space-y-4">
            <h3 className="text-2xl font-bold text-theme">İçerik Yönetimi</h3>
            <label className="text-theme">Başlık
              <input type="text" value={contentForm.title || ''} onChange={e => setContentForm({ ...contentForm, title: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="block w-full rounded px-3 py-2 mt-1" />
            </label>
            <label className="text-theme">Açıklama
              <input type="text" value={contentForm.description || ''} onChange={e => setContentForm({ ...contentForm, description: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="block w-full rounded px-3 py-2 mt-1" />
            </label>
            <label className="text-theme">Hakkında
              <textarea value={contentForm.about || ''} onChange={e => setContentForm({ ...contentForm, about: e.target.value })} 
                style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)', border: '1.5px solid var(--theme-accent)', minHeight: '100px', resize: 'vertical', padding: '12px' }}
                className="block w-full rounded mt-1 focus:outline-none focus:shadow-lg transition-shadow" rows={3} />
            </label>
            <label className="text-theme">İletişim
              <input type="text" value={contentForm.contact || ''} onChange={e => setContentForm({ ...contentForm, contact: e.target.value })} style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)' }} className="block w-full rounded px-3 py-2 mt-1" />
            </label>
            <button type="submit" 
              style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text)' }}
              className="font-bold px-4 py-2 rounded transition disabled:opacity-50 hover:opacity-80" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
          </form>
        )}
        {/* Z Defteri Yönetimi */}
        {tab === 'zdefteri' && (
          <div>
            <h3 className="text-2xl font-bold text-theme mb-4">Ziyaretçi Defteri</h3>
            <ul className="space-y-2">
              {messages.map((msg) => (
                <li key={msg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 rounded-lg bg-yellow-900/30">
                  <span className="text-theme text-base sm:text-lg"><span className="font-bold text-theme">{msg.name}:</span> {msg.text}</span>
                  <button onClick={() => handleDeleteMessage(msg.id)} 
                    style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)' }}
                    className="mt-2 sm:mt-0 sm:ml-4 px-4 py-2 rounded font-bold shadow text-base sm:text-lg hover:opacity-80 disabled:opacity-50" disabled={loading}>{loading ? 'Siliniyor...' : 'Sil'}</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 