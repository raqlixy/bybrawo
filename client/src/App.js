import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Hakkimda from './pages/Hakkimda';
import ZDefteri from './pages/ZDefteri';
import Iletisim from './pages/Iletisim';
import Admin from './pages/Admin';
import MusicPlayer from './components/MusicPlayer';
import axios from 'axios';

// Backend API için baseURL tanımla
axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [songs, setSongs] = useState([]);
  const [content, setContent] = useState({});
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(new Audio());
  const [messages, setMessages] = useState([]);
  const [theme, setTheme] = useState({ 
    title: 'ByBrawo', 
    primaryColor: '#FFD600',
    secondaryColor: '#FFA500',
    accentColor: '#FF6B35',
    backgroundColor: '#1a0d0d',
    textColor: '#FFFFFF'
  });
  const [banner, setBanner] = useState(null);
  const location = useLocation();

  // RGB renk değiştirme efekti için state
  const [glitchColor, setGlitchColor] = useState({ r: 255, g: 0, b: 0 });

  useEffect(() => {
    fetchSongs();
    fetchContent();
    fetchTheme();
    fetchMessages();
    fetchBanner();
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = 'var(--theme-background)';
  }, [theme.backgroundColor]);

  // RGB renk değiştirme efekti
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchColor({
        r: Math.floor(Math.random() * 256),
        g: Math.floor(Math.random() * 256),
        b: Math.floor(Math.random() * 256)
      });
    }, 100); // Her 100ms'de renk değişir

    return () => clearInterval(interval);
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await axios.get('/api/songs');
      setSongs(response.data);
    } catch (error) {
      console.error('Şarkılar yüklenirken hata:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await axios.get('/api/content');
      setContent(response.data);
    } catch (error) {
      console.error('İçerik yüklenirken hata:', error);
    }
  };

  const fetchTheme = async () => {
    try {
      const response = await axios.get('/api/theme');
      setTheme(response.data);
      // Tema renkleri CSS değişkenlerine uygulanır
      document.documentElement.style.setProperty('--theme-primary', response.data.primaryColor || '#FFD600');
      document.documentElement.style.setProperty('--theme-secondary', response.data.secondaryColor || '#FFA500');
      document.documentElement.style.setProperty('--theme-accent', response.data.accentColor || '#FF6B35');
      document.documentElement.style.setProperty('--theme-background', response.data.backgroundColor || '#1a0d0d');
      document.documentElement.style.setProperty('--theme-text', response.data.textColor || '#FFFFFF');
      document.documentElement.style.setProperty('--theme-navbar-button', response.data.navbarButtonColor || '#7ecbff');
    } catch (error) {
      console.error('Tema yüklenirken hata:', error);
    }
  };

  const fetchBanner = async () => {
    try {
      const response = await axios.get('/api/banner');
      setBanner(response.data);
    } catch (error) {
      console.error('Banner yüklenirken hata:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
    }
  };

  // Admin panelinden güncellemeler sonrası tekrar fetch etsin diye fonksiyonlar
  const handleThemeUpdate = async (newTheme) => {
    const themeToSend = {
      title: newTheme.title || '',
      primaryColor: newTheme.primaryColor || '',
      secondaryColor: newTheme.secondaryColor || '',
      accentColor: newTheme.accentColor || '',
      backgroundColor: newTheme.backgroundColor || '',
      textColor: newTheme.textColor || '',
      navbarButtonColor: newTheme.navbarButtonColor || ''
    };
    await axios.put('/api/theme', themeToSend);
    fetchTheme();
  };
  const handleBannerUpdate = () => fetchBanner();
  const handleMessagesUpdate = () => fetchMessages();
  const handleSongsUpdate = () => fetchSongs();
  const handleContentUpdate = () => fetchContent();

  const playSong = (song) => {
    if (currentSong && currentSong.id === song.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      audio.src = `${axios.defaults.baseURL}/uploads/${song.filename}`;
      audio.play();
      setCurrentSong(song);
      setIsPlaying(true);
      axios.post(`/api/songs/${song.id}/play`);
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)`,
        backgroundColor: 'var(--theme-background)',
        minHeight: '100vh',
        '--theme-color': theme.primaryColor
      }}
    >
      {location.pathname !== '/admin' && <Navbar theme={theme} banner={banner} />}
      <Routes>
        <Route path="/" element={<Home songs={songs} content={content} onPlaySong={playSong} currentSong={currentSong} isPlaying={isPlaying} theme={theme} />} />
        <Route path="/hakkimda" element={<Hakkimda content={content} />} />
        <Route path="/zdefteri" element={<ZDefteri messages={messages} onMessagesChange={handleMessagesUpdate} />} />
        <Route path="/iletisim" element={<Iletisim content={content} />} />
        <Route path="/admin" element={<Admin
          songs={songs} setSongs={setSongs} onSongsChange={handleSongsUpdate}
          content={content} setContent={setContent} onContentChange={handleContentUpdate}
          messages={messages} setMessages={setMessages} onMessagesChange={handleMessagesUpdate}
          theme={theme} setTheme={setTheme} onThemeChange={handleThemeUpdate}
          banner={banner} onBannerChange={handleBannerUpdate}
        />} />
      </Routes>
      {currentSong && (
        <MusicPlayer
          song={currentSong}
          isPlaying={isPlaying}
          onPlayPause={() => playSong(currentSong)}
          audio={audio}
        />
      )}
      
      {/* Coded by raqlixy yazısı - RGB bozulma efekti ile */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: `
            0 0 5px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.8),
            0 0 10px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.6),
            0 0 15px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.4)
          `,
          color: `rgb(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b})`,
          animation: 'glitch 0.3s infinite',
          userSelect: 'none'
        }}
      >
        coded by{' '}
        <a 
          href="https://instagram.com/raqlixy" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: `rgb(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b})`,
            textDecoration: 'none',
            cursor: 'pointer',
            textShadow: `
              0 0 5px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.8),
              0 0 10px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.6),
              0 0 15px rgba(${glitchColor.r}, ${glitchColor.g}, ${glitchColor.b}, 0.4)
            `,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          raqlixy
        </a>
      </div>

      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-1px, 1px);
          }
          40% {
            transform: translate(-1px, -1px);
          }
          60% {
            transform: translate(1px, 1px);
          }
          80% {
            transform: translate(1px, -1px);
          }
          100% {
            transform: translate(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App; 