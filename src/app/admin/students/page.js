'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [classId, setClassId] = useState('');
  
  // Optional parent fields
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Edit states
  const [editId, setEditId] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editClassId, setEditClassId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const fetchData = async () => {
    try {
      const [resStudents, resClasses] = await Promise.all([
        fetch('/api/admin/students'),
        fetch('/api/admin/classes'),
      ]);
      const studentsData = await resStudents.json();
      const classesData = await resClasses.json();

      if (resStudents.ok) setStudents(studentsData);
      if (resClasses.ok) setClasses(classesData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          classId,
          parentName,
          parentPhone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('O\'quvchi muvaffaqiyatli qo\'shildi!');
        setFirstName('');
        setLastName('');
        setBirthDate('');
        setClassId('');
        setParentName('');
        setParentPhone('');
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setEditFirstName(s.firstName);
    setEditLastName(s.lastName);
    setEditBirthDate(s.birthDate ? s.birthDate.split('T')[0] : '');
    setEditClassId(s.classId);
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName,
          lastName: editLastName,
          birthDate: editBirthDate,
          classId: editClassId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('O\'quvchi ma\'lumotlari yangilandi');
        setEditId(null);
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Haqiqatdan ham ushbu o\'quvchini tizimdan o\'chirmoqchimisiz? Uning barcha baho va davomatlari ham o\'chib ketadi!')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('O\'quvchi o\'chirildi');
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || student.uniqueCode.toLowerCase().includes(query);

    const matchesClass = selectedClassFilter === '' || student.classId === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">🎓 O'quvchilar Ro'yxati</h1>
        <p className="page-subtitle">O'quvchilarni ro'yxatga olish, guruhlarga ajratish va ID kodlarini boshqarish</p>
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

      <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
        {/* Add Student Card */}
        <div className="card animate-fade" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yangi o'quvchi qo'shish</h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label" htmlFor="first_name">Ismi</label>
              <input
                id="first_name"
                type="text"
                className="form-input"
                placeholder="Alisher"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="last_name">Familiyasi</label>
              <input
                id="last_name"
                type="text"
                className="form-input"
                placeholder="Karimov"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="birth_date">Tug'ilgan sanasi</label>
              <input
                id="birth_date"
                type="date"
                className="form-input"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="studentClass">Sinf / Guruh</label>
              <select
                id="studentClass"
                className="form-select"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                <option value="">Sinfni tanlang</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ margin: '24px 0 16px 0', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                Ota-ona ma'lumotlari (Majburiy emas)
              </h3>
              <div className="form-group">
                <label className="form-label" htmlFor="p_name">Ota-ona F.I.SH</label>
                <input
                  id="p_name"
                  type="text"
                  className="form-input"
                  placeholder="Karim Karimov"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="p_phone">Telefon raqami</label>
                <input
                  id="p_phone"
                  type="text"
                  className="form-input"
                  placeholder="Masalan: +998901234567"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Qo'shish
            </button>
          </form>
        </div>

        {/* Students List */}
        <div className="card col-span-2">
          <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0 }}>O'quvchilar ro'yxati</h2>
            
            {/* Qidiruv va Filter paneli */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', marginTop: '10px' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ism, familiya yoki ID kod bo'yicha qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ width: '180px' }}>
                <select
                  className="form-select"
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="">Barcha sinflar</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>O'quvchi F.I</th>
                    <th>Sinf</th>
                    <th>ID Kod</th>
                    <th>Ota-ona & Telefon</th>
                    <th style={{ textAlign: 'right' }}>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {editId === s.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                              />
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                              />
                            </div>
                          ) : (
                            <span style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</span>
                          )}
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Tug'ilgan sana: {s.birthDate ? new Date(s.birthDate).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}
                          </div>
                        </td>
                        <td>
                          {editId === s.id ? (
                            <select
                              className="form-select"
                              style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto' }}
                              value={editClassId}
                              onChange={(e) => setEditClassId(e.target.value)}
                            >
                              {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="badge badge-primary">{s.class?.name || 'Sinfiz'}</span>
                          )}
                        </td>
                        <td>
                          <code style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, color: '#f43f5e' }}>
                            {s.uniqueCode}
                          </code>
                        </td>
                        <td>
                          {s.parents && s.parents.length > 0 ? (
                            s.parents.map((link) => (
                              <div key={link.id} style={{ fontSize: '0.9rem' }}>
                                <strong>{link.parent.fullName}</strong>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {link.parent.phone} {link.parent.telegramId ? '🟢 Telegram' : '🔴 Kutmoqda'}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Bog'lanmagan</span>
                          )}
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
                                Bekor
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <Link
                                href={`/admin/students/${s.id}`}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                🔍 Profil
                              </Link>
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
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Hech qanday o'quvchi topilmadi
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
