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
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nomi kiritilishi shart' }, { status: 400 });
    }

    const existing = await prisma.subject.findFirst({
      where: { id, schoolId: admin.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: { name },
    });

    await logAction(admin.id, 'ADMIN', 'UPDATE_SUBJECT', 'SUBJECT', id, { from: existing.name, to: name });

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

    const existing = await prisma.subject.findFirst({
      where: { id, schoolId: admin.schoolId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Topilmadi' }, { status: 404 });
    }

    await prisma.subject.delete({
      where: { id },
    });

    await logAction(admin.id, 'ADMIN', 'DELETE_SUBJECT', 'SUBJECT', id, { name: existing.name });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
