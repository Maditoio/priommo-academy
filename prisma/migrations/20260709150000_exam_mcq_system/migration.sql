-- CreateEnum
CREATE TYPE "ExamAttemptMode" AS ENUM ('OFFICIAL', 'PRACTICE');

-- CreateTable CertificationLevel
CREATE TABLE "CertificationLevel" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CertificationLevel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CertificationLevel_slug_key" ON "CertificationLevel"("slug");

-- Seed levels
INSERT INTO "CertificationLevel" ("id", "slug", "nameFr", "nameEn", "rank") VALUES
  ('level-debutant', 'debutant', 'Débutant', 'Beginner', 1),
  ('level-professionnel', 'professionnel', 'Professionnel', 'Professional', 2),
  ('level-specialise', 'specialise', 'Spécialisé', 'Specialized', 3),
  ('level-executif', 'executif', 'Exécutif', 'Executive', 4);

-- Add levelId to Course
ALTER TABLE "Course" ADD COLUMN "levelId" TEXT;

UPDATE "Course" SET "levelId" = 'level-debutant' WHERE "level" ILIKE '%débutant%' OR "level" ILIKE '%beginner%';
UPDATE "Course" SET "levelId" = 'level-professionnel' WHERE "levelId" IS NULL AND ("level" ILIKE '%professionnel%' OR "level" ILIKE '%professional%');
UPDATE "Course" SET "levelId" = 'level-debutant' WHERE "levelId" IS NULL;

ALTER TABLE "Course" ALTER COLUMN "levelId" SET NOT NULL;
ALTER TABLE "Course" DROP COLUMN "level";
ALTER TABLE "Course" ADD CONSTRAINT "Course_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "CertificationLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add levelId to Certification
ALTER TABLE "Certification" ADD COLUMN "levelId" TEXT;

UPDATE "Certification" SET "levelId" = 'level-debutant' WHERE "level" ILIKE '%débutant%' OR "level" ILIKE '%beginner%';
UPDATE "Certification" SET "levelId" = 'level-professionnel' WHERE "levelId" IS NULL AND ("level" ILIKE '%professionnel%' OR "level" ILIKE '%professional%');
UPDATE "Certification" SET "levelId" = 'level-debutant' WHERE "levelId" IS NULL;

ALTER TABLE "Certification" ALTER COLUMN "levelId" SET NOT NULL;
ALTER TABLE "Certification" DROP COLUMN "level";
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "CertificationLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ExamCategory
CREATE TABLE "ExamCategory" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "nameFr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    CONSTRAINT "ExamCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExamCategory_courseId_slug_key" ON "ExamCategory"("courseId", "slug");
ALTER TABLE "ExamCategory" ADD CONSTRAINT "ExamCategory_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend Exam
ALTER TABLE "Exam" ADD COLUMN "durationMin" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Exam" ADD COLUMN "maxAttempts" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Exam" ADD COLUMN "isPractice" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Exam" ADD COLUMN "questionCount" INTEGER;

-- ExamCategoryRequirement
CREATE TABLE "ExamCategoryRequirement" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL,
    CONSTRAINT "ExamCategoryRequirement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExamCategoryRequirement_examId_categoryId_key" ON "ExamCategoryRequirement"("examId", "categoryId");
ALTER TABLE "ExamCategoryRequirement" ADD CONSTRAINT "ExamCategoryRequirement_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamCategoryRequirement" ADD CONSTRAINT "ExamCategoryRequirement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExamCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ExamQuestion
CREATE TABLE "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "promptFr" TEXT NOT NULL,
    "promptEn" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "CertificationLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamQuestion" ADD CONSTRAINT "ExamQuestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExamCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ExamChoice
CREATE TABLE "ExamChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "labelFr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ExamChoice_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ExamChoice" ADD CONSTRAINT "ExamChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Extend ExamAttempt
ALTER TABLE "ExamAttempt" ADD COLUMN "mode" "ExamAttemptMode" NOT NULL DEFAULT 'OFFICIAL';
ALTER TABLE "ExamAttempt" ADD COLUMN "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExamAttempt" ADD COLUMN "endsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ExamAttempt" ADD COLUMN "finishedAt" TIMESTAMP(3);
ALTER TABLE "ExamAttempt" ADD COLUMN "timedOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ExamAttempt" ADD COLUMN "categoryScores" JSONB;
ALTER TABLE "ExamAttempt" ADD COLUMN "questionIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ExamAttemptAnswer
CREATE TABLE "ExamAttemptAnswer" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "choiceId" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "ExamAttemptAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExamAttemptAnswer_attemptId_questionId_key" ON "ExamAttemptAnswer"("attemptId", "questionId");
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "ExamAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "ExamQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExamAttemptAnswer" ADD CONSTRAINT "ExamAttemptAnswer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "ExamChoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
