import React, { useState } from 'react';
import axios from 'axios';

const ZDefteri = ({ messages, onMessagesChange }) => {
  const [form, setForm] = useState({ name: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name && form.text) {
      await axios.post('/api/messages', { name: form.name, text: form.text });
      setForm({ name: '', text: '' });
      onMessagesChange();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 md:px-0" style={{ background: 'repeating-linear-gradient(0deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px), repeating-linear-gradient(90deg, #2d1a1a 0px, #2d1a1a 1px, transparent 1px, transparent 32px)', backgroundColor: 'var(--theme-background)', minHeight: '100vh' }}>
      <div className="w-full max-w-2xl bg-black/80 rounded-2xl p-4 sm:p-8 shadow-2xl border-4 border-theme mb-12 flex flex-col items-center justify-center text-center" style={{ marginTop: '7rem' }}>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-theme mb-4" style={{ fontFamily: 'cursive', textShadow: '2px 2px 8px #000' }}>Ziyaretçi Defteri</h2>
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col space-y-2">
          <input type="text" placeholder="Adınız" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)', border: '1.5px solid var(--theme-secondary)', padding: '12px' }}
            className="rounded focus:outline-none text-lg sm:text-xl transition-shadow focus:shadow-lg placeholder-theme-text" />
          <textarea placeholder="Mesajınız" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })}
            style={{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text)', border: '1.5px solid var(--theme-secondary)', minHeight: '100px', resize: 'vertical', padding: '12px' }}
            className="rounded focus:outline-none text-lg sm:text-xl transition-shadow focus:shadow-lg placeholder-theme-text" rows={3} />
          <button type="submit"
            style={{ backgroundColor: 'var(--theme-navbar-button)', color: 'var(--theme-text)' }}
            className="font-bold px-4 py-3 rounded transition text-lg sm:text-xl"
          >Gönder</button>
        </form>
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} 
              style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-text)', border: '1.5px solid var(--theme-secondary)' }}
              className="rounded px-4 py-3 text-lg sm:text-xl mb-2">
              <span className="font-bold" style={{ color: 'var(--theme-text)' }}>{msg.name}:</span> {msg.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ZDefteri; 