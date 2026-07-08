import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function GET() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    where: { schoolId: admin.schoolId },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(subjects);
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

    const newSubject = await prisma.subject.create({
      data: {
        name,
        schoolId: admin.schoolId,
      }
    });

    await logAction(admin.id, 'ADMIN', 'CREATE_SUBJECT', 'SUBJECT', newSubject.id, { name });

    return NextResponse.json(newSubject);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
