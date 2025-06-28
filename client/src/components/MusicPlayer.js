import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const MusicPlayer = ({ song, isPlaying, onPlayPause, audio }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const updateVolume = () => setVolume(audio.volume);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('volumechange', updateVolume);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('volumechange', updateVolume);
    };
  }, [audio]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audio.currentTime = newTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    audio.volume = newVolume;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Şarkı Bilgisi */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {song.title.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-white font-semibold">{song.title}</h3>
            <p className="text-white/60 text-sm">{song.artist}</p>
          </div>
        </div>

        {/* Kontroller */}
        <div className="flex items-center space-x-4">
          <button 
            style={{ color: 'var(--theme-primary)' }}
            className="hover:opacity-80 transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onPlayPause}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-1" />}
          </button>
          
          <button 
            style={{ color: 'var(--theme-primary)' }}
            className="hover:opacity-80 transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <span className="text-white/60 text-sm w-12">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleSeek}
            className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
          <span className="text-white/60 text-sm w-12">{formatTime(duration)}</span>
        </div>

        {/* Ses Kontrolü */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-white/60" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer; 