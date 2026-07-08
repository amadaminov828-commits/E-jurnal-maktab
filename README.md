# 🖥️ E-Jurnal — Aqlli Maktab Boshqaruv Tizimi & Telegram Bot

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-blue?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-ORM-teal?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Telegram--Bot-Telegraf.js-blue?style=for-the-badge&logo=telegram" alt="Telegram Bot" />
</p>

E-Jurnal — bu repetitorlik markazlari, maktablar va o'quv yurtlari faoliyatini raqamlashtirish uchun mo'ljallangan, ko'p tarmoqli (multi-tenant) zamonaviy boshqaruv tizimi. Tizim maktab ma'muriyati (direktor), o'qituvchilar va ota-onalarni yagona ekotizimga birlashtiradi.

---

## 🌐 Tillar / Languages / Языки

Iltimos, qo'llanmani o'qish uchun kerakli tilni bosing / Please click on the language below to read the manual / Пожалуйста, нажмите на язык ниже, чтобы открыть руководство:

<details>
<summary><b>🇺🇿 O'zbekcha versiyasi (Ochish uchun bosing)</b></summary>

## 🌟 Tizim Imkoniyatlari

### 1. 💼 Direktor & Admin Paneli
* **22 Standart Sinf Generatori:** Birgina tugma bosish orqali maktab uchun 1-A dan 11-B gacha bo'lgan barcha standart sinflarni avtomatik shakllantirish.
* **Avtomatik O'quv Yiliga O'tkazish (Promotion):** O'quv yili tugaganda, barcha o'quvchilarni bitta yuqori sinfga avtomatik ko'chirish (masalan: `5-A` -> `6-A`).
* **Bitiruvchilar Arxivi:** 11-sinf bitiruvchilarini bazadan o'chirmasdan, ularning baholari va davomati tarixini saqlab qolgan holda `Bitirganlar 2026-A` maxsus sinfiga o'tkazish.
* **O'quvchi Shaxsiy Kartochkasi (Academic Transcript):** O'quvchining 1-sinfdan 11-sinfgacha bo'lgan barcha yillik va choraklik ko'rsatkichlarini yillar kesimida ko'rish va o'zbek tilidagi rasmiy transkriptini **PDF formatida yuklab olish**.
* **Tezkor Filtr va Qidiruv:** O'quvchilarni ism, familiya va ID kod bo'yicha zumda qidirish hamda sinflar bo'yicha saralash.

### 2. 📝 O'qituvchi Jurnali
* **Tezkor Guruhli Baholash (Batch Grading):** Dars mavzusini bir marta yozib, butun guruh o'quvchilariga chiroyli dumaloq tezkor tugmalar orqali soniyalar ichida baho qo'yish va saqlash.
* **Davomat Tizimi:** Darsda bor-yo'qlarni (Keldi, Kechikdi, Kelmadi) bitta jadval orqali tezkor belgilab, ota-onalarga bot orqali jo'natish.
* **24 Soatlik Tahrirlash Oynasi:** Xatoliklarni oldini olish maqsadida o'qituvchiga faqat 24 soat ichida qo'yilgan baholarni o'chirish/tahrirlash imkoniyati beriladi.
* **Choraklik Yakuniy Baholar:** O'quvchining joriy chorakdagi o'rtacha ballini avtomatik hisoblash va choraklik yakuniy bahoni tasdiqlash.

### 3. 🤖 Ota-onalar paneli (Telegram Bot)
* **Tezkor Ulanish:** Telefon raqamini ulashish (contact) orqali yoki farzandining unikal ID kodi (masalan: `ST-806DE`) orqali xavfsiz bog'lanish.
* **Real-Vaqtdagi Bildirishnomalar:** O'qituvchi baho qo'yganda yoki davomatni belgilaganda ota-onaga Telegram bot orqali soniyalar ichida bildirishnoma boradi.
* **Joriy Hisobot:** Farzandining joriy chorakdagi davomati foizi hamda barcha fanlardan o'rtacha yillik ballarini ko'rish.
* **E'lonlar bo'limi:** Maktab ma'muriyati tomonidan yuborilgan e'lon va yangiliklarni botda o'qish.

