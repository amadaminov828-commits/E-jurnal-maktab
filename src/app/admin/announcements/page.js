'use client';

import { useState, useEffect } from 'react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements');
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!text.trim()) return;

    setSending(true);
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('E\'lon muvaffaqiyatli saqlandi va barcha ota-onalarga jo\'natildi!');
        setText('');
        fetchAnnouncements();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">📢 Markaz e'lonlari</h1>
        <p className="page-subtitle">Barcha ulangan ota-onalarning Telegram botiga umumiy xabarlar jo'natish</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          {success}
        </div>
      )}

      <div className="grid-cols-3">
        {/* Post Announcement Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yangi e'lon yuborish</h2>
          <form onSubmit={handlePost}>
            <div className="form-group">
              <label className="form-label" htmlFor="announceMatn">E'lon matni</label>
              <textarea
                id="announceMatn"
                rows="6"
                className="form-input"
                style={{ resize: 'vertical' }}
                placeholder="E'lon matnini bu yerga yozing..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={sending}
            >
              {sending ? 'Yuborilmoqda...' : 'E\'lonni yuborish 🚀'}
            </button>
          </form>
        </div>

        {/* Announcements List */}
        <div className="card col-span-2">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yuborilgan e'lonlar tarixi</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {announcements.length > 0 ? (
                announcements.map((announce) => (
                  <div 
                    key={announce.id} 
                    style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 'var(--radius-sm)', 
                      border: '1px solid var(--border-color)' 
                    }}
                  >
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {announce.text}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Yuborilgan vaqt: {new Date(announce.createdAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>
                  Hali hech qanday e'lon yuborilmagan.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
