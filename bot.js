const { Telegraf, Markup } = require('telegraf');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Simple memory session store
const sessions = {};

const getSession = (chatId) => {
  if (!sessions[chatId]) {
    sessions[chatId] = {
      lang: 'uz', // default language
      state: 'IDLE', // IDLE, AWAITING_CODE
      parent: null, // linked parent record
      students: [], // linked students
      activeStudentId: null, // selected child ID
      sharedPhone: null, // shared contact phone
    };
  }
  return sessions[chatId];
};

// Translators
const t = {
  uz: {
    choose_lang: "Iltimos, muloqot tilini tanlang / Пожалуйста, выберите язык общения:",
    share_contact_req: "E-Jurnal tizimidan xabarlar olish uchun telefon raqamingizni tasdiqlang. Quyidagi tugmani bosing:",
    share_contact_btn: "📱 Telefon raqamini ulashish",
    phone_not_found: "Kechirasiz, telefon raqamingiz tizimda topilmadi.\n\nFarzandingizning unikal identifikatsiya kodini kiriting (masalan: ST-11111):",
    invalid_code: "Ushbu identifikatsiya kodi bo'yicha o'quvchi topilmadi. Qayta urinib ko'ring yoki ma'muriyat bilan bog'laning:",
    binding_success: "Muvaffaqiyatli ulandi! Farzandingiz: {name}",
    welcome_parent: "Xush kelibsiz, {name}!",
    select_child: "Hisobotlarni ko'rish uchun quyidagi farzandlaringizdan birini tanlang:",
    child_selected: "Faol o'quvchi sifatida {name} tanlandi.",
    menu_report: "📊 Joriy hisobot",
    menu_announce: "🔔 E'lonlar",
    menu_switch_child: "🔄 Farzandni almashtirish",
    menu_lang: "🌐 Tilni o'zgartirish",
    menu_welcome: "Quyidagi menyu orqali farzandingiz ko'rsatkichlarini kuzatishingiz mumkin:",
    report_title: "📊 {name} uchun joriy hisobot:\n\n",
    report_attendance: "<b>Davomat foizi:</b> {rate}%\n",
    report_grades: "\n<b>Fanlar bo'yicha o'rtacha baholar:</b>\n",
    report_quarters: "\n<b>Choraklik yakuniy baholar:</b>\n",
    no_grades: "Hozircha baholar mavjud emas.",
    no_announcements: "So'nggi vaqtlarda hech qanday e'lonlar e'lon qilinmadi.",
  },
  ru: {
    choose_lang: "Пожалуйста, выберите язык общения / Iltimos, muloqot tilini tanlang:",
    share_contact_req: "Для получения уведомлений от E-Jurnal, пожалуйста, подтвердите свой номер телефона. Нажмите кнопку ниже:",
    share_contact_btn: "📱 Поделиться контактом",
    phone_not_found: "Извините, ваш номер телефона не найден в системе.\n\nПожалуйста, введите уникальный идентификационный код вашего ребенка (например: ST-11111):",
    invalid_code: "Ученик с таким кодом не найден. Попробуйте еще раз или свяжитесь с администрацией:",
    binding_success: "Успешно подключено! Ваш ребенок: {name}",
    welcome_parent: "Добро пожаловать, {name}!",
    select_child: "Выберите одного из ваших детей для просмотра отчетов:",
    child_selected: "Активным учеником выбран {name}.",
    menu_report: "📊 Текущий отчет",
    menu_announce: "🔔 Объявления",
    menu_switch_child: "🔄 Сменить ребенка",
    menu_lang: "🌐 Сменить язык",
    menu_welcome: "Используйте меню ниже для отслеживания успеваемости вашего ребенка:",
    report_title: "📊 Текущий отчет для {name}:\n\n",
    report_attendance: "<b>Процент посещаемости:</b> {rate}%\n",
    report_grades: "\n<b>Средние баллы по предметам:</b>\n",
    report_quarters: "\n<b>Итоговые оценки за четверти:</b>\n",
    no_grades: "Оценок пока нет.",
    no_announcements: "За последнее время объявлений не было.",
  }
};

// Phone formatting helper
function formatPhone(phone) {
  let clean = phone.replace(/\D/g, '');
  if (!clean.startsWith('+')) {
    clean = '+' + clean;
  }
  return clean;
}

// Render Main Menu Keyboard
function getMainMenu(session) {
  const lang = session.lang;
  const buttons = [
    [t[lang].menu_report, t[lang].menu_announce]
  ];
  if (session.students.length > 1) {
    buttons.push([t[lang].menu_switch_child]);
  }
  buttons.push([t[lang].menu_lang]);

  return Markup.keyboard(buttons).resize();
}

