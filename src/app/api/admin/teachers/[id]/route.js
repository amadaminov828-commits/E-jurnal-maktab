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
    const { fullName, phone, login } = await request.json();

    if (!fullName || !phone || !login) {
      return NextResponse.json({ error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    const existing = await prisma.teacher.findFirst({
      where: { id, schoolId: admin.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    // Check duplicate logins or phone for other teachers
    const duplicate = await prisma.teacher.findFirst({
      where: {
        id: { not: id },
        OR: [
          { login },
          { phone }
        ]
      }
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Ushbu login yoki telefon raqami band' }, { status: 400 });
    }

    const updated = await prisma.teacher.update({
      where: { id },
      data: { fullName, phone, login },
    });

    await logAction(admin.id, 'ADMIN', 'UPDATE_TEACHER', 'TEACHER', id, { from: existing.fullName, to: fullName });

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

    const existing = await prisma.teacher.findFirst({
      where: { id, schoolId: admin.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    await prisma.teacher.delete({
      where: { id },
    });

    await logAction(admin.id, 'ADMIN', 'DELETE_TEACHER', 'TEACHER', id, { fullName: existing.fullName });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
