import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkAdminSession } from '@/lib/serverAuth';
import { logAction } from '@/lib/audit';
import { notifyAnnouncement } from '@/lib/notifier';

export async function GET() {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    where: { schoolId: admin.schoolId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(announcements);
}

export async function POST(request) {
  const admin = checkAdminSession();
  if (!admin) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: 'E\'lon matnini kiriting' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        text,
        schoolId: admin.schoolId,
      }
    });

    await logAction(admin.id, 'ADMIN', 'CREATE_ANNOUNCEMENT', 'ANNOUNCEMENT', announcement.id, { text });

    // Trigger Telegram Broadcast
    await notifyAnnouncement(prisma, announcement.id);

    return NextResponse.json(announcement);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
