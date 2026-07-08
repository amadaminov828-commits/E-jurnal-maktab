# 🖥️ E-Jurnal — Aqlli Maktab Boshqaruv Tizimi & Telegram Bot

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-blue?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-ORM-teal?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/SQLite-Database-blue?style=for-the-badge&logo=sqlite" alt="SQLite" />
  <img src="https://img.shields.io/badge/Telegram--Bot-Telegraf.js-blue?style=for-the-badge&logo=telegram" alt="Telegram Bot" />
</p>

**E-Jurnal** — bu repetitorlik markazlari, maktablar va o'quv yurtlari faoliyatini raqamlashtirish uchun mo'ljallangan, ko'p tarmoqli (multi-tenant) zamonaviy boshqaruv tizimi. Tizim maktab ma'muriyati (direktor), o'qituvchilar va ota-onalarni yagona ekotizimga birlashtiradi.

---

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

---

## 🛠️ Texnologiyalar Girdobi

* **Frontend & Backend:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
* **Styling:** Vanilla CSS (Aesthetic & Glassmorphism design)
* **Ma'lumotlar Bazasi:** [SQLite](https://www.sqlite.org/) (Mahalliy ishlab chiqish uchun yengil va tezkor)
* **ORM:** [Prisma ORM](https://www.prisma.io/)
* **Bot Framework:** [Telegraf.js](https://telegraf.js.org/)

---

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

---

## 🔑 Test Akkauntlar

| Rol | Login / Username | Parol | Qo'shimcha |
| :--- | :--- | :--- | :--- |
| **Administrator (Direktor)** | `smart_admin` | `admin123` | Maktab boshqaruvi |
| **O'qituvchi** | `jamshid_t` | `teacher123` | Sinf jurnali |
| **Ota-ona (Test kodi)** | `ST-806DE` | - | Botda ulanish uchun (A'zamjon kodi) |

---

## 🛡️ Xavfsizlik Eslatmasi
GitHub repozitoriyasiga kodlarni yuklashdan oldin `.gitignore` fayliga `.env` va `.db` (SQLite bazasi) fayllari qo'shilganligiga ishonch hosil qiling. Ushbu loyihada bu fayllar xavfsiz tarzda ignore qilingan.
