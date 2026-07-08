import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';

export async function POST() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    // 1. Fetch all students in the school
    const students = await prisma.student.findMany({
      where: { schoolId: admin.schoolId },
      include: { class: true },
    });

    if (students.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Maktabda hech qanday o\'quvchi topilmadi.',
        promotedCount: 0,
      });
    }

    // 2. Load all existing classes in the school for quick lookup
    const classes = await prisma.class.findMany({
      where: { schoolId: admin.schoolId },
    });

    const classMap = {}; // name -> id
    classes.forEach((c) => {
      classMap[c.name.toUpperCase()] = c.id;
    });

    // Helper function to find or create class dynamically
    async function getOrCreateClassId(name) {
      const upperName = name.toUpperCase();
      if (classMap[upperName]) {
        return classMap[upperName];
      }

      // Create class
      const newClass = await prisma.class.create({
        data: {
          name,
          schoolId: admin.schoolId,
        },
      });

      classMap[upperName] = newClass.id;
      return newClass.id;
    }

    let promotedCount = 0;
    const currentYear = new Date().getFullYear();

    // 3. Process promotion for each student
    for (const student of students) {
      if (!student.class) continue;

      const className = student.class.name;
      const match = className.match(/^(\d+)-(.*)$/);

      if (match) {
        const grade = parseInt(match[1], 10);
        const section = match[2];

        let nextClassName = '';
        if (grade < 11) {
          nextClassName = `${grade + 1}-${section}`;
        } else {
          // Grade 11 graduates
          nextClassName = `Bitirganlar ${currentYear}-${section}`;
        }

        const nextClassId = await getOrCreateClassId(nextClassName);

        await prisma.student.update({
          where: { id: student.id },
          data: { classId: nextClassId },
        });

        promotedCount++;
      }
    }

    if (promotedCount > 0) {
      await logAction(
        admin.id,
        'ADMIN',
        'PROMOTE_ALL_STUDENTS',
        'CLASS',
        admin.schoolId,
        {
          count: promotedCount,
          year: currentYear,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Barcha sinflar muvaffaqiyatli yangilandi! ${promotedCount} ta o'quvchi yangi sinfga o'tkazildi.`,
      promotedCount,
    });
  } catch (err) {
    console.error('Promote students error:', err);
    return NextResponse.json({ error: 'Tizimda xatolik yuz berdi' }, { status: 500 });
  }
}
