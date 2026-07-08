import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';
import crypto from 'crypto';

async function generateUniqueStudentCode() {
  let attempts = 0;
  while (attempts < 10) {
    const code = 'ST-' + crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
    const existing = await prisma.student.findUnique({ where: { uniqueCode: code } });
    if (!existing) return code;
    attempts++;
  }
  return 'ST-' + Date.now().toString().slice(-5);
}

export async function GET() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    where: { schoolId: admin.schoolId },
    orderBy: [{ class: { name: 'asc' } }, { lastName: 'asc' }],
    include: {
      class: true,
      parents: {
        include: {
          parent: true
        }
      }
    }
  });

  return NextResponse.json(students);
}

export async function POST(request) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { firstName, lastName, birthDate, classId, parentName, parentPhone } = await request.json();

    if (!firstName || !lastName || !classId) {
      return NextResponse.json({ error: 'Ism, familiya va sinf kiritilishi shart' }, { status: 400 });
    }

    const uniqueCode = await generateUniqueStudentCode();

    const newStudent = await prisma.student.create({
      data: {
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        classId,
        schoolId: admin.schoolId,
        uniqueCode,
      }
    });

    // Handle parent connection if phone is provided
    if (parentPhone) {
      const cleanPhone = parentPhone.trim();
      let parent = await prisma.parent.findUnique({
        where: { phone: cleanPhone }
      });

      if (!parent) {
        parent = await prisma.parent.create({
          data: {
            phone: cleanPhone,
            fullName: parentName || 'Ota-ona',
          }
        });
      }

      await prisma.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: newStudent.id
        }
      });
    }

    await logAction(admin.id, 'ADMIN', 'CREATE_STUDENT', 'STUDENT', newStudent.id, {
      name: `${firstName} ${lastName}`,
      code: uniqueCode,
    });

    return NextResponse.json(newStudent);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