// 1. Start Command - Language Selection
bot.start(async (ctx) => {
  const session = getSession(ctx.chat.id);
  session.state = 'IDLE';

  return ctx.reply(
    t.uz.choose_lang,
    Markup.inlineKeyboard([
      Markup.button.callback('🇺🇿 O\'zbekcha', 'lang_uz'),
      Markup.button.callback('🇷🇺 Русский', 'lang_ru')
    ])
  );
});

// Callback for Language
bot.action(/lang_(uz|ru)/, async (ctx) => {
  const lang = ctx.match[1];
  const session = getSession(ctx.chat.id);
  session.lang = lang;
  
  await ctx.answerCbQuery();
  
  // If parent is already linked, just update language and show menu
  if (session.parent) {
    return ctx.reply(t[lang].menu_welcome, getMainMenu(session));
  }

  // Otherwise, request phone contact
  return ctx.reply(
    t[lang].share_contact_req,
    Markup.keyboard([
      Markup.button.contactRequest(t[lang].share_contact_btn)
    ]).resize()
  );
});

// 2. Handle shared contact
bot.on('contact', async (ctx) => {
  const chatId = ctx.chat.id;
  const session = getSession(chatId);
  const contact = ctx.message.contact;

  if (contact.user_id !== ctx.from.id) {
    return ctx.reply("Faqat o'z telefon raqamingizni ulasha olasiz / Вы можете поделиться только своим номером.");
  }

  const rawPhone = contact.phone_number;
  const formattedPhone = formatPhone(rawPhone);
  session.sharedPhone = formattedPhone;

  console.log(`[Bot] Contact shared: ${formattedPhone}`);

  try {
    // Look up parent by phone
    let parent = await prisma.parent.findUnique({
      where: { phone: formattedPhone },
      include: {
        students: {
          include: {
            student: {
              include: { class: true }
            }
          }
        }
      }
    });

    if (parent) {
      // Link telegramId
      parent = await prisma.parent.update({
        where: { id: parent.id },
        data: { telegramId: String(chatId) }
      });

      session.parent = parent;
      session.students = parent.students.map(link => link.student);
      session.state = 'IDLE';

      await ctx.reply(
        t[session.lang].welcome_parent.replace('{name}', parent.fullName || 'Ota-ona'),
        Markup.removeKeyboard()
      );

      return sendChildSelectionMenu(ctx, session);
    } else {
      // Phone not found, await student unique code
      session.state = 'AWAITING_CODE';
      return ctx.reply(
        t[session.lang].phone_not_found,
        Markup.removeKeyboard()
      );
    }
  } catch (err) {
    console.error(err);
    return ctx.reply("Tizimda xatolik yuz berdi. Qayta urinib ko'ring.");
  }
});

// Helper: Show Child Selection Menu
async function sendChildSelectionMenu(ctx, session) {
  const lang = session.lang;
  if (session.students.length === 0) {
    return ctx.reply("Sizga bog'langan o'quvchilar topilmadi.");
  }

  if (session.students.length === 1) {
    const student = session.students[0];
    session.activeStudentId = student.id;
    await ctx.reply(
      t[lang].binding_success.replace('{name}', `${student.firstName} ${student.lastName} (${student.class.name})`)
    );
    return ctx.reply(t[lang].menu_welcome, getMainMenu(session));
  }

  // Multiple students
  const buttons = session.students.map(student => [
    Markup.button.callback(`${student.firstName} ${student.lastName} (${student.class.name})`, `select_student_${student.id}`)
  ]);

  return ctx.reply(
    t[lang].select_child,
    Markup.inlineKeyboard(buttons)
  );
}

// Handle Student selection callback
bot.action(/select_student_(.+)/, async (ctx) => {
  const studentId = ctx.match[1];
  const session = getSession(ctx.chat.id);
  
  const student = session.students.find(s => s.id === studentId);
  if (student) {
    session.activeStudentId = student.id;
    await ctx.answerCbQuery();
    await ctx.reply(
      t[session.lang].child_selected.replace('{name}', `${student.firstName} ${student.lastName}`)
    );
    return ctx.reply(t[session.lang].menu_welcome, getMainMenu(session));
  }
  return ctx.answerCbQuery();
});

