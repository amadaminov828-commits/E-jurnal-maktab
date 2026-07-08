'use client';

import { useState, useEffect } from 'react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // Assign states
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      const [resTeachers, resClasses, resSubjects] = await Promise.all([
        fetch('/api/admin/teachers'),
        fetch('/api/admin/classes'),
        fetch('/api/admin/subjects'),
      ]);
      const teachersData = await resTeachers.json();
      const classesData = await resClasses.json();
      const subjectsData = await resSubjects.json();

      if (resTeachers.ok) setTeachers(teachersData);
      if (resClasses.ok) setClasses(classesData);
      if (resSubjects.ok) setSubjects(subjectsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, login, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('O\'qituvchi muvaffaqiyatli qo\'shildi!');
        setFullName('');
        setPhone('');
        setLogin('');
        setPassword('');
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedTeacherId || !selectedClassId || !selectedSubjectId) {
      setError('Barcha maydonlarni tanlang');
      return;
    }

    try {
      const res = await fetch(`/api/admin/teachers/${selectedTeacherId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClassId, subjectId: selectedSubjectId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Fan/Sinf o\'qituvchiga muvaffaqiyatli biriktirildi!');
        setSelectedClassId('');
        setSelectedSubjectId('');
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleUnassign = async (teacherId, assignmentId) => {
    if (!confirm('Ushbu biriktirishni o\'chirmoqchimisiz?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/teachers/${teacherId}/assignments?assignmentId=${assignmentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Biriktirish o\'chirildi');
        fetchData();
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!confirm('Haqiqatdan ham ushbu o\'qituvchini o\'chirib tashlamoqchimisiz? Barcha darslari bekor bo\'ladi!')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('O\'qituvchi o\'chirildi');
        fetchData();
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
        <h1 className="page-title">👨‍🏫 O'qituvchilar va Biriktirishlar</h1>
        <p className="page-subtitle">O'qituvchilarni ro'yxatga olish hamda sinf/fanlarga biriktirish</p>
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
        {/* Register Teacher */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Yangi o'qituvchi yaratish</h2>
          <form onSubmit={handleAddTeacher}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">To'liq ism-familiyasi</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Masalan: Jamshid Aliyev"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Telefon raqami</label>
              <input
                id="phone"
                type="text"
                className="form-input"
                placeholder="Masalan: +998901234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login">Tizim logini</label>
              <input
                id="login"
                type="text"
                className="form-input"
                placeholder="Masalan: jamshid_t"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Kirish paroli</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Parolni kiriting"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Yaratish
            </button>
          </form>
        </div>

        {/* Assign Subject/Class */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Sinf va fanga biriktirish</h2>
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="form-label" htmlFor="teacherSelect">O'qituvchi</label>
              <select
                id="teacherSelect"
                className="form-select"
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                required
              >
                <option value="">O'qituvchini tanlang</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="classSelect">Sinf / Guruh</label>
              <select
                id="classSelect"
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                <option value="">Sinfni tanlang</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="subjectSelect">Fan</label>
              <select
                id="subjectSelect"
                className="form-select"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                required
              >
                <option value="">Fanni tanlang</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '10px' }}>
              Biriktirish
            </button>
          </form>
        </div>

        {/* Teacher Info and Assignments view */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>Qisqa ko'rsatmalar</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            1. Avval chap tomondagi formadan o'qituvchini ro'yxatga oling.<br/><br/>
            2. So'ngra, o'qituvchiga dars o'tadigan sinfi va fanni markaziy formadan tanlab biriktiring.<br/><br/>
            3. Har bir o'qituvchi faqat o'ziga biriktirilgan sinf va fanga davomat hamda baho qo'ya oladi.
          </p>
        </div>
      </div>

      {/* Teachers List Table */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>O'qituvchilar va ularning darslari</h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Yuklanmoqda...</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>F.I.SH</th>
                  <th>Telefon</th>
                  <th>Login</th>
                  <th>Biriktirilgan guruhlar / fanlar</th>
                  <th style={{ textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.fullName}</td>
                      <td>{t.phone}</td>
                      <td><code>{t.login}</code></td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {t.assignments && t.assignments.length > 0 ? (
                            t.assignments.map((as) => (
                              <span 
                                key={as.id} 
                                className="badge badge-primary" 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', paddingRight: '6px' }}
                              >
                                {as.class.name} &bull; {as.subject.name}
                                <span 
                                  onClick={() => handleUnassign(t.id, as.id)}
                                  style={{ cursor: 'pointer', color: 'var(--danger)', fontWeight: 800, fontSize: '0.75rem', paddingLeft: '4px' }}
                                  title="Biriktirishni o'chirish"
                                >
                                  &times;
                                </span>
                              </span>
                            ))
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dars biriktirilmagan</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteTeacher(t.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          🗑️ O'chirish
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      O'qituvchilar ro'yxatga olinmagan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