## 🛠️ Texnologiyalar Girdobi

* **Frontend & Backend:** Next.js 14 (App Router)
* **Styling:** Vanilla CSS (Aesthetic & Glassmorphism design)
* **Ma'lumotlar Bazasi:** SQLite (Mahalliy ishlab chiqish uchun)
* **ORM:** Prisma ORM
* **Bot Framework:** Telegraf.js

## 🚀 Loyihani Ishga Tushirish

### 1. Kutubxonalarni o'rnatish
```bash
npm install
```

### 2. .env Sozlamalari
Loyiha papkasida `.env` faylini yarating va quyidagi parametrlarni kiriting:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="ixtiyoriy_uzun_sekret_kod_yozing"
TELEGRAM_BOT_TOKEN="sizning_bot_tokeningiz"
```

### 3. Ma'lumotlar bazasini yaratish va Migratsiya
```bash
npx prisma db push
```

### 4. Boshlang'ich Test Ma'lumotlarini yuklash (Seed)
```bash
node prisma/seed.js
```

### 5. Tizimlarni ishga tushirish

**Veb panellarni yoqish (Admin & O'qituvchi):**
```bash
npm run dev
```

**Telegram Botni ishga tushirish:**
```bash
npm run bot
```

## 🔑 Test Akkauntlar

| Rol | Login / Username | Parol | Qo'shimcha |
| :--- | :--- | :--- | :--- |
| **Administrator (Direktor)** | `smart_admin` | `admin123` | Maktab boshqaruvi |
| **O'qituvchi** | `jamshid_t` | `teacher123` | Sinf jurnali |
| **Ota-ona (Test kodi)** | `ST-806DE` | - | Botda ulanish uchun (A'zamjon kodi) |

## 🛡️ Xavfsizlik Eslatmasi
GitHub repozitoriyasiga kodlarni yuklashdan oldin `.gitignore` fayliga `.env` va `.db` (SQLite bazasi) fayllari qo'shilganligiga ishonch hosil qiling. Ushbu loyihada bu fayllar xavfsiz tarzda ignore qilingan.

</details>

---

<details>
<summary><b>🇬🇧 English version (Click to expand)</b></summary>

## 🌟 System Features

### 1. 💼 Director & Admin Panel
* **22 Standard Class Generator:** Automatically generate standard classes from 1-A to 11-B for the school with a single click.
* **Automatic Class Promotion:** Automatically promote all students to the next grade at the end of the academic year (e.g. `5-A` -> `6-A`).
* **Graduates Archive:** Move 11th-grade graduates to a special `Graduates 2026-A` class without deleting them, keeping their historical grades and attendance.
* **Student Personal Card (Academic Transcript):** View student records across years from 1st to 11th grade and download the official Uzbek transcript as a **PDF**.
* **Quick Search & Filter:** Search students by name, surname, or ID code, and filter by class.

### 2. 📝 Teacher Journal
* **Batch Grading:** Write the lesson topic once and grade all students in the class in seconds using round interactive buttons.
* **Attendance System:** Mark attendance (Present, Late, Absent) in a single table and notify parents.
* **24-Hour Edit Window:** Delete or edit grades only within 24 hours to prevent errors.
* **Quarterly Results:** Auto-calculate student averages and confirm final quarterly grades.

### 3. 🤖 Parent Portal (Telegram Bot)
* **Quick Link:** Bind using parent contact phone number or child's unique ID code (e.g. `ST-806DE`).
* **Real-time Notifications:** Instantly receive Telegram messages when grades or attendance are saved.
* **Current Report:** View attendance percentage and average grades for the current quarter.
* **Announcements:** Read school announcements in the bot.

## 🛠️ Tech Stack

* **Frontend & Backend:** Next.js 14 (App Router)
* **Styling:** Vanilla CSS (Aesthetic & Glassmorphism design)
* **Database:** SQLite (For local development)
* **ORM:** Prisma ORM
* **Bot Framework:** Telegraf.js

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Create a `.env` file in the root folder and add the following parameters:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="any_long_secret_key"
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
```

### 3. DB Migrations
```bash
npx prisma db push
```

