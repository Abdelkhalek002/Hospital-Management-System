import prisma from "../config/prisma.js";

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
    { level_name: "مستوى 1" },
    { level_name: "مستوى 2" },
    { level_name: "مستوى 3" },
    { level_name: "مستوى 4" },
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
