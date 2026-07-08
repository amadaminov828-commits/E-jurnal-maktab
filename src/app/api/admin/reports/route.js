import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';

export async function GET(request) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'Sinfni tanlang' }, { status: 400 });
  }

  try {
    const cls = await prisma.class.findFirst({
      where: { id: classId, schoolId: admin.schoolId },
    });

    if (!cls) {
      return NextResponse.json({ error: 'Sinf topilmadi' }, { status: 404 });
    }

    const subjects = await prisma.subject.findMany({
      where: { schoolId: admin.schoolId },
      orderBy: { name: 'asc' },
    });

    const students = await prisma.student.findMany({
      where: { classId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: {
        grades: true,
        attendance: true,
        quarterResults: true,
      }
    });

    return NextResponse.json({
      class: cls,
      subjects,
      students,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
