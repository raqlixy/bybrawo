import React from 'react';
import { Play, Heart, Eye, Download, Pause } from 'lucide-react';

const Home = ({ songs, content, onPlaySong, currentSong, isPlaying }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 md:px-0" style={{ background: 'repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)', backgroundColor: 'var(--theme-background)', minHeight: '100vh' }}>
      {/* Başlık */}
      <div className="text-center mb-8 w-full flex flex-col items-center justify-center" style={{ marginTop: '7rem' }}>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-theme drop-shadow-lg tracking-widest break-words" style={{ fontFamily: 'cursive', textShadow: '4px 4px 16px #000' }}>
          {content.title || 'ByBrawo'}
        </h1>
        <p className="text-lg sm:text-2xl md:text-3xl text-theme mt-2 px-2 md:px-0" style={{ textShadow: '2px 2px 8px #000' }}>
          {content.description || 'Official Web Site'}
        </p>
      </div>
      {/* Şarkı Listesi ve Oynatıcı */}
      <div className="w-full max-w-2xl bg-black/80 rounded-2xl p-4 sm:p-8 shadow-2xl border-4 border-theme mb-12">
        <h2 className="text-xl sm:text-2xl font-bold text-theme mb-4" style={{ fontFamily: 'cursive' }}>Şarkılar</h2>
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-theme text-lg">Henüz şarkı yok</div>
          </div>
        ) : (
          <ul className="space-y-2">
            {songs.map((song, i) => (
              <li key={song.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 rounded-lg ${currentSong?.id === song.id ? 'bg-red-900/80' : 'hover:bg-theme/40'} transition-all`}>
                <span className="text-theme font-semibold text-base sm:text-lg" style={{ fontFamily: 'cursive' }}>{String(i+1).padStart(2, '0')}. {song.title} <span className="text-theme">{song.artist && `- ${song.artist}`}</span></span>
                <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
                  <button onClick={() => onPlaySong(song)} 
                    style={{ backgroundColor: currentSong?.id === song.id && isPlaying ? 'var(--theme-primary)' : 'var(--theme-accent)', color: 'var(--theme-text)' }}
                    className="px-4 py-2 rounded font-bold shadow text-base sm:text-lg hover:opacity-80 transition flex items-center justify-center"
                    title={currentSong?.id === song.id && isPlaying ? 'Duraklat' : 'Dinle'}>
                    {currentSong?.id === song.id && isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <a href={`http://localhost:5000/uploads/${song.filename}`} download={song.originalName || song.title + '.mp3'}
                    style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)' }}
                    className="px-4 py-2 rounded font-bold shadow text-base sm:text-lg flex items-center gap-1 hover:opacity-80 transition"
                    title="Şarkıyı indir">
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const SongCard = ({ song, onPlay, isCurrentSong, isPlaying }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white truncate">{song.title}</h3>
          <p className="text-white/60 text-sm">{song.artist}</p>
        </div>
        <button
          onClick={onPlay}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCurrentSong && isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isCurrentSong && isPlaying ? (
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          ) : (
            <Play className="w-4 h-4 text-white ml-1" />
          )}
        </button>
      </div>

      {song.description && (
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{song.description}</p>
      )}

      <div className="flex items-center justify-between text-sm text-white/40">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4" />
            <span>{song.plays || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4" />
            <span>0</span>
          </div>
        </div>
        <span>{new Date(song.uploadDate).toLocaleDateString('tr-TR')}</span>
      </div>
    </div>
  );
};

export default Home; 