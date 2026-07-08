import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';
import { notifyGrade } from '@/lib/notifier';

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
    const grades = await prisma.grade.findMany({
      where: {
        subjectId,
        quarter,
        student: { classId }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(grades);
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
    const body = await request.json();

    // Check if it is a batch import (contains grades array)
    if (body.grades && Array.isArray(body.grades)) {
      const { grades, subjectId, classId, topic, quarter: quarterStr } = body;

      if (!subjectId || !classId || !quarterStr) {
        return NextResponse.json({ error: 'Parametrlar yetarli emas' }, { status: 400 });
      }

      const quarter = parseInt(quarterStr, 10);

      // Verify teacher assignment
      const assignment = await prisma.teacherSubjectClass.findFirst({
        where: { teacherId: teacher.id, classId, subjectId }
      });

      if (!assignment) {
        return NextResponse.json({ error: 'Siz ushbu darsga biriktirilmagansiz' }, { status: 403 });
      }

      const createdGrades = [];

      for (const item of grades) {
        const { studentId, value } = item;
        if (!studentId || !value) continue;

        // Verify student class
        const student = await prisma.student.findFirst({
          where: { id: studentId, classId }
        });

        if (!student) continue;

        // Create grade
        const grade = await prisma.grade.create({
          data: {
            studentId,
            subjectId,
            teacherId: teacher.id,
            value: parseInt(value, 10),
            topic: topic || null,
            quarter,
          }
        });

        await logAction(teacher.id, 'TEACHER', 'ADD_GRADE', 'GRADE', grade.id, {
          student: `${student.firstName} ${student.lastName}`,
          value,
          quarter
        });

        // Send Telegram Notification
        try {
          await notifyGrade(prisma, grade.id);
        } catch (botErr) {
          console.error("Bot notification error:", botErr);
        }
        
        createdGrades.push(grade);
      }

      return NextResponse.json({ success: true, count: createdGrades.length, grades: createdGrades });
    }

    // Fallback: Single grade creation (original code)
    const { studentId, subjectId, classId, value, topic, quarter: quarterStr } = body;

    if (!studentId || !subjectId || !classId || !value || !quarterStr) {
      return NextResponse.json({ error: 'Barcha maydonlarni to\'ldiring' }, { status: 400 });
    }

    const quarter = parseInt(quarterStr, 10);

    // Verify teacher assignment
    const assignment = await prisma.teacherSubjectClass.findFirst({
      where: { teacherId: teacher.id, classId, subjectId }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Siz ushbu darsga biriktirilmagansiz' }, { status: 403 });
    }

    // Verify student class
    const student = await prisma.student.findFirst({
      where: { id: studentId, classId }
    });

    if (!student) {
      return NextResponse.json({ error: 'O\'quvchi ushbu sinfga tegishli emas' }, { status: 400 });
    }

    // Create grade
    const grade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        teacherId: teacher.id,
        value: parseInt(value, 10),
        topic: topic || null,
        quarter,
      }
    });

    await logAction(teacher.id, 'TEACHER', 'ADD_GRADE', 'GRADE', grade.id, {
      student: `${student.firstName} ${student.lastName}`,
      value,
      quarter
    });

    // Send Telegram Notification
    try {
      await notifyGrade(prisma, grade.id);
    } catch (botErr) {
      console.error("Bot notification error:", botErr);
    }

    return NextResponse.json(grade);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