### 4. Seed Database
```bash
node prisma/seed.js
```

### 5. Launch Servers

**Start web dashboards (Admin & Teacher):**
```bash
npm run dev
```

**Start Telegram Bot daemon:**
```bash
npm run bot
```

## 🔑 Test Accounts

| Role | Login / Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator (Director)** | `smart_admin` | `admin123` | School management |
| **Teacher** | `jamshid_t` | `teacher123` | Classroom journal |
| **Parent (Test Code)** | `ST-806DE` | - | For bot link (A'zamjon's code) |

</details>

---

<details>
<summary><b>🇷🇺 Русская версия (Нажмите, чтобы развернуть)</b></summary>

## 🌟 Возможности системы

### 1. 💼 Панель директора и администратора
* **Генератор 22 стандартных классов:** Автоматическое создание всех стандартных классов от 1-А до 11-Б одним нажатием кнопки.
* **Автоматический перевод классов:** Автоматический перевод всех учащихся на один класс выше в конце учебного года (например: `5-А` -> `6-А`).
* **Архив выпускников:** Перевод выпускников 11-х классов в специальный класс `Выпускники 2026-А` без удаления данных, с сохранением их оценок и посещаемости.
* **Личная карточка ученика (Академический транскрипт):** Просмотр успеваемости ученика с 1 по 11 класс по учебным годам и скачивание официального транскрипта в формате **PDF**.
* **Быстрый поиск и фильтрация:** Поиск учащихся по имени, фамилии или коду ID, а также фильтрация по классам.

### 2. 📝 Журнал учителя
* **Быстрое групповое оценивание:** Запись темы урока один раз и выставление оценок всему классу за секунды с помощью удобных круглых кнопок.
* **Система посещаемости:** Отметка присутствия (Присутствовал, Опоздал, Отсутствовал) в единой таблице с отправкой уведомлений родителям.
* **24-часовое окно редактирования:** Возможность удаления или изменения оценок только в течение 24 часов для предотвращения ошибок.
* **Итоговые оценки за четверть:** Автоматический расчет среднего балла ученика и подтверждение четвертных оценок.

### 3. 🤖 Панель родителей (Telegram-бот)
* **Быстрое подключение:** Привязка аккаунта по номеру телефона (поделиться контактом) или по уникальному коду ребенка (например: `ST-806DE`).
* **Уведомления в реальном времени:** Мгновенное получение сообщений в Telegram при выставлении оценок или отметке посещаемости учителем.
* **Текущий отчет:** Просмотр процента посещаемости и средних баллов по предметам в текущей четверти.
* **Раздел объявлений:** Чтение школьных объявлений прямо в боте.

## 🛠️ Технологический стек

* **Frontend и Backend:** Next.js 14 (App Router)
* **Дизайн:** Vanilla CSS (Aesthetic & Glassmorphism)
* **База данных:** SQLite (Для локальной разработки)
* **ORM:** Prisma ORM
* **Bot Framework:** Telegraf.js

## 🚀 Инструкция по запуску

### 1. Установка библиотек
```bash
npm install
```

### 2. Настройка файла `.env`
Создайте файл `.env` в корневой папке проекта и добавьте следующие параметры:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="любой_длинный_секретный_ключ"
TELEGRAM_BOT_TOKEN="токен_вашего_бота"
```

### 3. Миграция базы данных
```bash
npx prisma db push
```

### 4. Заполнение базы данных тестовыми данными (Seed)
```bash
node prisma/seed.js
```

### 5. Запуск серверов

**Запуск веб-панелей (Админ и Учитель):**
```bash
npm run dev
```

**Запуск Telegram-бота:**
```bash
npm run bot
```

## 🔑 Тестовые аккаунты

| Роль | Логин / Имя пользователя | Пароль | Примечание |
| :--- | :--- | :--- | :--- |
| **Администратор (Директор)** | `smart_admin` | `admin123` | Управление школой |
| **Учитель** | `jamshid_t` | `teacher123` | Классный журнал |
| **Родитель (Тестовый код)** | `ST-806DE` | - | Для привязки в боте (код А'замжона) |

</details>
