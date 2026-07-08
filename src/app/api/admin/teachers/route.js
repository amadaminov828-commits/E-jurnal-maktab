import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { hashPassword } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function GET() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const teachers = await prisma.teacher.findMany({
    where: { schoolId: admin.schoolId },
    orderBy: { fullName: 'asc' },
    include: {
      assignments: {
        include: {
          class: true,
          subject: true,
        }
      }
    }
  });

  return NextResponse.json(teachers);
}

export async function POST(request) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { fullName, phone, login, password } = await request.json();
    if (!fullName || !phone || !login || !password) {
      return NextResponse.json({ error: 'Barcha maydonlar to\'ldirilishi shart' }, { status: 400 });
    }

    const existing = await prisma.teacher.findFirst({
      where: {
        OR: [
          { login },
          { phone }
        ]
      }
    });
    if (existing) {
      return NextResponse.json({ error: 'Ushbu login yoki telefon raqami band' }, { status: 400 });
    }

    const newTeacher = await prisma.teacher.create({
      data: {
        fullName,
        phone,
        login,
        password: hashPassword(password),
        schoolId: admin.schoolId,
      }
    });

    await logAction(admin.id, 'ADMIN', 'CREATE_TEACHER', 'TEACHER', newTeacher.id, { fullName, login });

    return NextResponse.json(newTeacher);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
