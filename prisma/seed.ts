import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  COURSE1_BANKS,
  COURSE2_BANKS,
  generateQuestionsForCourse,
  type McqSeed,
} from "./seed-questions";

const prisma = new PrismaClient();
const QUESTIONS_PER_EXAM = 100;

async function seedLevels() {
  const levels = [
    { slug: "debutant", nameFr: "Débutant", nameEn: "Beginner", rank: 1 },
    { slug: "professionnel", nameFr: "Professionnel", nameEn: "Professional", rank: 2 },
    { slug: "specialise", nameFr: "Spécialisé", nameEn: "Specialized", rank: 3 },
    { slug: "executif", nameFr: "Exécutif", nameEn: "Executive", rank: 4 },
  ];

  const result: Record<string, { id: string }> = {};
  for (const level of levels) {
    const row = await prisma.certificationLevel.upsert({
      where: { slug: level.slug },
      update: { nameFr: level.nameFr, nameEn: level.nameEn, rank: level.rank },
      create: level,
    });
    result[level.slug] = row;
  }
  return result;
}

async function seedModules(
  courseId: string,
  modules: { id: string; titleFr: string; titleEn: string; order: number; lessons: { id: string; titleFr: string; titleEn: string; order: number; durationMin: number; bodyFr?: string; bodyEn?: string }[] }[]
) {
  for (const mod of modules) {
    const module = await prisma.module.upsert({
      where: { id: mod.id },
      update: { titleFr: mod.titleFr, titleEn: mod.titleEn, order: mod.order },
      create: {
        id: mod.id,
        courseId,
        titleFr: mod.titleFr,
        titleEn: mod.titleEn,
        order: mod.order,
      },
    });

    for (const lesson of mod.lessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {
          titleFr: lesson.titleFr,
          titleEn: lesson.titleEn,
          order: lesson.order,
          durationMin: lesson.durationMin,
          bodyFr: lesson.bodyFr,
          bodyEn: lesson.bodyEn,
        },
        create: {
          id: lesson.id,
          moduleId: module.id,
          titleFr: lesson.titleFr,
          titleEn: lesson.titleEn,
          contentType: "text",
          bodyFr: lesson.bodyFr ?? `${lesson.titleFr} — contenu de formation.`,
          bodyEn: lesson.bodyEn ?? `${lesson.titleEn} — training content.`,
          order: lesson.order,
          durationMin: lesson.durationMin,
        },
      });
    }
  }
}

async function seedQuestionBank(
  examId: string,
  levelId: string,
  categoryMap: Map<string, string>,
  questionsBySlug: Map<string, McqSeed[]>
) {
  const existing = await prisma.examQuestion.count({ where: { examId } });
  if (existing >= QUESTIONS_PER_EXAM) return existing;

  await prisma.examQuestion.deleteMany({ where: { examId } });

  let order = 0;
  for (const [slug, questions] of questionsBySlug) {
    const categoryId = categoryMap.get(slug);
    if (!categoryId) continue;

    for (const q of questions) {
      await prisma.examQuestion.create({
        data: {
          examId,
          levelId,
          categoryId,
          promptFr: q.promptFr,
          promptEn: q.promptEn,
          order: order++,
          choices: {
            create: q.choices.map((c, i) => ({
              labelFr: c.fr,
              labelEn: c.en,
              isCorrect: !!c.correct,
              order: i,
            })),
          },
        },
      });
    }
  }

  return prisma.examQuestion.count({ where: { examId } });
}

