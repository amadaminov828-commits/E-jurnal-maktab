'use client';

import { useState, useEffect } from 'react';

export default function TeacherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // { id, classId, class, subjectId, subject }
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'grades', 'quarterly'
  const [loading, setLoading] = useState(true);

  // Filter/Select states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  // Data states
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [existingAttendance, setExistingAttendance] = useState([]);
  const [gradeLogs, setGradeLogs] = useState([]);
  const [quarterResults, setQuarterResults] = useState([]);

  // Grade Form
  const [gradeVal, setGradeVal] = useState('5');
  const [gradeTopic, setGradeTopic] = useState('');
  const [gradeStudentId, setGradeStudentId] = useState('');
  const [tempGrades, setTempGrades] = useState({}); // { studentId: value }

  // Status Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/teacher/classes');
        const data = await res.json();
        if (res.ok) {
          setAssignments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleSelectAssignment = async (assign) => {
    setSelectedAssignment(assign);
    setError('');
    setSuccess('');
    setStudents([]);
    setGradeLogs([]);
    setAttendanceMap({});
    setTempGrades({});
    setGradeTopic('');

    // Fetch students
    try {
      const res = await fetch(`/api/teacher/students?classId=${assign.classId}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
        // Load data for the default tab
        loadTabData(assign, activeTab, selectedDate, selectedQuarter, data);
      } else {
        setError(data.error || 'O\'quvchilarni yuklab bo\'lmadi');
      }
    } catch (err) {
      setError('Xatolik yuz berdi');
    }
  };

  const loadTabData = async (assign, tab, date, quarter, currentStudents = students) => {
    if (!assign) return;
    setError('');
    setSuccess('');

    try {
      if (tab === 'attendance') {
        const res = await fetch(
          `/api/teacher/attendance?classId=${assign.classId}&subjectId=${assign.subjectId}&date=${date}`
        );
        const data = await res.json();
        if (res.ok) {
          setExistingAttendance(data);
          const attMap = {};
          // Initialize map with existing or default PRESENT
          currentStudents.forEach(s => {
            const found = data.find(r => r.studentId === s.id);
            attMap[s.id] = found ? found.status : 'PRESENT';
          });
          setAttendanceMap(attMap);
        }
      } else if (tab === 'grades') {
        const res = await fetch(
          `/api/teacher/grades?classId=${assign.classId}&subjectId=${assign.subjectId}&quarter=${quarter}`
        );
        const data = await res.json();
        if (res.ok) {
          setGradeLogs(data);
        }
      } else if (tab === 'quarterly') {
        // Fetch confirmed results
        const resResults = await fetch(
          `/api/teacher/quarter-results?classId=${assign.classId}&subjectId=${assign.subjectId}&quarter=${quarter}`
        );
        // Fetch all grades to compute averages
        const resAllGrades = await fetch(
          `/api/teacher/grades?classId=${assign.classId}&subjectId=${assign.subjectId}&quarter=${quarter}`
        );

        const resultsData = await resResults.json();
        const gradesData = await resAllGrades.json();

        if (resResults.ok && resAllGrades.ok) {
          setQuarterResults(resultsData);
          setGradeLogs(gradesData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    loadTabData(selectedAssignment, newTab, selectedDate, selectedQuarter);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    loadTabData(selectedAssignment, 'attendance', date, selectedQuarter);
  };

  const handleQuarterChange = (q) => {
    const parsedQ = parseInt(q, 10);
    setSelectedQuarter(parsedQ);
    loadTabData(selectedAssignment, activeTab, selectedDate, parsedQ);
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setError('');
    setSuccess('');
    const records = Object.keys(attendanceMap).map(studentId => ({
      studentId,
      status: attendanceMap[studentId]
    }));

    try {
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          date: selectedDate,
          records
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Davomat saqlandi va ota-onalarga bot orqali jo\'natildi.');
        loadTabData(selectedAssignment, 'attendance', selectedDate, selectedQuarter);
      } else {
        setError(data.error || 'Davomatni saqlab bo\'lmadi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleSetTempGrade = (studentId, val) => {
    setTempGrades(prev => ({
      ...prev,
      [studentId]: val
    }));
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const gradesList = Object.keys(tempGrades)
      .map(studentId => ({
        studentId,
        value: parseInt(tempGrades[studentId], 10)
      }))
      .filter(item => item.value > 0);

    if (gradesList.length === 0) {
      setError('Kamida bitta o\'quvchiga baho belgilang');
      return;
    }

    try {
      const res = await fetch('/api/teacher/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          topic: gradeTopic,
          quarter: selectedQuarter,
          grades: gradesList
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Baholar saqlandi va ota-onalarga yuborildi!');
        setGradeTopic('');
        setTempGrades({});
        loadTabData(selectedAssignment, 'grades', selectedDate, selectedQuarter);
      } else {
        setError(data.error || 'Baholarni saqlab bo\'lmadi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const handleDeleteGrade = async (id) => {
    if (!confirm('Bahoni o\'chirmoqchimisiz?')) return;
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/teacher/grades/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Baho o\'chirildi');
        loadTabData(selectedAssignment, 'grades', selectedDate, selectedQuarter);
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const computeStudentAverage = (studentId) => {
    const studentGrades = gradeLogs.filter(g => g.studentId === studentId);
    if (studentGrades.length === 0) return 0;
    const sum = studentGrades.reduce((acc, curr) => acc + curr.value, 0);
    return sum / studentGrades.length;
  };

  const handleConfirmQuarterGrade = async (studentId, finalGrade) => {
    setError('');
    setSuccess('');

    if (finalGrade === undefined || isNaN(finalGrade)) {
      alert('Bahoni to\'g\'ri kiriting');
      return;
    }

    try {
      const res = await fetch('/api/teacher/quarter-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          quarter: selectedQuarter,
          finalGrade: parseFloat(finalGrade)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Chorak yakuniy bahosi tasdiqlandi!');
        loadTabData(selectedAssignment, 'quarterly', selectedDate, selectedQuarter);
      } else {
        setError(data.error || 'Xatolik yuz berdi');
      }
    } catch (err) {
      setError('Kutilmagan xatolik yuz berdi');
    }
  };

  const isEditable = (createdAt) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">💼 O'qituvchi ishchi xonasi</h1>
        <p className="page-subtitle">Sinflar va darslarni boshqarish, davomat va baholar jurnali</p>
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

      {/* Select Assignment */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px' }}>Faol darsni tanlang</h2>
        {loading ? (
          <p>Darslar yuklanmoqda...</p>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {assignments.length > 0 ? (
              assignments.map((assign) => (
                <button
                  key={assign.id}
                  onClick={() => handleSelectAssignment(assign)}
                  className={`btn ${selectedAssignment?.id === assign.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                >
                  🏫 {assign.class.name} &bull; 📚 {assign.subject.name}
                </button>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Sizga hech qanday sinf yoki fan biriktirilmagan.</p>
            )}
          </div>
        )}
      </div>

      {selectedAssignment && students.length > 0 && (
        <div className="animate-fade">
          {/* Tabs Menu */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', gap: '8px' }}>
            <button
              onClick={() => handleTabChange('attendance')}
              className="btn btn-ghost"
              style={{
                color: activeTab === 'attendance' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'attendance' ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '0',
                padding: '12px 20px'
              }}
            >
              📅 Davomat belgilash
            </button>
            <button
              onClick={() => handleTabChange('grades')}
              className="btn btn-ghost"
              style={{
                color: activeTab === 'grades' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'grades' ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '0',
                padding: '12px 20px'
              }}
            >
              📝 Baho qo'yish
            </button>
            <button
              onClick={() => handleTabChange('quarterly')}
              className="btn btn-ghost"
              style={{
                color: activeTab === 'quarterly' ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: activeTab === 'quarterly' ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '0',
                padding: '12px 20px'
              }}
            >
              🏆 Chorak yakuni
            </button>
          </div>

          {/* TAB CONTENT: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="card animate-fade">
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  Sana bo'yicha davomat: {selectedAssignment.class.name} &bull; {selectedAssignment.subject.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Sana:</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ padding: '6px 12px', fontSize: '0.9rem', width: 'auto' }}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper" style={{ marginBottom: '24px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>O'quvchi F.I</th>
                      <th style={{ textAlign: 'center' }}>Keldi (PRESENT)</th>
                      <th style={{ textAlign: 'center' }}>Kelmadi (ABSENT)</th>
                      <th style={{ textAlign: 'center' }}>Kechikdi (LATE)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td style={{ fontWeight: 600 }}>{student.lastName} {student.firstName}</td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            checked={attendanceMap[student.id] === 'PRESENT'}
                            onChange={() => handleAttendanceChange(student.id, 'PRESENT')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            checked={attendanceMap[student.id] === 'ABSENT'}
                            onChange={() => handleAttendanceChange(student.id, 'ABSENT')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="radio"
                            name={`att_${student.id}`}
                            checked={attendanceMap[student.id] === 'LATE'}
                            onChange={() => handleAttendanceChange(student.id, 'LATE')}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveAttendance} className="btn btn-primary">
                  Davomatni saqlash va yuborish 💾
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GRADES */}
          {activeTab === 'grades' && (
            <div className="grid-cols-3">
              {/* Baholash jadvali */}
              <div className="card col-span-2">
                <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Guruhni baholash</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Baho qo'yilgan o'quvchilarga avtomatik ravishda Telegram xabar yuboriladi</p>
                  </div>
                  <div>
                    <label className="form-label" style={{ display: 'inline-block', marginRight: '8px' }}>Chorak:</label>
                    <select
                      className="form-select"
                      style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', display: 'inline-block' }}
                      value={selectedQuarter}
                      onChange={(e) => handleQuarterChange(e.target.value)}
                    >
                      <option value="1">1-Chorak</option>
                      <option value="2">2-Chorak</option>
                      <option value="3">3-Chorak</option>
                      <option value="4">4-Chorak</option>
                    </select>
                  </div>
                </div>

                <form onSubmit={handleAddGrade}>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="gradeTopic">Dars mavzusi</label>
                    <input
                      id="gradeTopic"
                      type="text"
                      className="form-input"
                      placeholder="Masalan: Kasrlar ko'paytmasi yoki Present Perfect"
                      value={gradeTopic}
                      onChange={(e) => setGradeTopic(e.target.value)}
                      required
                    />
                  </div>

                  <div className="table-wrapper" style={{ marginBottom: '24px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>O'quvchi F.I</th>
                          <th style={{ textAlign: 'center' }}>Baho belgilash</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id}>
                            <td style={{ fontWeight: 600 }}>{student.lastName} {student.firstName}</td>
                            <td style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              {['2', '3', '4', '5'].map((val) => {
                                const isSelected = tempGrades[student.id] === val;
                                return (
                                  <button
                                    key={val}
                                    type="button"
                                    onClick={() => handleSetTempGrade(student.id, isSelected ? null : val)}
                                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{
                                      padding: 0,
                                      fontSize: '0.9rem',
                                      borderRadius: '50%',
                                      width: '38px',
                                      height: '38px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {val}
                                  </button>
                                );
                              })}
                              {tempGrades[student.id] && (
                                <button
                                  type="button"
                                  onClick={() => handleSetTempGrade(student.id, null)}
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger)' }}
                                >
                                  Bekor
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">
                      Baholarni saqlash va yuborish 💾
                    </button>
                  </div>
                </form>
              </div>

              {/* Baholar tarixi */}
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', marginBottom: '20px' }}>
                  {selectedQuarter}-chorak baholar tarixi
                </h3>
                {gradeLogs.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ushbu chorakda hali baho qo'yilmagan.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                    {gradeLogs.map((log) => {
                      const student = students.find(s => s.id === log.studentId);
                      const name = student ? `${student.lastName} ${student.firstName}` : "Noma'lum o'quvchi";
                      const editable = isEditable(log.createdAt);
                      return (
                        <div 
                          key={log.id} 
                          style={{ 
                            padding: '12px', 
                            background: 'rgba(255,255,255,0.02)', 
                            borderRadius: 'var(--radius-sm)', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Mavzu: {log.topic || '-'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {new Date(log.date).toLocaleDateString('uz-UZ')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span 
                              className="badge" 
                              style={{ 
                                background: log.value >= 4 ? 'var(--success-light)' : (log.value === 3 ? 'var(--warning-light)' : 'var(--danger-light)'),
                                color: log.value >= 4 ? 'var(--success)' : (log.value === 3 ? 'var(--warning)' : 'var(--danger)'),
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                padding: '6px 10px'
                              }}
                            >
                              {log.value}
                            </span>
                            {editable ? (
                              <button
                                onClick={() => handleDeleteGrade(log.id)}
                                className="btn btn-ghost"
                                style={{ padding: '4px', color: 'var(--danger)', fontSize: '0.9rem' }}
                                title="O'chirish"
                              >
                                🗑️
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }} title="Tahrirlash muddati 24 soat o'tgan">🔒</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: QUARTERLY RESULTS */}
          {activeTab === 'quarterly' && (
            <div className="card animate-fade">
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  Chorak yakuniy baholarini tasdiqlash
                </h3>
                <select
                  className="form-select"
                  style={{ padding: '6px 12px', fontSize: '0.9rem', width: 'auto' }}
                  value={selectedQuarter}
                  onChange={(e) => handleQuarterChange(e.target.value)}
                >
                  <option value="1">1-Chorak</option>
                  <option value="2">2-Chorak</option>
                  <option value="3">3-Chorak</option>
                  <option value="4">4-Chorak</option>
                </select>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>O'quvchi F.I.SH</th>
                      <th>O'rtacha joriy bahosi</th>
                      <th>Choraklik yakuniy baho (Kiritish)</th>
                      <th>Holati</th>
                      <th style={{ textAlign: 'right' }}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const avg = computeStudentAverage(student.id);
                      const existingResult = quarterResults.find(r => r.studentId === student.id);
                      
                      // We can pre-fill input with rounded average or existing final grade
                      const initialFinal = existingResult ? existingResult.finalGrade : (avg > 0 ? Math.round(avg) : '');

                      return (
                        <tr key={student.id}>
                          <td style={{ fontWeight: 600 }}>{student.lastName} {student.firstName}</td>
                          <td style={{ fontWeight: 600 }}>
                            {avg > 0 ? avg.toFixed(2) : 'Baho yo\'q'}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="2"
                              max="5"
                              defaultValue={initialFinal}
                              id={`final_${student.id}`}
                              className="form-input"
                              style={{ padding: '6px 12px', fontSize: '0.9rem', maxWidth: '100px' }}
                              disabled={existingResult?.confirmed}
                            />
                          </td>
                          <td>
                            {existingResult?.confirmed ? (
                              <span className="badge badge-success">Tasdiqlangan ✅</span>
                            ) : (
                              <span className="badge badge-warning">Kutilmoqda ⏳</span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                const inputVal = document.getElementById(`final_${student.id}`).value;
                                handleConfirmQuarterGrade(student.id, inputVal);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              disabled={existingResult?.confirmed}
                            >
                              Tasdiqlash 🏆
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
