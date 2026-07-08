import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function GET() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    where: { schoolId: admin.schoolId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { students: true }
      }
    }
  });

  return NextResponse.json(classes);
}

export async function POST(request) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Nomi kiritilishi shart' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        schoolId: admin.schoolId,
      }
    });

    await logAction(admin.id, 'ADMIN', 'CREATE_CLASS', 'CLASS', newClass.id, { name });

    return NextResponse.json(newClass);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
