import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { roles } from "../utils/roles.js";

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Seed Clinics
  const clinics = [
    { clinic_name: "عيادة الباطنة" },
    { clinic_name: "عيادة الرمد" },
    { clinic_name: "عيادة الأسنان" },
    { clinic_name: "عيادة العظام" },
  ];

  for (const clinic of clinics) {
    await prisma.clinics.upsert({
      where: { clinic_name: clinic.clinic_name },
      update: {},
      create: clinic,
    });
  }

  // 2. Seed Levels
  const levels = [
    { level_name: "فرقة أولي" },
    { level_name: "فرقة تانية" },
    { level_name: "فرقة تالتة" },
    { level_name: "فرقة رابعة" },
  ];

  for (const level of levels) {
    await prisma.levels.upsert({
      where: { level_name: level.level_name },
      update: {},
      create: level,
    });
  }

  // 3. Seed Nationalities
  const nationalities = [
    { nationality_name: "مصري" },
    { nationality_name: "وافد" },
  ];

  for (const nationality of nationalities) {
    await prisma.nationality.upsert({
      where: { nationality_name: nationality.nationality_name },
      update: {},
      create: nationality,
    });
  }

  // 4. Seed External Hospitals
  const hospitals = [
    { hospital_name: "مستشفى بدر الجامعي" },
    { hospital_name: "مستشفى 15 مايو" },
  ];

  for (const hospital of hospitals) {
    await prisma.external_hospitals.upsert({
      where: { hospital_name: hospital.hospital_name },
      update: {},
      create: hospital,
    });
  }

  // 5. Seed Governorates
  const governorates = [
    { gov_name: "القاهرة" },
    { gov_name: "الجيزة" },
    { gov_name: "الإسكندرية" },
    { gov_name: "الدقهلية" },
    { gov_name: "البحر الأحمر" },
    { gov_name: "البحيرة" },
    { gov_name: "الفيوم" },
    { gov_name: "الغربية" },
    { gov_name: "الإسماعيلية" },
    { gov_name: "المنوفية" },
    { gov_name: "المنيا" },
    { gov_name: "القليوبية" },
    { gov_name: "الوادي الجديد" },
    { gov_name: "السويس" },
    { gov_name: "أسوان" },
    { gov_name: "أسيوط" },
    { gov_name: "بني سويف" },
    { gov_name: "بورسعيد" },
    { gov_name: "دمياط" },
    { gov_name: "الشرقية" },
    { gov_name: "جنوب سيناء" },
    { gov_name: "كفر الشيخ" },
    { gov_name: "مطروح" },
    { gov_name: "الأقصر" },
    { gov_name: "قنا" },
    { gov_name: "شمال سيناء" },
    { gov_name: "سوهاج" },
  ];

  for (const gov of governorates) {
    await prisma.governorates.upsert({
      where: { gov_name: gov.gov_name },
      update: {},
      create: gov,
    });
  }

  // 6. Seed Faculties
  const faculties = [
    { faculty_name: "كلية الحاسبات والذكاء الاصطناعي" },
    { faculty_name: "كلية الهندسة بحلوان" },
    { faculty_name: "كلية الهندسة بالمطرية" },
    { faculty_name: "كلية الطب" },
    { faculty_name: "كلية الصيدلة" },
    { faculty_name: "كلية التمريض" },
    { faculty_name: "كلية العلوم" },
    { faculty_name: "كلية التجارة وإدارة الأعمال" },
    { faculty_name: "كلية الحقوق" },
    { faculty_name: "كلية الآداب" },
    { faculty_name: "كلية التربية" },
    { faculty_name: "كلية الفنون الجميلة" },
    { faculty_name: "كلية الفنون التطبيقية" },
    { faculty_name: "كلية التربية الفنية" },
    { faculty_name: "كلية التربية الموسيقية" },
    { faculty_name: "كلية التربية الرياضية بنين" },
    { faculty_name: "كلية التربية الرياضية بنات" },
    { faculty_name: "كلية الاقتصاد المنزلي" },
    { faculty_name: "كلية الخدمة الاجتماعية" },
    { faculty_name: "كلية السياحة والفنادق" },
    { faculty_name: "كلية التكنولوجيا والتعليم الصناعي" },
  ];

  for (const faculty of faculties) {
    await prisma.faculties.upsert({
      where: { faculty_name: faculty.faculty_name },
      update: {},
      create: faculty,
    });
  }

  // 7. Seed Admins (Super Admin and Staff)
  const defaultPassword = await bcrypt.hash("Test1234$", 12);

  // Super Admin
  await prisma.admins.upsert({
    where: { email: "superadmin@hsh.com" },
    update: {
      password: defaultPassword,
      role: roles.SUPER_ADMIN,
      status: "ACTIVE",
    },
    create: {
      username: "superadmin",
      email: "superadmin@hsh.com",
      password: defaultPassword,
      role: roles.SUPER_ADMIN,
      status: "ACTIVE",
    },
  });

  // Second Manager
  await prisma.admins.upsert({
    where: { email: "manager@hsh.com" },
    update: {
      password: defaultPassword,
      role: roles.SECOND_MANAGER,
      status: "ACTIVE",
    },
    create: {
      username: "manager",
      email: "manager@hsh.com",
      password: defaultPassword,
      role: roles.SECOND_MANAGER,
      status: "ACTIVE",
    },
  });

  // Counter Staff
  await prisma.admins.upsert({
    where: { email: "counter@hsh.com" },
    update: {
      password: defaultPassword,
      role: roles.COUNTER,
      status: "ACTIVE",
    },
    create: {
      username: "counter_staff",
      email: "counter@hsh.com",
      password: defaultPassword,
      role: roles.COUNTER,
      status: "ACTIVE",
    },
  });

  // 8. Seed Sample Users (Students)
  const defaultLevel = (await prisma.levels.findFirst()) || { id: 1 };
  const defaultGov = (await prisma.governorates.findFirst()) || { id: 1 };
  const defaultFaculty = (await prisma.faculties.findFirst()) || { id: 1 };
  const defaultNationality = (await prisma.nationality.findFirst()) || { id: 1 };

  const studentPassword = await bcrypt.hash("Test1234$", 12);

  let user1 = await prisma.users.findUnique({
    where: { email: "user@fci.helwan.edu.eg" },
  });

  if (!user1) {
    user1 = await prisma.users.create({
      data: {
        username: "abdelkhalek",
        email: "user@fci.helwan.edu.eg",
        password: studentPassword,
        national_id: "12343678916932",
        nationality_id: defaultNationality.id,
        level_id: defaultLevel.id,
        gov_id: defaultGov.id,
        faculty_id: defaultFaculty.id,
        gender: "MALE",
        birth_date: new Date("2002-11-05"),
        phone_number: "01134327898",
        verified: true,
        is_active: true,
        user_image_path: "uploads/default.png",
        national_id_path: "uploads/default-id.png",
        fees_path: "uploads/default-fees.png",
      },
    });
  }

  let user2 = await prisma.users.findUnique({
    where: { email: "mariam@fci.helwan.edu.eg" },
  });

  if (!user2) {
    user2 = await prisma.users.create({
      data: {
        username: "mariam",
        email: "mariam@fci.helwan.edu.eg",
        password: studentPassword,
        national_id: "30209151234568",
        nationality_id: defaultNationality.id,
        level_id: defaultLevel.id,
        gov_id: defaultGov.id,
        faculty_id: defaultFaculty.id,
        gender: "FEMALE",
        birth_date: new Date("2003-09-15"),
        phone_number: "01098765432",
        verified: true,
        is_active: true,
        user_image_path: "uploads/default.png",
        national_id_path: "uploads/default-id.png",
        fees_path: "uploads/default-fees.png",
      },
    });
  }

  // 9. Seed Clinics & Hospitals references for Reservations
  const internalClinic = await prisma.clinics.findFirst({
    where: { clinic_name: { contains: "باطنة" } },
  });
  const eyeClinic = await prisma.clinics.findFirst({
    where: { clinic_name: { contains: "رمد" } },
  });
  const dentalClinic = await prisma.clinics.findFirst({
    where: { clinic_name: { contains: "أسنان" } },
  });
  const orthoClinic = await prisma.clinics.findFirst({
    where: { clinic_name: { contains: "عظام" } },
  });

  const badrHsp = await prisma.external_hospitals.findFirst({
    where: { hospital_name: { contains: "بدر" } },
  });
  const may15Hsp = await prisma.external_hospitals.findFirst({
    where: { hospital_name: { contains: "15 مايو" } },
  });

  // 10. Seed Reservation Requests (Medical Examinations & Transfers)
  const reservationsToSeed = [
    // --- Abdelkhalek reservations ---
    {
      user_id: user1.id,
      clinic_id: internalClinic ? internalClinic.id : 1,
      exam_type: "NEW_EXAM",
      status: "ACCEPTED",
      date: new Date("2026-10-18T09:00:00.000Z"),
    },
    {
      user_id: user1.id,
      clinic_id: dentalClinic ? dentalClinic.id : 3,
      exam_type: "NEW_EXAM",
      status: "ACCEPTED",
      date: new Date("2026-10-20T10:30:00.000Z"),
      transfer: {
        hospital_id: badrHsp ? badrHsp.id : 1,
        transfer_reason: "إجراء أشعة بانوراما على الفك وعلاج عصب تخصصي",
        notes: "يرجى التوجه لقسم جراحة الفم والأسنان مصطحباً الكارنيه الجامعي",
        status: "accepted",
      },
    },
    {
      user_id: user1.id,
      clinic_id: eyeClinic ? eyeClinic.id : 2,
      exam_type: "FOLLOW_UP",
      status: "PENDING",
      date: new Date("2026-10-22T11:00:00.000Z"),
    },
    {
      user_id: user1.id,
      clinic_id: orthoClinic ? orthoClinic.id : 4,
      exam_type: "EMERGENCY",
      status: "ACCEPTED",
      date: new Date("2026-10-25T12:00:00.000Z"),
      transfer: {
        hospital_id: may15Hsp ? may15Hsp.id : 2,
        transfer_reason: "اشتباه كسر في مشط القدم وإجراء أشعة مقطعية",
        notes: "حالة طارئة تتطلب كشف عاجل",
        status: "pending",
      },
    },
    {
      user_id: user1.id,
      clinic_id: internalClinic ? internalClinic.id : 1,
      exam_type: "FOLLOW_UP",
      status: "ACCEPTED",
      date: new Date("2026-09-15T09:30:00.000Z"),
    },
    // --- Mariam reservations ---
    {
      user_id: user2.id,
      clinic_id: eyeClinic ? eyeClinic.id : 2,
      exam_type: "NEW_EXAM",
      status: "PENDING",
      date: new Date("2026-10-19T09:00:00.000Z"),
    },
    {
      user_id: user2.id,
      clinic_id: dentalClinic ? dentalClinic.id : 3,
      exam_type: "EMERGENCY",
      status: "PENDING",
      date: new Date("2026-10-24T11:30:00.000Z"),
    },
  ];

  for (const { transfer, ...examData } of reservationsToSeed) {
    let exam = await prisma.medical_examinations.findFirst({
      where: {
        user_id: examData.user_id,
        clinic_id: examData.clinic_id,
        date: examData.date,
      },
    });

    if (!exam) {
      exam = await prisma.medical_examinations.create({
        data: examData,
      });
    }

    if (transfer && exam) {
      const existingTransfer = await prisma.transfers.findFirst({
        where: {
          medical_exam_id: exam.id,
        },
      });

      if (!existingTransfer) {
        await prisma.transfers.create({
          data: {
            medical_exam_id: exam.id,
            hospital_id: transfer.hospital_id,
            transfer_reason: transfer.transfer_reason,
            notes: transfer.notes,
            status: transfer.status,
          },
        });
      }
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
