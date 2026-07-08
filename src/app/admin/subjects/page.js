'use client';

import { useState, useEffect } from 'react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/admin/subjects');
      const data = await res.json();
      if (res.ok) {
        setSubjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Fan muvaffaqiyatli qo\'shildi!');
        setName('');
        fetchSubjects();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setEditName(s.name);
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/admin/subjects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Fan nomi o\'zgartirildi');
        setEditId(null);
        fetchSubjects();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatdan ham ushbu fanni o\'chirmoqchimisiz? Tizimdan dars jadvali, davomat va baholar ham o\'chirilishi mumkin!')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Fan o\'chirildi');
        fetchSubjects();
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
        <h1 className="page-title">📚 Fanlar ro'yxati</h1>
        <p className="page-subtitle">O'quv markazidagi o'qitiladigan fanlar ro'yxatini boshqarish</p>
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
        {/* Add Subject Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yangi fan qo'shish</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label" htmlFor="subjectName">Fan nomi</label>
              <input
                id="subjectName"
                type="text"
                className="form-input"
                placeholder="Masalan: Matematika, Fizika"
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

        {/* Subjects List Card */}
        <div className="card col-span-2">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Mavjud fanlar</h2>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fan nomi</th>
                    <th>Qo'shilgan sana</th>
                    <th style={{ textAlign: 'right' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.length > 0 ? (
                    subjects.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {editId === s.id ? (
                            <input
                              type="text"
                              className="form-input"
                              style={{ padding: '6px 12px', fontSize: '0.9rem', maxWidth: '200px' }}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{s.name}</span>
                          )}
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {new Date(s.createdAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {editId === s.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleUpdate(s.id)}
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
                                onClick={() => handleEdit(s)}
                                className="btn btn-ghost"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                ✏️ Tahrirlash
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
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
                        Fanlar kiritilmagan. Avval fan qo'shing.
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
