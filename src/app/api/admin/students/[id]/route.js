import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function PUT(request, { params }) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { id } = params;
    const { firstName, lastName, birthDate, classId } = await request.json();

    if (!firstName || !lastName || !classId) {
      return NextResponse.json({ error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    const existing = await prisma.student.findFirst({
      where: { id, schoolId: admin.schoolId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    const updated = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        classId,
      }
    });

    await logAction(admin.id, 'ADMIN', 'UPDATE_STUDENT', 'STUDENT', id, {
      from: `${existing.firstName} ${existing.lastName}`,
      to: `${firstName} ${lastName}`
    });

    return NextResponse.json(updated);
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
    const { id } = params;

    const existing = await prisma.student.findFirst({
      where: { id, schoolId: admin.schoolId }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id }
    });

    await logAction(admin.id, 'ADMIN', 'DELETE_STUDENT', 'STUDENT', id, {
      name: `${existing.firstName} ${existing.lastName}`
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
