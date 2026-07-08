import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function POST(request, { params }) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const teacherId = params.id;
    const { classId, subjectId } = await request.json();

    if (!classId || !subjectId) {
      return NextResponse.json({ error: 'Sinf va fanni tanlang' }, { status: 400 });
    }

    const [teacher, cls, subject] = await Promise.all([
      prisma.teacher.findFirst({ where: { id: teacherId, schoolId: admin.schoolId } }),
      prisma.class.findFirst({ where: { id: classId, schoolId: admin.schoolId } }),
      prisma.subject.findFirst({ where: { id: subjectId, schoolId: admin.schoolId } }),
    ]);

    if (!teacher || !cls || !subject) {
      return NextResponse.json({ error: 'Noto\'g\'ri ma\'lumotlar yuborildi' }, { status: 400 });
    }

    const existing = await prisma.teacherSubjectClass.findFirst({
      where: { teacherId, classId, subjectId }
    });

    if (existing) {
      return NextResponse.json({ error: 'O\'qituvchi allaqachon ushbu guruhga biriktirilgan' }, { status: 400 });
    }

    const assignment = await prisma.teacherSubjectClass.create({
      data: {
        teacherId,
        classId,
        subjectId,
      },
      include: {
        class: true,
        subject: true,
      }
    });

    await logAction(admin.id, 'ADMIN', 'ASSIGN_TEACHER', 'TEACHER_ASSIGNMENT', assignment.id, {
      teacher: teacher.fullName,
      class: cls.name,
      subject: subject.name,
    });

    return NextResponse.json(assignment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const teacherId = params.id;
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const assignmentId = searchParams.get('assignmentId');

    let whereClause = {};
    if (assignmentId) {
      whereClause = { id: assignmentId };
    } else if (classId && subjectId) {
      whereClause = { teacherId, classId, subjectId };
    } else {
      return NextResponse.json({ error: 'Parametrlar noto\'g\'ri' }, { status: 400 });
    }

    const assignment = await prisma.teacherSubjectClass.findFirst({
      where: whereClause,
      include: {
        teacher: true,
        class: true,
        subject: true,
      }
    });

    if (!assignment || assignment.teacher.schoolId !== admin.schoolId) {
      return NextResponse.json({ error: 'Biriktiruv topilmadi' }, { status: 404 });
    }

    await prisma.teacherSubjectClass.delete({
      where: { id: assignment.id },
    });

    await logAction(admin.id, 'ADMIN', 'UNASSIGN_TEACHER', 'TEACHER_ASSIGNMENT', assignment.id, {
      teacher: assignment.teacher.fullName,
      class: assignment.class.name,
      subject: assignment.subject.name,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
