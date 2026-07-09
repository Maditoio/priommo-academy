import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const learnerHash = await bcrypt.hash("learner123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@proimmo.cd" },
    update: {},
    create: {
      email: "admin@proimmo.cd",
      name: "Admin PROIMMO",
      passwordHash: adminHash,
      role: "ADMIN",
      locale: "fr",
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: "learner@proimmo.cd" },
    update: {},
    create: {
      email: "learner@proimmo.cd",
      name: "Jean Mukendi",
      passwordHash: learnerHash,
      role: "LEARNER",
      locale: "fr",
    },
  });

  const org = await prisma.organization.upsert({
    where: { id: "seed-org-1" },
    update: {},
    create: {
      id: "seed-org-1",
      name: "Agence Immobilière Kinshasa",
      type: "agence",
      contactEmail: "contact@agence-kin.cd",
      seats: 25,
    },
  });

  const course1 = await prisma.course.upsert({
    where: { slug: "fondamentaux-immobilier" },
    update: {},
    create: {
      slug: "fondamentaux-immobilier",
      titleFr: "Fondamentaux de l'immobilier en RDC",
      titleEn: "Real Estate Fundamentals in DRC",
      descriptionFr:
        "Maîtrisez les bases du marché immobilier congolais : cadre juridique, transactions, évaluation et gestion locative.",
      descriptionEn:
        "Master the basics of the Congolese real estate market: legal framework, transactions, valuation and property management.",
      level: "Débutant",
      price: 0,
      currency: "USD",
      published: true,
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "gestion-portefeuille-professionnel" },
    update: {},
    create: {
      slug: "gestion-portefeuille-professionnel",
      titleFr: "Gestion de portefeuille immobilier professionnel",
      titleEn: "Professional Real Estate Portfolio Management",
      descriptionFr:
        "Formation avancée pour les gestionnaires de patrimoine immobilier et les directeurs d'agence.",
      descriptionEn:
        "Advanced training for real estate portfolio managers and agency directors.",
      level: "Professionnel",
      price: 149.99,
      currency: "USD",
      published: true,
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
  });

  const mod1 = await prisma.module.upsert({
    where: { id: "seed-mod-1" },
    update: {},
    create: {
      id: "seed-mod-1",
      courseId: course1.id,
      titleFr: "Introduction au marché immobilier",
      titleEn: "Introduction to the Real Estate Market",
      order: 0,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-1" },
    update: {},
    create: {
      id: "seed-lesson-1",
      moduleId: mod1.id,
      titleFr: "Panorama du secteur en RDC",
      titleEn: "Sector Overview in DRC",
      contentType: "text",
      bodyFr: "Le marché immobilier congolais connaît une croissance soutenue...",
      bodyEn: "The Congolese real estate market is experiencing sustained growth...",
      order: 0,
      durationMin: 15,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-2" },
    update: {},
    create: {
      id: "seed-lesson-2",
      moduleId: mod1.id,
      titleFr: "Cadre juridique et réglementaire",
      titleEn: "Legal and Regulatory Framework",
      contentType: "text",
      bodyFr: "Comprendre les lois foncières et les procédures d'enregistrement...",
      bodyEn: "Understanding land laws and registration procedures...",
      order: 1,
      durationMin: 20,
    },
  });

  const mod2 = await prisma.module.upsert({
    where: { id: "seed-mod-2" },
    update: {},
    create: {
      id: "seed-mod-2",
      courseId: course1.id,
      titleFr: "Transactions immobilières",
      titleEn: "Real Estate Transactions",
      order: 1,
    },
  });

  await prisma.lesson.upsert({
    where: { id: "seed-lesson-3" },
    update: {},
    create: {
      id: "seed-lesson-3",
      moduleId: mod2.id,
      titleFr: "Processus d'achat et de vente",
      titleEn: "Buying and Selling Process",
      contentType: "text",
      order: 0,
      durationMin: 25,
    },
  });

  await prisma.exam.upsert({
    where: { id: "seed-exam-1" },
    update: {},
    create: {
      id: "seed-exam-1",
      courseId: course1.id,
      titleFr: "Examen final — Fondamentaux",
      titleEn: "Final Exam — Fundamentals",
      passingScore: 70,
    },
  });

  const certification = await prisma.certification.upsert({
    where: { slug: "cert-agent-immobilier" },
    update: { rank: 1, validityMonths: 24 },
    create: {
      slug: "cert-agent-immobilier",
      titleFr: "Certificat Agent Immobilier Certifié",
      titleEn: "Certified Real Estate Agent Certificate",
      descriptionFr:
        "Certification officielle attestant la maîtrise des fondamentaux de l'immobilier en RDC.",
      descriptionEn:
        "Official certification attesting mastery of real estate fundamentals in DRC.",
      level: "Débutant",
      rank: 1,
      validityMonths: 24,
      courseId: course1.id,
    },
  });

  const certificationPro = await prisma.certification.upsert({
    where: { slug: "cert-gestionnaire-professionnel" },
    update: { rank: 2, validityMonths: 36 },
    create: {
      slug: "cert-gestionnaire-professionnel",
      titleFr: "Certificat Gestionnaire Immobilier Professionnel",
      titleEn: "Professional Property Manager Certificate",
      descriptionFr:
        "Certification avancée pour les gestionnaires de portefeuille et directeurs d'agence.",
      descriptionEn:
        "Advanced certification for portfolio managers and agency directors.",
      level: "Professionnel",
      rank: 2,
      validityMonths: 36,
      courseId: course2.id,
    },
  });

  await prisma.exam.upsert({
    where: { id: "seed-exam-2" },
    update: {},
    create: {
      id: "seed-exam-2",
      courseId: course2.id,
      titleFr: "Examen final — Gestion professionnelle",
      titleEn: "Final Exam — Professional Management",
      passingScore: 75,
    },
  });

  console.log("Seed completed:");
  console.log("  Admin: admin@proimmo.cd / admin123");
  console.log("  Learner: learner@proimmo.cd / learner123");
  console.log(`  Courses: ${course1.slug}, ${course2.slug}`);
  console.log(`  Certification: ${certification.slug}, ${certificationPro.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
