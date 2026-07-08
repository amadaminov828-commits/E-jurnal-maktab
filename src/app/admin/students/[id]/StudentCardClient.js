'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function StudentCardClient({ student, grades, attendance }) {
  const [activeYear, setActiveYear] = useState('');

  // 1. Group Data by Academic Year
  const groupedData = useMemo(() => {
    const data = {};

    const getAcademicYear = (dateStr) => {
      const d = new Date(dateStr);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    };

    const getReconstructedClass = (currentClassName, academicYear) => {
      if (!currentClassName) return 'Noma\'lum';

      const now = new Date();
      const nowMonth = now.getMonth() + 1;
      const nowYear = now.getFullYear();
      const currentAcademicYear = nowMonth >= 9 ? `${nowYear}-${nowYear + 1}` : `${nowYear - 1}-${nowYear}`;

      const startYearD = parseInt(academicYear.split('-')[0], 10);
      const startYearNow = parseInt(currentAcademicYear.split('-')[0], 10);
      const diff = startYearNow - startYearD;

      // Check if standard active class, e.g., "5-A"
      const matchActive = currentClassName.match(/^(\d+)-(.*)$/);
      if (matchActive) {
        const G = parseInt(matchActive[1], 10);
        const S = matchActive[2];
        const reconstructedGrade = G - diff;
        return reconstructedGrade > 0 ? `${reconstructedGrade}-${S}` : 'Maktabgacha';
      }

      // Check if graduated class, e.g., "Bitirganlar 2026-A"
      const matchGrad = currentClassName.match(/^Bitirganlar (\d+)-(.*)$/);
      if (matchGrad) {
        const gradYear = parseInt(matchGrad[1], 10);
        const S = matchGrad[2];
        const gradAcademicYearStart = gradYear - 1; // graduated in summer of gradYear
        const diffGrad = gradAcademicYearStart - startYearD;
        const reconstructedGrade = 11 - diffGrad;
        return reconstructedGrade > 0 && reconstructedGrade <= 11 
          ? `${reconstructedGrade}-${S}` 
          : (reconstructedGrade > 11 ? 'Bitirgan' : 'Maktabgacha');
      }

      return currentClassName;
    };

    // Group Grades
    grades.forEach((g) => {
      const year = getAcademicYear(g.date);
      if (!data[year]) {
        data[year] = {
          academicYear: year,
          className: getReconstructedClass(student.class?.name, year),
          subjects: {},
          totalGradesCount: 0,
          totalGradesValue: 0,
          totalAttendance: { present: 0, late: 0, absent: 0 }
        };
      }

      const subId = g.subjectId;
      if (!data[year].subjects[subId]) {
        data[year].subjects[subId] = {
          id: subId,
          name: g.subject.name,
          grades: [],
          attendance: { present: 0, late: 0, absent: 0 }
        };
      }

      data[year].subjects[subId].grades.push(g.value);
      data[year].totalGradesCount++;
      data[year].totalGradesValue += g.value;
    });

    // Group Attendance
    attendance.forEach((a) => {
      const year = getAcademicYear(a.date);
      if (!data[year]) {
        data[year] = {
          academicYear: year,
          className: getReconstructedClass(student.class?.name, year),
          subjects: {},
          totalGradesCount: 0,
          totalGradesValue: 0,
          totalAttendance: { present: 0, late: 0, absent: 0 }
        };
      }

      const subId = a.subjectId;
      if (!data[year].subjects[subId]) {
        data[year].subjects[subId] = {
          id: subId,
          name: a.subject.name,
          grades: [],
          attendance: { present: 0, late: 0, absent: 0 }
        };
      }

      if (a.status === 'PRESENT') {
        data[year].subjects[subId].attendance.present++;
        data[year].totalAttendance.present++;
      } else if (a.status === 'LATE') {
        data[year].subjects[subId].attendance.late++;
        data[year].totalAttendance.late++;
      } else if (a.status === 'ABSENT') {
        data[year].subjects[subId].attendance.absent++;
        data[year].totalAttendance.absent++;
      }
    });

    // Sort academic years descending
    const sortedKeys = Object.keys(data).sort((a, b) => b.localeCompare(a));
    const sortedData = {};
    sortedKeys.forEach(k => {
      sortedData[k] = data[k];
    });

    return sortedData;
  }, [student, grades, attendance]);

  // Set default active year if not set
  const yearKeys = Object.keys(groupedData);
  const currentActiveYear = activeYear || (yearKeys.length > 0 ? yearKeys[0] : '');

  // Calculate Overall Statistics
  const overallStats = useMemo(() => {
    let totalGradeVal = 0;
    let totalGradesCnt = 0;
    let attPresent = 0;
    let attLate = 0;
    let attTotal = 0;

    grades.forEach(g => {
      totalGradeVal += g.value;
      totalGradesCnt++;
    });

    attendance.forEach(a => {
      attTotal++;
      if (a.status === 'PRESENT') attPresent++;
      else if (a.status === 'LATE') attLate++;
    });

    const avg = totalGradesCnt > 0 ? (totalGradeVal / totalGradesCnt).toFixed(2) : '0.00';
    const attRate = attTotal > 0 ? (((attPresent + attLate * 0.5) / attTotal) * 100).toFixed(0) : '100';

    return { avg, attRate };
  }, [grades, attendance]);

  // Handle PDF Generation
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const primaryColor = [79, 70, 229];

    // Header Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("O'QUVCHI SHAXSIY ARXIV KARTOCHKASI", 14, 20);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(14, 25, 196, 25);

    // Student Info Section
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    
    doc.setFont('Helvetica', 'bold');
    doc.text("Foydalanuvchi ma'lumotlari:", 14, 34);
    
    doc.setFont('Helvetica', 'normal');
    doc.text(`F.I.SH: ${student.lastName} ${student.firstName}`, 14, 42);
    doc.text(`ID KODI: ${student.uniqueCode}`, 14, 48);
    doc.text(`Sinf (Joriy): ${student.class?.name || 'Sinfiz'}`, 14, 54);
    doc.text(`Tug'ilgan sana: ${student.birthDate ? new Date(student.birthDate).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}`, 14, 60);

    // Parent Info
    doc.setFont('Helvetica', 'bold');
    doc.text("Ota-ona ma'lumotlari:", 110, 34);
    doc.setFont('Helvetica', 'normal');
    if (student.parents && student.parents.length > 0) {
      const parent = student.parents[0].parent;
      doc.text(`Ismi: ${parent.fullName || 'Kiritilmagan'}`, 110, 42);
      doc.text(`Tel: ${parent.phone || 'Kiritilmagan'}`, 110, 48);
    } else {
      doc.text("Ota-ona ma'lumotlari mavjud emas.", 110, 42);
    }

    // Overall metrics
    doc.setFont('Helvetica', 'bold');
    doc.text(`Umumiy O'rtacha Baho: ${overallStats.avg}`, 14, 70);
    doc.text(`Umumiy Davomat Foizi: ${overallStats.attRate}%`, 110, 70);

    doc.line(14, 75, 196, 75);

    let startY = 82;

    // Print each Academic Year Report
    Object.keys(groupedData).forEach((yearKey) => {
      const yearData = groupedData[yearKey];
      
      // Page Break if needed
      if (startY > 230) {
        doc.addPage();
        startY = 20;
      }

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text(`${yearData.academicYear} o'quv yili (Sinf: ${yearData.className})`, 14, startY);
      
      const yearAvg = yearData.totalGradesCount > 0 ? (yearData.totalGradesValue / yearData.totalGradesCount).toFixed(2) : '0.00';
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`O'quv yili o'rtacha bahosi: ${yearAvg}`, 14, startY + 6);

      const headers = [["Fan nomi", "Baholari", "O'rtacha baho", "Davomat"]];
      const rows = Object.keys(yearData.subjects).map((subId) => {
        const sub = yearData.subjects[subId];
        const subAvg = sub.grades.length > 0 ? (sub.grades.reduce((a,b)=>a+b, 0) / sub.grades.length).toFixed(1) : '-';
        
        const attTotal = sub.attendance.present + sub.attendance.late + sub.attendance.absent;
        const attRate = attTotal > 0 ? `${(((sub.attendance.present + sub.attendance.late * 0.5) / attTotal) * 100).toFixed(0)}%` : '100%';

        return [
          sub.name,
          sub.grades.join(', ') || '-',
          subAvg,
          attRate
        ];
      });

      doc.autoTable({
        head: headers,
        body: rows,
        startY: startY + 10,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: primaryColor },
        margin: { left: 14, right: 14 }
      });

      startY = doc.lastAutoTable.finalY + 15;
    });

    doc.save(`Arxiv_Kartochka_${student.uniqueCode}.pdf`);
  };

  return (
    <div className="animate-fade">
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/admin/students" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              ⬅️ Orqaga
            </Link>
            <span className="badge badge-primary">ID Kod: {student.uniqueCode}</span>
            {student.class?.name.startsWith('Bitirganlar') ? (
              <span className="badge badge-danger">Bitiruvchi / Arxiv</span>
            ) : (
              <span className="badge badge-success">Faol o'quvchi</span>
            )}
          </div>
          <h1 className="page-title">{student.lastName} {student.firstName}</h1>
          <p className="page-subtitle">O'quvchining to'liq maktab davridagi arxiv ko'rsatkichlari kartochkasi</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPDF} style={{ background: '#059669' }}>
          📄 Arxiv kartasini PDF yuklash
        </button>
      </div>

      {/* Grid: Basic Profiles & Metrics */}
      <div className="grid-cols-3" style={{ marginBottom: '32px' }}>
        {/* Info card */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Shaxsiy ma'lumotlar
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tug'ilgan sana</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.birthDate ? new Date(student.birthDate).toLocaleDateString('uz-UZ') : 'Kiritilmagan'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Joriy sinfi</span>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {student.class?.name || 'Sinfiz'}
              </div>
            </div>
          </div>
        </div>

        {/* Parent card */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Bog'langan ota-onalar
          </h3>
          {student.parents && student.parents.length > 0 ? (
            student.parents.map((pLink) => (
              <div key={pLink.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>F.I.SH</span>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{pLink.parent.fullName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Telefon raqam / Telegram</span>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    {pLink.parent.phone} {pLink.parent.telegramId ? '🟢 Ulanishgan' : '🔴 Kutmoqda'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ota-ona ma'lumotlari kiritilmagan.</p>
          )}
        </div>

        {/* Overall Score & Attendance */}
        <div className="card card-glow" style={{ '--primary': '#10b981' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Umumiy ko'rsatkichlar
          </h3>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', height: '100%', paddingBottom: '20px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>O'rtacha Baho</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '8px 0' }}>
                {overallStats.avg}
              </div>
              <span className="badge badge-primary">5 ballikda</span>
            </div>
            <div style={{ width: '1px', height: '50px', background: 'var(--border-color)' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Umumiy Davomat</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: '8px 0' }}>
                {overallStats.attRate}%
              </div>
              <span className="badge badge-success">Foizda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Transcript History */}
      {yearKeys.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>O'quvchi bo'yicha hech qanday baho yoki davomat ma'lumoti topilmadi.</p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {/* Year Select Tabs (Sidebar List) */}
          <div className="card" style={{ gridColumn: 'span 1', height: 'fit-content' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
              O'quv yillarini tanlang
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {yearKeys.map((yearKey) => {
                const isActive = yearKey === currentActiveYear;
                return (
                  <button
                    key={yearKey}
                    onClick={() => setActiveYear(yearKey)}
                    className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'space-between', padding: '12px 16px', fontSize: '0.9rem' }}
                  >
                    <span>📅 {yearKey} o'quv yili</span>
                    <span className="badge badge-primary" style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '' }}>
                      Sinf: {groupedData[yearKey].className}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transcript Details Sheet */}
          {currentActiveYear && (
            <div className="card col-span-2">
              <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                    Tafsilotlar: {currentActiveYear} o'quv yili
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    O'quvchi ushbu yilda <strong>{groupedData[currentActiveYear].className}</strong> sinfida o'qigan
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '16px', textAlign: 'right' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Yillik o'rtacha</span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {groupedData[currentActiveYear].totalGradesCount > 0 
                        ? (groupedData[currentActiveYear].totalGradesValue / groupedData[currentActiveYear].totalGradesCount).toFixed(2) 
                        : '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fan nomi</th>
                      <th>Baholari</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>O'rtacha baho</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Davomat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(groupedData[currentActiveYear].subjects).map((subId) => {
                      const subjectData = groupedData[currentActiveYear].subjects[subId];
                      const subAvg = subjectData.grades.length > 0 
                        ? (subjectData.grades.reduce((a,b)=>a+b, 0) / subjectData.grades.length).toFixed(1) 
                        : '0.0';

                      const attTotal = subjectData.attendance.present + subjectData.attendance.late + subjectData.attendance.absent;
                      const attRate = attTotal > 0 
                        ? (((subjectData.attendance.present + subjectData.attendance.late * 0.5) / attTotal) * 100).toFixed(0) 
                        : '100';

                      return (
                        <tr key={subId}>
                          <td style={{ fontWeight: 600 }}>{subjectData.name}</td>
                          <td style={{ letterSpacing: '2px', wordBreak: 'break-all' }}>
                            {subjectData.grades.map((val, idx) => (
                              <span 
                                key={idx} 
                                style={{ 
                                  marginRight: '6px',
                                  color: val >= 4 ? 'var(--success)' : (val === 3 ? 'var(--warning)' : 'var(--danger)'),
                                  fontWeight: 600
                                }}
                              >
                                {val}
                              </span>
                            ))}
                            {subjectData.grades.length === 0 && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700 }}>
                            {subAvg !== '0.0' ? subAvg : '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span 
                              className={`badge ${parseInt(attRate) >= 85 ? 'badge-success' : (parseInt(attRate) >= 70 ? 'badge-warning' : 'badge-danger')}`}
                              title={`Keldi: ${subjectData.attendance.present}, Kechikdi: ${subjectData.attendance.late}, Kelmadi: ${subjectData.attendance.absent}`}
                            >
                              {attRate}%
                            </span>
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