// 3. Handle Awaiting Student Code text
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const session = getSession(chatId);
  const text = ctx.message.text.trim();
  const lang = session.lang;

  // Handle menu button text clicks
  if (text === t[lang].menu_report) {
    return handleReportRequest(ctx, session);
  }
  if (text === t[lang].menu_announce) {
    return handleAnnouncementsRequest(ctx, session);
  }
  if (text === t[lang].menu_switch_child) {
    return sendChildSelectionMenu(ctx, session);
  }
  if (text === t[lang].menu_lang) {
    return ctx.reply(
      t[lang].choose_lang,
      Markup.inlineKeyboard([
        Markup.button.callback('🇺🇿 O\'zbekcha', 'lang_uz'),
        Markup.button.callback('🇷🇺 Русский', 'lang_ru')
      ])
    );
  }

  if (session.state === 'AWAITING_CODE') {
    try {
      // Find student by code
      const student = await prisma.student.findUnique({
        where: { uniqueCode: text.toUpperCase() },
        include: { class: true }
      });

      if (!student) {
        return ctx.reply(t[lang].invalid_code);
      }

      // We need to link the parent. If parent record was not found, we create a new one using the shared phone.
      const phone = session.sharedPhone || `+DUMMY-${chatId}`;
      let parent = await prisma.parent.findUnique({
        where: { phone }
      });

      if (!parent) {
        parent = await prisma.parent.create({
          data: {
            phone,
            fullName: ctx.from.first_name + (ctx.from.last_name ? ' ' + ctx.from.last_name : ''),
            telegramId: String(chatId)
          }
        });
      } else {
        parent = await prisma.parent.update({
          where: { id: parent.id },
          data: { telegramId: String(chatId) }
        });
      }

      // Link parent and student
      await prisma.parentStudent.upsert({
        where: {
          parentId_studentId: {
            parentId: parent.id,
            studentId: student.id
          }
        },
        create: {
          parentId: parent.id,
          studentId: student.id
        },
        update: {}
      });

      // Reload students for this parent
      const updatedParent = await prisma.parent.findUnique({
        where: { id: parent.id },
        include: {
          students: {
            include: {
              student: {
                include: { class: true }
              }
            }
          }
        }
      });

      session.parent = updatedParent;
      session.students = updatedParent.students.map(link => link.student);
      session.activeStudentId = student.id;
      session.state = 'IDLE';

      await ctx.reply(
        t[lang].binding_success.replace('{name}', `${student.firstName} ${student.lastName} (${student.class.name})`)
      );

      return ctx.reply(t[lang].menu_welcome, getMainMenu(session));
    } catch (err) {
      console.error(err);
      return ctx.reply("Xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  }
});

// Helper: Handle Report Requests
async function handleReportRequest(ctx, session) {
  const lang = session.lang;
  const studentId = session.activeStudentId;

  if (!studentId) {
    return ctx.reply("Avval farzandingizni tanlang.");
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        attendance: true,
        grades: true,
        quarterResults: {
          include: { subject: true }
        }
      }
    });

    const subjects = await prisma.subject.findMany({
      where: { schoolId: student.schoolId }
    });

    let msg = t[lang].report_title.replace('{name}', `${student.firstName} ${student.lastName} (${student.class.name})`);

    // 1. Attendance Rate
    const attCount = student.attendance.length;
    let weightedCount = 0;
    student.attendance.forEach(att => {
      if (att.status === 'PRESENT') weightedCount += 1;
      else if (att.status === 'LATE') weightedCount += 0.5;
    });
    const attRate = attCount > 0 ? ((weightedCount / attCount) * 100).toFixed(0) : 100;
    msg += t[lang].report_attendance.replace('{rate}', attRate);

    // 2. Average Grades
    msg += t[lang].report_grades;
    let gradesAdded = false;
    subjects.forEach((sub) => {
      const subGrades = student.grades.filter(g => g.subjectId === sub.id);
      if (subGrades.length > 0) {
        gradesAdded = true;
        const sum = subGrades.reduce((acc, curr) => acc + curr.value, 0);
        const avg = (sum / subGrades.length).toFixed(1);
        msg += `🔹 <b>${sub.name}:</b> ${avg} (${subGrades.length} ta baho)\n`;
      }
    });
    if (!gradesAdded) {
      msg += `<i>${t[lang].no_grades}</i>\n`;
    }

    // 3. Quarter Results
    if (student.quarterResults.length > 0) {
      msg += t[lang].report_quarters;
      student.quarterResults.forEach((res) => {
        msg += `🔹 <b>${res.subject.name} (${res.quarter}-chorak):</b> ${res.finalGrade}\n`;
      });
    }

    return ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(err);
    return ctx.reply("Hisobot tayyorlashda xatolik yuz berdi.");
  }
}

// Helper: Handle Announcements requests
async function handleAnnouncementsRequest(ctx, session) {
  const lang = session.lang;
  const studentId = session.activeStudentId;

  if (!studentId) {
    return ctx.reply("Avval o'quvchini tanlang.");
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: student.schoolId },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    if (announcements.length === 0) {
      return ctx.reply(t[lang].no_announcements);
    }

    let msg = `🔔 <b>So'nggi e'lonlar:</b>\n\n`;
    announcements.forEach((announce) => {
      msg += `📢 ${announce.text}\n`;
      msg += `<i>Sana: ${new Date(announce.createdAt).toLocaleDateString('uz-UZ')}</i>\n`;
      msg += `-------------------------\n\n`;
    });

    return ctx.reply(msg, { parse_mode: 'HTML' });
  } catch (err) {
    console.error(err);
    return ctx.reply("E'lonlarni yuklashda xatolik yuz berdi.");
  }
}

// Launch Bot
bot.launch();
console.log('Telegram Bot daemon launched successfully!');

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
