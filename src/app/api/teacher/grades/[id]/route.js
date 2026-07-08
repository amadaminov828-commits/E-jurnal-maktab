import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function PUT(request, { params }) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { value, topic } = await request.json();

    if (!value) {
      return NextResponse.json({ error: 'Baho kiritilishi shart' }, { status: 400 });
    }

    const existing = await prisma.grade.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    if (existing.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Siz ushbu bahoni o\'zgartira olmaysiz' }, { status: 403 });
    }

    const timeDiff = Date.now() - new Date(existing.createdAt).getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        error: 'Ushbu bahoni o\'zgartirish muddati (24 soat) tugagan. O\'zgartirish uchun administratorga murojaat qiling.'
      }, { status: 403 });
    }

    const updated = await prisma.grade.update({
      where: { id },
      data: {
        value: parseInt(value, 10),
        topic: topic || null,
      }
    });

    await logAction(teacher.id, 'TEACHER', 'UPDATE_GRADE', 'GRADE', id, {
      student: `${existing.student.firstName} ${existing.student.lastName}`,
      from: existing.value,
      to: value
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { id } = params;

    const existing = await prisma.grade.findUnique({
      where: { id },
      include: { student: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    if (existing.teacherId !== teacher.id) {
      return NextResponse.json({ error: 'Siz ushbu bahoni o\'chira olmaysiz' }, { status: 403 });
    }

    const timeDiff = Date.now() - new Date(existing.createdAt).getTime();
    if (timeDiff > 24 * 60 * 60 * 1000) {
      return NextResponse.json({
        error: 'Ushbu bahoni o\'chirish muddati (24 soat) tugagan. O\'chirish uchun administratorga murojaat qiling.'
      }, { status: 403 });
    }

    await prisma.grade.delete({
      where: { id }
    });

    await logAction(teacher.id, 'TEACHER', 'DELETE_GRADE', 'GRADE', id, {
      student: `${existing.student.firstName} ${existing.student.lastName}`,
      value: existing.value
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
