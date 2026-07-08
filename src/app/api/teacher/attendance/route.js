import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';
import { notifyAttendance } from '@/lib/notifier';

export async function GET(request) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const dateStr = searchParams.get('date');

  if (!classId || !subjectId || !dateStr) {
    return NextResponse.json({ error: 'Parametrlar yetarli emas' }, { status: 400 });
  }

  try {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        subjectId,
        date: targetDate,
        student: { classId }
      }
    });

    return NextResponse.json(attendanceRecords);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { classId, subjectId, date: dateStr, records } = await request.json();

    if (!classId || !subjectId || !dateStr || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumotlar yuborildi' }, { status: 400 });
    }

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    // Verify teacher assignment
    const assignment = await prisma.teacherSubjectClass.findFirst({
      where: { teacherId: teacher.id, classId, subjectId }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Siz ushbu darsga biriktirilmagansiz' }, { status: 403 });
    }

    const savedRecords = [];

    for (const rec of records) {
      const { studentId, status } = rec; // status is "PRESENT", "ABSENT", "LATE"

      // Check if student belongs to class
      const student = await prisma.student.findFirst({
        where: { id: studentId, classId }
      });

      if (!student) continue;

      // Check if record exists to validate 24 hour edit limit
      const existing = await prisma.attendance.findUnique({
        where: {
          studentId_subjectId_date: {
            studentId,
            subjectId,
            date: targetDate
          }
        }
      });

      if (existing) {
        const timeDiff = Date.now() - new Date(existing.createdAt).getTime();
        if (timeDiff > 24 * 60 * 60 * 1000) {
          return NextResponse.json({
            error: `O'quvchi ${student.firstName} uchun davomat kiritilganiga 24 soatdan oshgan. Uni o'zgartirish taqiqlanadi.`
          }, { status: 403 });
        }
      }

      const attendance = await prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId,
            subjectId,
            date: targetDate
          }
        },
        create: {
          studentId,
          subjectId,
          date: targetDate,
          status,
        },
        update: {
          status,
        }
      });

      savedRecords.push(attendance);

      // Trigger Telegram notification
      // Only notify if state changed or newly added. Let's send in background
      notifyAttendance(prisma, attendance.id);
    }

    await logAction(teacher.id, 'TEACHER', 'SAVE_ATTENDANCE', 'ATTENDANCE_BATCH', classId, {
      subjectId,
      date: dateStr,
      count: savedRecords.length
    });

    return NextResponse.json({ success: true, count: savedRecords.length });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
