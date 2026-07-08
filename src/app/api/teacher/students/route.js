import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';

export async function GET(request) {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'Sinfni tanlang' }, { status: 400 });
  }

  const assignment = await prisma.teacherSubjectClass.findFirst({
    where: { teacherId: teacher.id, classId },
  });

  if (!assignment) {
    return NextResponse.json({ error: 'Siz ushbu sinfga biriktirilmagansiz' }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    where: { classId },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  });

  return NextResponse.json(students);
}