async function seedCourseExams(params: {
  courseId: string;
  levelId: string;
  officialExamId: string;
  practiceExamId: string;
  courseLabel: string;
  banks: typeof COURSE1_BANKS;
  categoryRecords: { slug: string; nameFr: string; nameEn: string }[];
  officialTitle: { fr: string; en: string };
  practiceTitle: { fr: string; en: string };
  passingScore: number;
  durationMin: number;
  questionCount: number;
}) {
  const categoryMap = new Map<string, string>();

  for (const cat of params.categoryRecords) {
    const row = await prisma.examCategory.upsert({
      where: { courseId_slug: { courseId: params.courseId, slug: cat.slug } },
      update: { nameFr: cat.nameFr, nameEn: cat.nameEn },
      create: {
        courseId: params.courseId,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        slug: cat.slug,
      },
    });
    categoryMap.set(cat.slug, row.id);
  }

  const officialExam = await prisma.exam.upsert({
    where: { id: params.officialExamId },
    update: {
      durationMin: params.durationMin,
      maxAttempts: 3,
      isPractice: false,
      questionCount: params.questionCount,
      passingScore: params.passingScore,
    },
    create: {
      id: params.officialExamId,
      courseId: params.courseId,
      titleFr: params.officialTitle.fr,
      titleEn: params.officialTitle.en,
      passingScore: params.passingScore,
      durationMin: params.durationMin,
      maxAttempts: 3,
      isPractice: false,
      questionCount: params.questionCount,
    },
  });

  const practiceExam = await prisma.exam.upsert({
    where: { id: params.practiceExamId },
    update: { isPractice: true, maxAttempts: 999, durationMin: Math.max(30, params.durationMin - 15) },
    create: {
      id: params.practiceExamId,
      courseId: params.courseId,
      titleFr: params.practiceTitle.fr,
      titleEn: params.practiceTitle.en,
      passingScore: Math.max(50, params.passingScore - 10),
      durationMin: Math.max(30, params.durationMin - 15),
      maxAttempts: 999,
      isPractice: true,
    },
  });

  for (const categoryId of categoryMap.values()) {
    await prisma.examCategoryRequirement.upsert({
      where: { examId_categoryId: { examId: officialExam.id, categoryId } },
      update: { minScore: 60 },
      create: { examId: officialExam.id, categoryId, minScore: 60 },
    });
  }

  const questionsBySlug = generateQuestionsForCourse(
    params.courseLabel,
    params.banks,
    QUESTIONS_PER_EXAM
  );

  const officialCount = await seedQuestionBank(
    officialExam.id,
    params.levelId,
    categoryMap,
    questionsBySlug
  );
  const practiceCount = await seedQuestionBank(
    practiceExam.id,
    params.levelId,
    categoryMap,
    questionsBySlug
  );

  return { officialCount, practiceCount };
}

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);
  const learnerHash = await bcrypt.hash("learner123", 12);
  const learner2Hash = await bcrypt.hash("learner123", 12);

  const levels = await seedLevels();
  const levelDebutant = levels.debutant.id;
  const levelPro = levels.professionnel.id;

  await prisma.user.upsert({
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

  const learner2 = await prisma.user.upsert({
    where: { email: "learner2@proimmo.cd" },
    update: {},
    create: {
      email: "learner2@proimmo.cd",
      name: "Marie Kabila",
      passwordHash: learner2Hash,
      role: "LEARNER",
      locale: "fr",
    },
  });

  await prisma.organization.upsert({
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
    update: { levelId: levelDebutant, published: true },
    create: {
      slug: "fondamentaux-immobilier",
      titleFr: "Fondamentaux de l'immobilier en RDC",
      titleEn: "Real Estate Fundamentals in DRC",
      descriptionFr:
        "Maîtrisez les bases du marché immobilier congolais : cadre juridique, transactions, évaluation et gestion locative.",
      descriptionEn:
        "Master the basics of the Congolese real estate market: legal framework, transactions, valuation and property management.",
      levelId: levelDebutant,
      price: 0,
      currency: "USD",
      published: true,
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "gestion-portefeuille-professionnel" },
    update: { levelId: levelPro, published: true },
    create: {
      slug: "gestion-portefeuille-professionnel",
      titleFr: "Gestion de portefeuille immobilier professionnel",
      titleEn: "Professional Real Estate Portfolio Management",
      descriptionFr:
        "Formation avancée pour les gestionnaires de patrimoine immobilier et les directeurs d'agence.",
      descriptionEn:
        "Advanced training for real estate portfolio managers and agency directors.",
      levelId: levelPro,
      price: 149.99,
      currency: "USD",
      published: true,
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    },
  });

  await seedModules(course1.id, [
    {
      id: "seed-mod-1",
      titleFr: "Introduction au marché immobilier",
      titleEn: "Introduction to the Real Estate Market",
      order: 0,
      lessons: [
        {
          id: "seed-lesson-1",
          titleFr: "Panorama du secteur en RDC",
          titleEn: "Sector Overview in DRC",
          order: 0,
          durationMin: 15,
          bodyFr: "Analyse des tendances urbaines, demande résidentielle et commerciale à Kinshasa et dans les capitales provinciales.",
          bodyEn: "Analysis of urban trends, residential and commercial demand in Kinshasa and provincial capitals.",
        },
        {
          id: "seed-lesson-2",
          titleFr: "Acteurs et chaîne de valeur",
          titleEn: "Stakeholders and Value Chain",
          order: 1,
          durationMin: 20,
          bodyFr: "Promoteurs, agences, notaires, banques et autorités : rôles et interactions.",
          bodyEn: "Developers, agencies, notaries, banks and authorities: roles and interactions.",
        },
      ],
    },
    {
      id: "seed-mod-2",
      titleFr: "Cadre juridique et réglementaire",
      titleEn: "Legal and Regulatory Framework",
      order: 1,
      lessons: [
        {
          id: "seed-lesson-3",
          titleFr: "Titres fonciers et enregistrement",
          titleEn: "Land Titles and Registration",
          order: 0,
          durationMin: 25,
          bodyFr: "Procédures d'obtention, vérification et sécurisation des titres.",
          bodyEn: "Procedures for obtaining, verifying and securing titles.",
        },
        {
          id: "seed-lesson-4",
          titleFr: "Baux et copropriété",
          titleEn: "Leases and Condominium",
          order: 1,
          durationMin: 20,
          bodyFr: "Clauses essentielles, obligations réciproques et gestion des parties communes.",
          bodyEn: "Essential clauses, mutual obligations and common area management.",
        },
      ],
    },
    {
      id: "seed-mod-3",
      titleFr: "Transactions immobilières",
      titleEn: "Real Estate Transactions",
      order: 2,
      lessons: [
        {
          id: "seed-lesson-5",
          titleFr: "Mandats et commercialisation",
          titleEn: "Mandates and Marketing",
          order: 0,
          durationMin: 25,
          bodyFr: "Mandat simple, exclusif, estimation et stratégie de mise en marché.",
          bodyEn: "Simple and exclusive mandates, appraisal and go-to-market strategy.",
        },
        {
          id: "seed-lesson-6",
          titleFr: "Due diligence et closing",
          titleEn: "Due Diligence and Closing",
          order: 1,
          durationMin: 30,
          bodyFr: "Check-list documentaire, négociation finale et remise des clés.",
          bodyEn: "Document checklist, final negotiation and key handover.",
        },
      ],
    },
    {
      id: "seed-mod-4",
      titleFr: "Gestion locative",
      titleEn: "Property Management",
      order: 3,
      lessons: [
        {
          id: "seed-lesson-7",
          titleFr: "Exploitation et recouvrement",
          titleEn: "Operations and Collection",
          order: 0,
          durationMin: 25,
          bodyFr: "Quittancement, indexation, procédures d'impayés et relation locataire.",
          bodyEn: "Rent receipts, indexation, arrears procedures and tenant relations.",
        },
        {
          id: "seed-lesson-8",
          titleFr: "Indicateurs de performance",
          titleEn: "Performance Indicators",
          order: 1,
          durationMin: 20,
          bodyFr: "Taux d'occupation, vacance, rendement brut et net.",
          bodyEn: "Occupancy, vacancy, gross and net yield.",
        },
      ],
    },
  ]);

  await seedModules(course2.id, [
    {
      id: "seed-mod-pro-1",
      titleFr: "Analyse de portefeuille",
      titleEn: "Portfolio Analysis",
      order: 0,
      lessons: [
        {
          id: "seed-lesson-pro-1",
          titleFr: "KPI et reporting",
          titleEn: "KPIs and Reporting",
          order: 0,
          durationMin: 30,
          bodyFr: "Tableaux de bord, TRI, VAN et cap rate appliqués au portefeuille.",
          bodyEn: "Dashboards, IRR, NPV and cap rate applied to the portfolio.",
        },
        {
          id: "seed-lesson-pro-2",
          titleFr: "Diversification et risque",
          titleEn: "Diversification and Risk",
          order: 1,
          durationMin: 25,
          bodyFr: "Répartition géographique, typologique et analyse de sensibilité.",
          bodyEn: "Geographic and typological allocation and sensitivity analysis.",
        },
      ],
    },
    {
      id: "seed-mod-pro-2",
      titleFr: "Finance immobilière",
      titleEn: "Real Estate Finance",
      order: 1,
      lessons: [
        {
          id: "seed-lesson-pro-3",
          titleFr: "Structuration de la dette",
          titleEn: "Debt Structuring",
          order: 0,
          durationMin: 35,
          bodyFr: "LTV, DSCR, covenants et refinancement.",
          bodyEn: "LTV, DSCR, covenants and refinancing.",
        },
        {
          id: "seed-lesson-pro-4",
          titleFr: "Trésorerie et prévisions",
          titleEn: "Cash Flow and Forecasting",
          order: 1,
          durationMin: 30,
          bodyFr: "Budgets pluriannuels, scénarios et provisions.",
          bodyEn: "Multi-year budgets, scenarios and provisions.",
        },
      ],
    },
    {
      id: "seed-mod-pro-3",
      titleFr: "Opérations et risques",
      titleEn: "Operations and Risk",
      order: 2,
      lessons: [
        {
          id: "seed-lesson-pro-5",
          titleFr: "Maintenance et conformité",
          titleEn: "Maintenance and Compliance",
          order: 0,
          durationMin: 25,
          bodyFr: "Plans préventifs, audits techniques et gestion des sinistres.",
          bodyEn: "Preventive plans, technical audits and claims management.",
        },
        {
          id: "seed-lesson-pro-6",
          titleFr: "Gestion fournisseurs",
          titleEn: "Vendor Management",
          order: 1,
          durationMin: 20,
          bodyFr: "SLA, contrats cadres et contrôle qualité.",
          bodyEn: "SLAs, framework contracts and quality control.",
        },
      ],
    },
    {
      id: "seed-mod-pro-4",
      titleFr: "Stratégie patrimoniale",
      titleEn: "Asset Strategy",
      order: 3,
      lessons: [
        {
          id: "seed-lesson-pro-7",
          titleFr: "Politiques d'acquisition et de sortie",
          titleEn: "Acquisition and Exit Policies",
          order: 0,
          durationMin: 30,
          bodyFr: "Critères d'investissement, arbitrages et cycle de vie des actifs.",
          bodyEn: "Investment criteria, arbitrage and asset lifecycle.",
        },
        {
          id: "seed-lesson-pro-8",
          titleFr: "ESG et repositionnement",
          titleEn: "ESG and Repositioning",
          order: 1,
          durationMin: 25,
          bodyFr: "Intégration ESG, value-add et stratégies core/core+.",
          bodyEn: "ESG integration, value-add and core/core+ strategies.",
        },
      ],
    },
  ]);

  const course1Exams = await seedCourseExams({
    courseId: course1.id,
    levelId: levelDebutant,
    officialExamId: "seed-exam-1",
    practiceExamId: "seed-exam-practice-1",
    courseLabel: "Fondamentaux",
    banks: COURSE1_BANKS,
    categoryRecords: COURSE1_BANKS.map((b) => ({
      slug: b.slug,
      nameFr: b.nameFr,
      nameEn: b.nameEn,
    })),
    officialTitle: {
      fr: "Examen final — Fondamentaux",
      en: "Final Exam — Fundamentals",
    },
    practiceTitle: {
      fr: "Entraînement — Fondamentaux",
      en: "Practice — Fundamentals",
    },
    passingScore: 70,
    durationMin: 45,
    questionCount: 20,
  });

  const course2Exams = await seedCourseExams({
    courseId: course2.id,
    levelId: levelPro,
    officialExamId: "seed-exam-2",
    practiceExamId: "seed-exam-practice-2",
    courseLabel: "Portefeuille Pro",
    banks: COURSE2_BANKS,
    categoryRecords: COURSE2_BANKS.map((b) => ({
      slug: b.slug,
      nameFr: b.nameFr,
      nameEn: b.nameEn,
    })),
    officialTitle: {
      fr: "Examen final — Gestion professionnelle",
      en: "Final Exam — Professional Management",
    },
    practiceTitle: {
      fr: "Entraînement — Gestion professionnelle",
      en: "Practice — Professional Management",
    },
    passingScore: 75,
    durationMin: 60,
    questionCount: 25,
  });

  const certification = await prisma.certification.upsert({
    where: { slug: "cert-agent-immobilier" },
    update: { rank: 1, validityMonths: 24, levelId: levelDebutant },
    create: {
      slug: "cert-agent-immobilier",
      titleFr: "Certificat Agent Immobilier Certifié",
      titleEn: "Certified Real Estate Agent Certificate",
      descriptionFr:
        "Certification officielle attestant la maîtrise des fondamentaux de l'immobilier en RDC.",
      descriptionEn:
        "Official certification attesting mastery of real estate fundamentals in DRC.",
      levelId: levelDebutant,
      rank: 1,
      validityMonths: 24,
      courseId: course1.id,
    },
  });

  await prisma.certification.upsert({
    where: { slug: "cert-gestionnaire-professionnel" },
    update: { rank: 2, validityMonths: 36, levelId: levelPro },
    create: {
      slug: "cert-gestionnaire-professionnel",
      titleFr: "Certificat Gestionnaire Immobilier Professionnel",
      titleEn: "Professional Property Manager Certificate",
      descriptionFr:
        "Certification avancée pour les gestionnaires de portefeuille et directeurs d'agence.",
      descriptionEn:
        "Advanced certification for portfolio managers and agency directors.",
      levelId: levelPro,
      rank: 2,
      validityMonths: 36,
      courseId: course2.id,
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: course1.id } },
    update: { progressPct: 85 },
    create: {
      userId: learner.id,
      courseId: course1.id,
      status: "ACTIVE",
      progressPct: 85,
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner2.id, courseId: course1.id } },
    update: { progressPct: 85 },
    create: {
      userId: learner2.id,
      courseId: course1.id,
      status: "ACTIVE",
      progressPct: 85,
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: learner.id, courseId: course2.id } },
    update: { progressPct: 60 },
    create: {
      userId: learner.id,
      courseId: course2.id,
      status: "ACTIVE",
      progressPct: 60,
    },
  });

  console.log("Seed completed:");
  console.log("  Admin: admin@proimmo.cd / admin123");
  console.log("  Learner 1: learner@proimmo.cd / learner123");
  console.log("  Learner 2: learner2@proimmo.cd / learner123  (for concurrent exam testing)");
  console.log(`  Course 1: ${course1.slug} — ${course1Exams.officialCount} official + ${course1Exams.practiceCount} practice questions`);
  console.log(`  Course 2: ${course2.slug} — ${course2Exams.officialCount} official + ${course2Exams.practiceCount} practice questions`);
  console.log(`  Certification: ${certification.slug}`);
  console.log("  Each attempt draws a random subset (20 official / 10 practice) from the 100-question bank.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
