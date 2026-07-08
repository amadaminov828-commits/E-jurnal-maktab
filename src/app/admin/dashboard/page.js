import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = checkAdminSession();
  const schoolId = admin.schoolId;

  // 1. Fetch Basic Counts
  const [classesCount, teachersCount, studentsCount, subjectsCount] = await Promise.all([
    prisma.class.count({ where: { schoolId } }),
    prisma.teacher.count({ where: { schoolId } }),
    prisma.student.count({ where: { schoolId } }),
    prisma.subject.count({ where: { schoolId } }),
  ]);

  // 2. Fetch All Students and Class Data
  const classes = await prisma.class.findMany({
    where: { schoolId },
    include: {
      students: {
        include: {
          attendance: true,
          grades: true,
        },
      },
    },
  });

  // Calculate stats
  let totalAttendanceRecords = 0;
  let presentOrLateWeighted = 0;
  let totalGradeValue = 0;
  let totalGradesCount = 0;

  const classStats = classes.map((c) => {
    let classAttCount = 0;
    let classAttWeighted = 0;
    let classGradeSum = 0;
    let classGradeCount = 0;

    c.students.forEach((student) => {
      // Attendance
      student.attendance.forEach((att) => {
        classAttCount++;
        totalAttendanceRecords++;
        if (att.status === 'PRESENT') {
          classAttWeighted += 1.0;
          presentOrLateWeighted += 1.0;
        } else if (att.status === 'LATE') {
          classAttWeighted += 0.5;
          presentOrLateWeighted += 0.5;
        }
      });

      // Grades
      student.grades.forEach((g) => {
        classGradeSum += g.value;
        classGradeCount++;
        totalGradeValue += g.value;
        totalGradesCount++;
      });
    });

    const attRate = classAttCount > 0 ? (classAttWeighted / classAttCount) * 100 : 100;
    const avgGrade = classGradeCount > 0 ? classGradeSum / classGradeCount : 0;

    return {
      id: c.id,
      name: c.name,
      studentsCount: c.students.length,
      attendanceRate: attRate.toFixed(1),
      averageGrade: avgGrade.toFixed(1),
    };
  });

  const overallAttendanceRate =
    totalAttendanceRecords > 0 ? (presentOrLateWeighted / totalAttendanceRecords) * 100 : 100;
  const overallAverageGrade = totalGradesCount > 0 ? totalGradeValue / totalGradesCount : 0;

  // 3. Fetch Recent Audit Logs
  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 5,
  });

  return (
    <div className="animate-fade">
      <div className="page-header">
        <h1 className="page-title">Boshqaruv paneli</h1>
        <p className="page-subtitle">Markazning umumiy statistikalari va holati</p>
      </div>

      {/* Grid Cards */}
      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        <div className="card card-glow">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Sinflar
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '8px 0 4px 0' }}>
            {classesCount}
          </div>
          <span className="badge badge-primary">Faol guruhlar</span>
        </div>

        <div className="card card-glow" style={{ '--primary': '#10b981' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            O'quvchilar
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '8px 0 4px 0' }}>
            {studentsCount}
          </div>
          <span className="badge badge-success">Jami o'quvchilar</span>
        </div>

        <div className="card card-glow" style={{ '--primary': '#f59e0b' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            O'rtacha Davomat
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '8px 0 4px 0' }}>
            {overallAttendanceRate.toFixed(1)}%
          </div>
          <span className={`badge ${overallAttendanceRate >= 85 ? 'badge-success' : 'badge-warning'}`}>
            {overallAttendanceRate >= 85 ? 'Yuqori davomat' : 'Kutulganidan past'}
          </span>
        </div>

        <div className="card card-glow" style={{ '--primary': '#818cf8' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            O'rtacha Baho
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '8px 0 4px 0' }}>
            {overallAverageGrade > 0 ? overallAverageGrade.toFixed(2) : '0.00'}
          </div>
          <span className="badge badge-primary">5 ballik shkalada</span>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: '32px' }}>
        {/* Class stats */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '20px' }}>
            Sinflar bo'yicha statistika
          </h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sinf nomi</th>
                  <th>O'quvchilar soni</th>
                  <th>Davomat</th>
                  <th>O'rtacha Baho</th>
                </tr>
              </thead>
              <tbody>
                {classStats.length > 0 ? (
                  classStats.map((cs) => (
                    <tr key={cs.id}>
                      <td style={{ fontWeight: 600 }}>{cs.name}</td>
                      <td>{cs.studentsCount} ta</td>
                      <td style={{ fontWeight: 600 }} className={Number(cs.attendanceRate) >= 85 ? 'status-present' : 'status-late'}>
                        {cs.attendanceRate}%
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {Number(cs.averageGrade) > 0 ? cs.averageGrade : 'Baho yo\'q'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Sinflar mavjud emas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '20px' }}>
            So'nggi harakatlar tarixi (Audit Log)
          </h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Harakat</th>
                  <th>Element</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <span className={`badge ${log.userRole === 'ADMIN' ? 'badge-primary' : 'badge-warning'}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{log.action}</td>
                      <td>{log.entity}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Harakatlar tarixi bo'sh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
