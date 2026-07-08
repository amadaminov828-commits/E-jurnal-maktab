import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { redirect, notFound } from 'next/navigation';
import StudentCardClient from './StudentCardClient';

export const dynamic = 'force-dynamic';

export default async function StudentCardPage({ params }) {
  const admin = checkAdminSession();
  if (!admin) {
    redirect('/login');
  }

  // 1. Fetch Student Details
  const student = await prisma.student.findUnique({
    where: { id: params.id },
    include: {
      class: true,
      parents: {
        include: {
          parent: true,
        },
      },
    },
  });

  if (!student || student.schoolId !== admin.schoolId) {
    notFound();
  }

  // 2. Fetch Grades History
  const grades = await prisma.grade.findMany({
    where: { studentId: params.id },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: { date: 'asc' },
  });

  // 3. Fetch Attendance History
  const attendance = await prisma.attendance.findMany({
    where: { studentId: params.id },
    include: {
      subject: true,
    },
    orderBy: { date: 'asc' },
  });

  return (
    <StudentCardClient 
      student={student} 
      grades={grades} 
      attendance={attendance} 
    />
  );
}
