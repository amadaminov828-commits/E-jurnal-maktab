'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ReportsPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [quarter, setQuarter] = useState('all'); // 'all', '1', '2', '3', '4'

  useEffect(() => {
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
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleFetchReport = async (classId) => {
    if (!classId) {
      setReportData(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?classId=${classId}`);
      const data = await res.json();
      if (res.ok) {
        setReportData(data);
      } else {
        alert(data.error || 'Hisobotni yuklashda xatolik');
      }
    } catch (err) {
      console.error(err);
      alert('Kutilmagan xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (attendanceList) => {
    if (!attendanceList || attendanceList.length === 0) return 100;
    
    let weightedCount = 0;
    attendanceList.forEach((att) => {
      if (att.status === 'PRESENT') weightedCount += 1.0;
      else if (att.status === 'LATE') weightedCount += 0.5;
    });
    
    return ((weightedCount / attendanceList.length) * 100).toFixed(0);
  };

  const calculateAverageGrade = (grades, subjectId) => {
    const filtered = grades.filter(g => g.subjectId === subjectId);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, curr) => acc + curr.value, 0);
    return (sum / filtered.length).toFixed(1);
  };

  const getQuarterGrade = (quarterResults, subjectId, qNum) => {
    // qNum is 1, 2, 3, 4
    const res = quarterResults.find(r => r.subjectId === subjectId && r.quarter === qNum);
    return res ? res.finalGrade : '-';
  };

  const exportToExcel = () => {
    if (!reportData) return;
    const { students, subjects, class: cls } = reportData;

    const data = students.map((s) => {
      const row = {
        'O\'quvchi': `${s.lastName} ${s.firstName}`,
        'ID Kod': s.uniqueCode,
        'Davomat (%)': `${calculateAttendanceRate(s.attendance)}%`,
      };

      subjects.forEach((sub) => {
        row[`${sub.name} (O'rtacha)`] = Number(calculateAverageGrade(s.grades, sub.id)) || '-';
        row[`${sub.name} (1-Chorak)`] = getQuarterGrade(s.quarterResults, sub.id, 1);
        row[`${sub.name} (2-Chorak)`] = getQuarterGrade(s.quarterResults, sub.id, 2);
        row[`${sub.name} (3-Chorak)`] = getQuarterGrade(s.quarterResults, sub.id, 3);
        row[`${sub.name} (4-Chorak)`] = getQuarterGrade(s.quarterResults, sub.id, 4);
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Choraklik Hisobot');
    XLSX.writeFile(wb, `Hisobot_${cls.name}.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData) return;
    const { students, subjects, class: cls } = reportData;

    const doc = new jsPDF({ orientation: 'landscape' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(16);
    doc.text(`E-Jurnal choraklik hisoboti - Sinf: ${cls.name}`, 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Sana: ${new Date().toLocaleDateString('uz-UZ')}`, 14, 22);

    const headers = [['O\'quvchi', 'ID Kod', 'Davomat', ...subjects.map(s => s.name)]];
    const rows = students.map((s) => {
      return [
        `${s.lastName} ${s.firstName}`,
        s.uniqueCode,
        `${calculateAttendanceRate(s.attendance)}%`,
        ...subjects.map((sub) => {
          const avg = calculateAverageGrade(s.grades, sub.id);
          const q1 = getQuarterGrade(s.quarterResults, sub.id, 1);
          const q2 = getQuarterGrade(s.quarterResults, sub.id, 2);
          const q3 = getQuarterGrade(s.quarterResults, sub.id, 3);
          const q4 = getQuarterGrade(s.quarterResults, sub.id, 4);

          let display = avg > 0 ? avg : '-';
          if (q1 !== '-' || q2 !== '-' || q3 !== '-' || q4 !== '-') {
            display += ` [Q1:${q1} Q2:${q2} Q3:${q3} Q4:${q4}]`;
          }
          return display;
        })
      ];
    });

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Hisobot_${cls.name}.pdf`);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">📄 Hisobotlar eksporti</h1>
        <p className="page-subtitle">Sinflar kesimida davomat, o'rtacha baho va chorak yakuniy baholarini yuklab olish</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0, minWidth: '220px' }}>
            <label className="form-label" htmlFor="classFilter">Sinf / Guruh</label>
            {loadingClasses ? (
              <p>Yuklanmoqda...</p>
            ) : (
              <select
                id="classFilter"
                className="form-select"
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  handleFetchReport(e.target.value);
                }}
              >
                <option value="">Sinfni tanlang</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>

          {reportData && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={exportToExcel} className="btn btn-success">
                🟢 Excel Yuklash (.xlsx)
              </button>
              <button onClick={exportToPDF} className="btn btn-primary">
                🔴 PDF Yuklash (.pdf)
              </button>
            </div>
          )}
        </div>
      </div>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Hisobot shakllantirilmoqda...</p>}

      {reportData && (
        <div className="card animate-fade">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '20px' }}>
            Guruh hisoboti: {reportData.class.name}
          </h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>O'quvchi F.I.SH</th>
                  <th>ID Kod</th>
                  <th>Davomat (%)</th>
                  {reportData.subjects.map((sub) => (
                    <th key={sub.id}>{sub.name} (Avg / Choraklar)</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.students.length > 0 ? (
                  reportData.students.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600 }}>
                        {student.lastName} {student.firstName}
                      </td>
                      <td>
                        <code>{student.uniqueCode}</code>
                      </td>
                      <td 
                        style={{ fontWeight: 600 }}
                        className={Number(calculateAttendanceRate(student.attendance)) >= 85 ? 'status-present' : 'status-late'}
                      >
                        {calculateAttendanceRate(student.attendance)}%
                      </td>
                      {reportData.subjects.map((sub) => {
                        const avg = calculateAverageGrade(student.grades, sub.id);
                        const q1 = getQuarterGrade(student.quarterResults, sub.id, 1);
                        const q2 = getQuarterGrade(student.quarterResults, sub.id, 2);
                        const q3 = getQuarterGrade(student.quarterResults, sub.id, 3);
                        const q4 = getQuarterGrade(student.quarterResults, sub.id, 4);

                        return (
                          <td key={sub.id} style={{ fontSize: '0.85rem' }}>
                            <div style={{ fontWeight: 600 }}>
                              Avg: {avg > 0 ? avg : '-'}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                              Q1:{q1} Q2:{q2} Q3:{q3} Q4:{q4}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3 + reportData.subjects.length} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Sinfda o'quvchilar yo'q.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
