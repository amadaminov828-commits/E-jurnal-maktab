export async function sendTelegramMessage(telegramId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('DummyToken')) {
    console.log(`[Telegram Mock] Sending to chat_id ${telegramId}: ${text}`);
    return;
  }
  
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Telegram send failed: ${errText}`);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

export async function notifyGrade(prisma, gradeId) {
  try {
    const grade = await prisma.grade.findUnique({
      where: { id: gradeId },
      include: {
        student: {
          include: {
            parents: {
              include: { parent: true }
            }
          }
        },
        subject: true,
        teacher: true,
      }
    });

    if (!grade) return;

    const studentName = `${grade.student.firstName} ${grade.student.lastName}`;
    const text = `📝 <b>Yangi baho!</b>\n\n` +
      `<b>O'quvchi:</b> ${studentName}\n` +
      `<b>Fan:</b> ${grade.subject.name}\n` +
      `<b>Baho:</b> ${grade.value} baho\n` +
      (grade.topic ? `<b>Mavzu:</b> ${grade.topic}\n` : '') +
      `<b>O'qituvchi:</b> ${grade.teacher.fullName}\n` +
      `<b>Sana:</b> ${new Date(grade.date).toLocaleDateString('uz-UZ')}`;

    for (const link of grade.student.parents) {
      if (link.parent.telegramId) {
        await sendTelegramMessage(link.parent.telegramId, text);
      }
    }
  } catch (err) {
    console.error('notifyGrade error:', err);
  }
}

export async function notifyAttendance(prisma, attendanceId) {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        student: {
          include: {
            parents: {
              include: { parent: true }
            }
          }
        },
        subject: true,
      }
    });

    if (!attendance) return;

    const studentName = `${attendance.student.firstName} ${attendance.student.lastName}`;
    let statusText = '';
    if (attendance.status === 'PRESENT') statusText = 'Keldi ✅';
    if (attendance.status === 'ABSENT') statusText = 'Kelmadi ❌';
    if (attendance.status === 'LATE') statusText = 'Kechikdi ⚠️';

    const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    const text = `🔔 <b>Davomat xabarnomasi</b>\n\n` +
      `<b>O'quvchi:</b> ${studentName}\n` +
      `<b>Fan:</b> ${attendance.subject.name}\n` +
      `<b>Holati:</b> ${statusText}\n` +
      `<b>Sana/Vaqt:</b> ${new Date(attendance.date).toLocaleDateString('uz-UZ')} ${time}`;

    for (const link of attendance.student.parents) {
      if (link.parent.telegramId) {
        await sendTelegramMessage(link.parent.telegramId, text);
      }
    }
  } catch (err) {
    console.error('notifyAttendance error:', err);
  }
}

export async function notifyAnnouncement(prisma, announcementId) {
  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      include: {
        school: {
          include: {
            students: {
              include: {
                parents: {
                  include: { parent: true }
                }
              }
            }
          }
        }
      }
    });

    if (!announcement) return;

    const text = `📢 <b>E'LON (${announcement.school.name})</b>\n\n` +
      `${announcement.text}\n\n` +
      `<i>Sana: ${new Date(announcement.createdAt).toLocaleDateString('uz-UZ')}</i>`;

    const telegramIds = new Set();
    for (const student of announcement.school.students) {
      for (const link of student.parents) {
        if (link.parent.telegramId) {
          telegramIds.add(link.parent.telegramId);
        }
      }
    }

    for (const telegramId of telegramIds) {
      await sendTelegramMessage(telegramId, text);
    }
  } catch (err) {
    console.error('notifyAnnouncement error:', err);
  }
}
