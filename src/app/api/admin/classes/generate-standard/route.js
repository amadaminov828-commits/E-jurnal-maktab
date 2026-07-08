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
    const createdClasses = [];
    const skippedClasses = [];

    // Loop through grades 1 to 11, and sections A and B
    for (let grade = 1; grade <= 11; grade++) {
      for (const section of ['A', 'B']) {
        const className = `${grade}-${section}`;

        // Check if class already exists
        const existing = await prisma.class.findFirst({
          where: {
            schoolId: admin.schoolId,
            name: className,
          },
        });

        if (!existing) {
          const newClass = await prisma.class.create({
            data: {
              name: className,
              schoolId: admin.schoolId,
            },
          });
          createdClasses.push(newClass);
        } else {
          skippedClasses.push(className);
        }
      }
    }

    if (createdClasses.length > 0) {
      await logAction(
        admin.id,
        'ADMIN',
        'GENERATE_STANDARD_CLASSES',
        'CLASS',
        admin.schoolId,
        {
          count: createdClasses.length,
          classes: createdClasses.map((c) => c.name),
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${createdClasses.length} ta standart sinf yaratildi. ${skippedClasses.length} ta sinf allaqachon mavjud bo'lgani uchun o'tkazib yuborildi.`,
      createdCount: createdClasses.length,
      skippedCount: skippedClasses.length,
    });
  } catch (err) {
    console.error('Generate standard classes error:', err);
    return NextResponse.json({ error: 'Tizimda xatolik yuz berdi' }, { status: 500 });
  }
}
