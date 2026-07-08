import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';
import { sendTelegramMessage } from '@/lib/notifier';

export async function GET(request) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const subjectId = searchParams.get('subjectId');
  const quarterStr = searchParams.get('quarter');

  if (!classId || !subjectId || !quarterStr) {
    return NextResponse.json({ error: 'Parametrlar yetarli emas' }, { status: 400 });
  }

  try {
    const quarter = parseInt(quarterStr, 10);
    const results = await prisma.quarterResult.findMany({
      where: {
        subjectId,
        quarter,
        student: { classId }
      }
    });

    return NextResponse.json(results);
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
    const { studentId, subjectId, quarter: quarterStr, finalGrade, classId } = await request.json();

    if (!studentId || !subjectId || !quarterStr || finalGrade === undefined || !classId) {
      return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 });
    }

    const quarter = parseInt(quarterStr, 10);
    const gradeVal = parseFloat(finalGrade);

    // Verify teacher assignment
    const assignment = await prisma.teacherSubjectClass.findFirst({
      where: { teacherId: teacher.id, classId, subjectId }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Siz ushbu darsga biriktirilmagansiz' }, { status: 403 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parents: {
          include: { parent: true }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'O\'quvchi topilmadi' }, { status: 404 });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    const result = await prisma.quarterResult.upsert({
      where: {
        studentId_subjectId_quarter: {
          studentId,
          subjectId,
          quarter
        }
      },
      create: {
        studentId,
        subjectId,
        quarter,
        finalGrade: gradeVal,
        confirmed: true,
      },
      update: {
        finalGrade: gradeVal,
        confirmed: true,
      }
    });

    await logAction(teacher.id, 'TEACHER', 'CONFIRM_QUARTER_GRADE', 'QUARTER_RESULT', result.id, {
      student: `${student.firstName} ${student.lastName}`,
      subject: subject.name,
      quarter,
      grade: gradeVal
    });

    // Notify parents
    const text = `🏆 <b>Chorak yakuni bahosi!</b>\n\n` +
      `<b>O'quvchi:</b> ${student.firstName} ${student.lastName}\n` +
      `<b>Fan:</b> ${subject.name}\n` +
      `<b>Chorak:</b> ${quarter}-chorak\n` +
      `<b>Yakuniy baho:</b> <b>${gradeVal.toFixed(0)}</b>`;

    for (const link of student.parents) {
      if (link.parent.telegramId) {
        await sendTelegramMessage(link.parent.telegramId, text);
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
