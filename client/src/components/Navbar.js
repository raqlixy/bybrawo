import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
  { label: 'ANASAYFA', path: '/' },
  { label: 'HAKKIMDA', path: '/hakkimda' },
  { label: 'Z. DEFTERİ', path: '/zdefteri' },
  { label: 'İLETİŞİM', path: '/iletisim' },
];

const Navbar = ({ theme, banner }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Üstte sabit başlık ve banner */}
      <header className="fixed top-0 left-0 w-full z-30 bg-black/80 border-b-4 border-theme-primary shadow-xl flex items-center justify-between px-4 md:px-0" style={{ position: 'relative', minHeight: '80px' }}>
        <div className="relative w-full md:w-auto flex items-center justify-center" style={{ minHeight: '64px' }}>
          {banner && (
            <img
              src={`http://localhost:5000/uploads/banners/${banner.filename}`}
              alt="Banner"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain opacity-80 pointer-events-none select-none"
              style={{ zIndex: 1, maxHeight: '80px' }}
            />
          )}
          <span className="text-3xl md:text-5xl font-extrabold text-theme-primary text-center py-4 tracking-widest w-full md:w-auto" style={{ fontFamily: 'cursive', textShadow: '4px 4px 16px #000', position: 'relative', zIndex: 2 }}>
            {theme?.title || 'ByBrawo'}
          </span>
        </div>
        {/* Hamburger buton sadece mobilde */}
        <button
          style={{ color: 'var(--theme-primary)' }}
          className="md:hidden text-3xl focus:outline-none z-40 hover:opacity-80 transition"
          onClick={() => setOpen(!open)}
          aria-label="Menüyü Aç/Kapat"
        >
          {open ? '✕' : '☰'}
        </button>
      </header>
      {/* Sağda menü (masaüstü) */}
      <aside className="hidden md:flex fixed right-0 top-32 z-20 flex-col items-end pr-6 space-y-4 select-none">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{ backgroundColor: 'var(--theme-navbar-button)', color: 'var(--theme-text)', borderColor: 'var(--theme-primary)', fontFamily: 'cursive', letterSpacing: '2px', textShadow: '2px 2px 8px #000' }}
            className={`w-48 text-right text-lg font-bold tracking-widest py-3 px-6 rounded-l-2xl border-4 shadow-lg hover:opacity-80 transition-all duration-200 ${location.pathname === item.path ? 'border-theme-primary' : ''}`}
          >
            {item.label}
          </Link>
        ))}
        {/* Admin butonu */}
        <Link
          to="/admin"
          style={{ backgroundColor: 'var(--theme-navbar-button)', color: 'var(--theme-text)', borderColor: 'var(--theme-primary)', fontFamily: 'cursive', letterSpacing: '2px', textShadow: '2px 2px 8px #000' }}
          className={`w-48 text-right text-lg font-bold tracking-widest py-3 px-6 rounded-l-2xl border-4 shadow-lg hover:opacity-80 transition-all duration-200 ${location.pathname === '/admin' ? 'border-theme-primary' : ''}`}
        >
          ADMIN
        </Link>
      </aside>
      {/* Mobil menü */}
      {open && (
        <nav className="md:hidden fixed top-20 left-0 w-full bg-black/95 z-30 flex flex-col items-center space-y-4 py-8 animate-fade-in">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              style={{ backgroundColor: 'var(--theme-navbar-button)', color: 'var(--theme-text)', borderColor: 'var(--theme-primary)', fontFamily: 'cursive', letterSpacing: '2px', textShadow: '2px 2px 8px #000' }}
              className={`w-11/12 text-center text-xl font-bold tracking-widest py-3 rounded-2xl border-4 shadow-lg hover:opacity-80 transition-all duration-200 ${location.pathname === item.path ? 'border-theme-primary' : ''}`}
            >
              {item.label}
            </Link>
          ))}
          {/* Admin butonu mobilde */}
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            style={{ backgroundColor: 'var(--theme-navbar-button)', color: 'var(--theme-text)', borderColor: 'var(--theme-primary)', fontFamily: 'cursive', letterSpacing: '2px', textShadow: '2px 2px 8px #000' }}
            className={`w-11/12 text-center text-xl font-bold tracking-widest py-3 rounded-2xl border-4 shadow-lg hover:opacity-80 transition-all duration-200 ${location.pathname === '/admin' ? 'border-theme-primary' : ''}`}
          >
            ADMIN
          </Link>
        </nav>
      )}
      <style>{`
        @media (max-width: 768px) {
          .animate-fade-in {
            animation: fadeIn 0.2s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </>
  );
};

export default Navbar; 