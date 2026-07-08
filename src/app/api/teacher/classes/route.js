import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkTeacherSession } from '@/lib/serverAuth';

export async function GET() {
  const teacher = checkTeacherSession();
  if (!teacher) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const assignments = await prisma.teacherSubjectClass.findMany({
    where: { teacherId: teacher.id },
    include: {
      class: true,
      subject: true,
    },
    orderBy: { class: { name: 'asc' } },
  });

  return NextResponse.json(assignments);
}
