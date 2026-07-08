const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean DB
  await prisma.auditLog.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.quarterResult.deleteMany({});
  await prisma.attendance.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.teacherSubjectClass.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.parentStudent.deleteMany({});
  await prisma.parent.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.schoolAdmin.deleteMany({});
  await prisma.school.deleteMany({});

  const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
  const hashedTeacherPassword = bcrypt.hashSync('teacher123', 10);

  // 1. Create Schools
  const schoolA = await prisma.school.create({
    data: {
      name: 'Smart Academy',
      address: 'Toshkent sh., Chilonzor tumani',
      phone: '+998901111111',
    },
  });

  const schoolB = await prisma.school.create({
    data: {
      name: 'Alfa School',
      address: 'Toshkent sh., Yunusobod tumani',
      phone: '+998902222222',
    },
  });

  // 2. Create School Admins
  await prisma.schoolAdmin.create({
    data: {
      schoolId: schoolA.id,
      fullName: 'Anvar Toshmatov (Director)',
      phone: '+998903333333',
      login: 'smart_admin',
      password: hashedAdminPassword,
    },
  });

  await prisma.schoolAdmin.create({
    data: {
      schoolId: schoolB.id,
      fullName: 'Bobur Karimov (Director)',
      phone: '+998904444444',
      login: 'alfa_admin',
      password: hashedAdminPassword,
    },
  });

  // 3. Create Classes (22 classes for each school)
  const classesA = {};
  for (let grade = 1; grade <= 11; grade++) {
    for (const section of ['A', 'B']) {
      const name = `${grade}-${section}`;
      classesA[name] = await prisma.class.create({
        data: { schoolId: schoolA.id, name },
      });
    }
  }

  const classesB = {};
  for (let grade = 1; grade <= 11; grade++) {
    for (const section of ['A', 'B']) {
      const name = `${grade}-${section}`;
      classesB[name] = await prisma.class.create({
        data: { schoolId: schoolB.id, name },
      });
    }
  }

  const class5A = classesA['5-A'];
  const class6B = classesA['6-B'];
  const class9A = classesB['9-A'];

  // 4. Create Subjects
  const math = await prisma.subject.create({
    data: { schoolId: schoolA.id, name: 'Matematika' },
  });
  const english = await prisma.subject.create({
    data: { schoolId: schoolA.id, name: 'Ingliz tili' },
  });
  const physics = await prisma.subject.create({
    data: { schoolId: schoolA.id, name: 'Fizika' },
  });

  const mathB = await prisma.subject.create({
    data: { schoolId: schoolB.id, name: 'Matematika' },
  });

  // 5. Create Teachers
  const teacherJamshid = await prisma.teacher.create({
    data: {
      schoolId: schoolA.id,
      fullName: 'Jamshid Aliyev',
      phone: '+998905555555',
      login: 'jamshid_t',
      password: hashedTeacherPassword,
    },
  });

  const teacherNilufar = await prisma.teacher.create({
    data: {
      schoolId: schoolA.id,
      fullName: 'Nilufar Hoshimova',
      phone: '+998906666666',
      login: 'nilufar_t',
      password: hashedTeacherPassword,
    },
  });

  const teacherSardor = await prisma.teacher.create({
    data: {
      schoolId: schoolB.id,
      fullName: 'Sardor Karimov',
      phone: '+998907777777',
      login: 'sardor_t',
      password: hashedTeacherPassword,
    },
  });

  // 6. Assign Teachers to Subjects and Classes (Assignments)
  // Jamshid teaches Matematika to 5-A
  await prisma.teacherSubjectClass.create({
    data: {
      teacherId: teacherJamshid.id,
      subjectId: math.id,
      classId: class5A.id,
    },
  });
  // Jamshid teaches Ingliz tili to 6-B
  await prisma.teacherSubjectClass.create({
    data: {
      teacherId: teacherJamshid.id,
      subjectId: english.id,
      classId: class6B.id,
    },
  });
  // Nilufar teaches Fizika to 5-A
  await prisma.teacherSubjectClass.create({
    data: {
      teacherId: teacherNilufar.id,
      subjectId: physics.id,
      classId: class5A.id,
    },
  });
  // Sardor teaches Matematika to 9-A (School B)
  await prisma.teacherSubjectClass.create({
    data: {
      teacherId: teacherSardor.id,
      subjectId: mathB.id,
      classId: class9A.id,
    },
  });

  // 7. Create Students
  const studentAlisher = await prisma.student.create({
    data: {
      schoolId: schoolA.id,
      classId: class5A.id,
      firstName: 'Alisher',
      lastName: 'Karimov',
      birthDate: new Date('2015-05-15'),
      uniqueCode: 'ST-11111',
    },
  });

  const studentMadina = await prisma.student.create({
    data: {
      schoolId: schoolA.id,
      classId: class5A.id,
      firstName: 'Madina',
      lastName: 'Solihova',
      birthDate: new Date('2015-09-20'),
      uniqueCode: 'ST-22222',
    },
  });

  const studentJasur = await prisma.student.create({
    data: {
      schoolId: schoolA.id,
      classId: class6B.id,
      firstName: 'Jasur',
      lastName: 'Nematov',
      birthDate: new Date('2014-03-10'),
      uniqueCode: 'ST-33333',
    },
  });

  const studentTemur = await prisma.student.create({
    data: {
      schoolId: schoolB.id,
      classId: class9A.id,
      firstName: 'Temur',
      lastName: 'Usmanov',
      birthDate: new Date('2011-11-12'),
      uniqueCode: 'ST-44444',
    },
  });

  // 8. Create Parents and link them
  // Parent 1 (Alisher's and Madina's father for test phone matching)
  const parent1 = await prisma.parent.create({
    data: {
      fullName: 'Karim Karimov',
      phone: '+998901234567', // Will use this to log in to bot
      telegramId: null,
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parent1.id,
      studentId: studentAlisher.id,
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parent1.id,
      studentId: studentMadina.id,
    },
  });

  // Parent 2 (Jasur's mother)
  const parent2 = await prisma.parent.create({
    data: {
      fullName: 'Zilola Nematova',
      phone: '+998909876543',
    },
  });

  await prisma.parentStudent.create({
    data: {
      parentId: parent2.id,
      studentId: studentJasur.id,
    },
  });

  // 9. Seed some Grades and Attendance for Alisher and Madina across two years
  // Current Academic Year (2025-2026)
  // Math Grades for Alisher
  await prisma.grade.createMany({
    data: [
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2025-10-15T00:00:00.000Z'), value: 5, quarter: 1, topic: 'Kvadrat tenglamalar' },
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2025-11-20T00:00:00.000Z'), value: 4, quarter: 2, topic: 'Funksiya grafiklari' },
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2026-02-10T00:00:00.000Z'), value: 5, quarter: 3, topic: 'Trigonometriya' },
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2026-04-18T00:00:00.000Z'), value: 5, quarter: 4, topic: 'Limitlar' },
    ]
  });

  // English Grades for Alisher
  await prisma.grade.createMany({
    data: [
      { studentId: studentAlisher.id, subjectId: english.id, teacherId: teacherJamshid.id, date: new Date('2025-09-12T00:00:00.000Z'), value: 4, quarter: 1, topic: 'Present Perfect' },
      { studentId: studentAlisher.id, subjectId: english.id, teacherId: teacherJamshid.id, date: new Date('2025-12-05T00:00:00.000Z'), value: 5, quarter: 2, topic: 'Passive Voice' },
      { studentId: studentAlisher.id, subjectId: english.id, teacherId: teacherJamshid.id, date: new Date('2026-03-11T00:00:00.000Z'), value: 4, quarter: 3, topic: 'Reported Speech' },
    ]
  });

  // Previous Academic Year (2024-2025) - Alisher got some grades too (when he was in 4th grade)
  await prisma.grade.createMany({
    data: [
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2024-10-10T00:00:00.000Z'), value: 4, quarter: 1, topic: 'Ko\'paytirish jadvali' },
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2024-11-15T00:00:00.000Z'), value: 3, quarter: 2, topic: 'Bo\'lish amali' },
      { studentId: studentAlisher.id, subjectId: math.id, teacherId: teacherJamshid.id, date: new Date('2025-03-20T00:00:00.000Z'), value: 4, quarter: 3, topic: 'Oddiy kasrlar' },
      
      { studentId: studentAlisher.id, subjectId: english.id, teacherId: teacherJamshid.id, date: new Date('2024-09-20T00:00:00.000Z'), value: 5, quarter: 1, topic: 'Present Simple' },
      { studentId: studentAlisher.id, subjectId: english.id, teacherId: teacherJamshid.id, date: new Date('2025-01-18T00:00:00.000Z'), value: 5, quarter: 2, topic: 'Past Simple' },
    ]
  });

  // Attendance for Alisher
  await prisma.attendance.createMany({
    data: [
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2025-10-15T00:00:00.000Z'), status: 'PRESENT' },
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2025-10-22T00:00:00.000Z'), status: 'LATE' },
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2025-10-29T00:00:00.000Z'), status: 'PRESENT' },
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2025-11-05T00:00:00.000Z'), status: 'ABSENT' },
      
      { studentId: studentAlisher.id, subjectId: english.id, date: new Date('2025-09-12T00:00:00.000Z'), status: 'PRESENT' },
      { studentId: studentAlisher.id, subjectId: english.id, date: new Date('2025-09-19T00:00:00.000Z'), status: 'PRESENT' },
      
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2024-10-10T00:00:00.000Z'), status: 'PRESENT' },
      { studentId: studentAlisher.id, subjectId: math.id, date: new Date('2024-10-17T00:00:00.000Z'), status: 'PRESENT' },
    ]
  });

  console.log('Seeding completed successfully!');
  console.log('Admin login: smart_admin / admin123');
  console.log('Teacher login: jamshid_t / teacher123');
  console.log('Parent Phone: +998901234567 (links Alisher and Madina)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
