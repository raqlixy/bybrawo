import React from 'react';

const Hakkimda = ({ content }) => (
  <div className="min-h-screen flex flex-col items-center justify-start px-2 md:px-0" style={{ background: 'repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)', backgroundColor: 'var(--theme-background)', minHeight: '100vh' }}>
    <div className="w-full max-w-2xl bg-black/80 rounded-2xl p-4 sm:p-8 shadow-2xl border-4 border-theme mb-12 flex flex-col items-center justify-center text-center" style={{ marginTop: '7rem' }}>
      <h2 className="text-3xl sm:text-4xl font-extrabold text-theme mb-4" style={{ fontFamily: 'cursive', textShadow: '2px 2px 8px #000' }}>Hakkımda</h2>
      <p className="text-theme text-lg sm:text-2xl" style={{ fontFamily: 'cursive' }}>{content.about || 'Buraya kendinizle ilgili bilgileri ekleyebilirsiniz.'}</p>
    </div>
  </div>
);

export default Hakkimda; 