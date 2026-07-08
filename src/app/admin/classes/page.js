'use client';

import { useState, useEffect } from 'react';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      const data = await res.json();
      if (res.ok) {
        setClasses(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleGenerateStandard = async () => {
    if (!confirm("Barcha standart sinflarni (1-A dan 11-B gacha) avtomatik yaratmoqchimisiz? Mavjud sinflar o'zgarmasdan qoladi.")) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/classes/generate-standard', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        fetchClasses();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!confirm("⚠️ DIQQAT! Maktabdagi barcha o'quvchilarni yangi o'quv yiliga (1 sinf yuqoriga) o'tkazmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi!\n\n11-sinf o'quvchilari 'Bitirganlar [Yil]' sinfiga o'tkaziladi.")) return;
    setError('');
    setSuccess('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/classes/promote', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        fetchClasses();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Sinf muvaffaqiyatli qo\'shildi!');
        setName('');
        fetchClasses();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setEditName(c.name);
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Sinf nomi o\'zgartirildi');
        setEditId(null);
        fetchClasses();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatdan ham ushbu sinfni o\'chirmoqchimisiz? O\'quvchilar ham o\'chib ketishi mumkin!')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Sinf o\'chirildi');
        fetchClasses();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">🏫 Sinflar va guruhlar</h1>
        <p className="page-subtitle">O'quv markazi guruhlari va maktab sinflarini boshqarish</p>
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

      {/* Avtomatlashtirilgan amallar paneli */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '4px' }}>Avtomatlashtirilgan amallar</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Standart sinflarni shakllantirish va o'quvchilar sinfini yangi yilga ko'tarish tizimi</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleGenerateStandard}
            className="btn btn-secondary"
            disabled={actionLoading}
            style={{ padding: '10px 16px', fontSize: '0.85rem' }}
          >
            🏫 Standart sinflarni yaratish (1-A dan 11-B gacha)
          </button>
          <button 
            onClick={handlePromote}
            className="btn btn-primary"
            disabled={actionLoading}
            style={{ padding: '10px 16px', fontSize: '0.85rem', background: '#059669' }}
          >
            🔄 Yangi o'quv yiliga o'tkazish
          </button>
        </div>
      </div>

      <div className="grid-cols-3">
        {/* Add Class Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yangi sinf qo'shish</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label" htmlFor="className">Sinf / Guruh nomi</label>
              <input
                id="className"
                type="text"
                className="form-input"
                placeholder="Masalan: 5-A yoki IELTS-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Qo'shish
            </button>
          </form>
        </div>

        {/* Classes List Table */}
        <div className="card col-span-2">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Sinflar ro'yxati</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sinf nomi</th>
                    <th>O'quvchilar soni</th>
                    <th style={{ textAlign: 'right' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length > 0 ? (
                    classes.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {editId === c.id ? (
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '6px 12px', fontSize: '0.9rem', maxWidth: '200px' }}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{c.name}</span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-primary">{c._count?.students || 0} ta o'quvchi</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {editId === c.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleUpdate(c.id)}
                                className="btn btn-success"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                Saqlash
                              </button>
                              <button
                                onClick={() => setEditId(null)}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                Bekor qilish
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEdit(c)}
                                className="btn btn-ghost"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                ✏️ Tahrirlash
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                className="btn btn-danger"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                🗑️ O'chirish
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Sinflar topilmadi. Avval sinf yarating.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
