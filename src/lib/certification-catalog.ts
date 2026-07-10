import { localizedField } from "@/lib/utils";
import { levelName } from "@/lib/levels";

type CertificationWithRelations = {
  slug: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  validityMonths: number;
  rank: number;
  level: { nameFr: string; nameEn: string; rank: number };
  course?: {
    slug: string;
    titleFr: string;
    titleEn: string;
    exams: { passingScore: number; isPractice: boolean }[];
  } | null;
};

export type CertificationCatalogRow = {
  slug: string;
  title: string;
  levelLabel: string;
  levelRank: number;
  description: string;
  requirements: string;
  validityLabel: string;
};

export function toCertificationCatalogRow(
  cert: CertificationWithRelations,
  locale: string,
  labels: {
    validityMonths: string;
    passOfficialExam: string;
    completePrepProgram: string;
    prerequisitePro: string;
    programInDevelopment: string;
  }
): CertificationCatalogRow {
  const title = localizedField(cert, "title", locale);
  const description = localizedField(cert, "description", locale);
  const levelLabel = levelName(cert.level, locale);
  const officialExam = cert.course?.exams.find((e) => !e.isPractice);

  let requirements: string;
  if (officialExam && cert.course) {
    requirements = labels.passOfficialExam
      .replace("{score}", String(officialExam.passingScore))
      .replace("{program}", localizedField(cert.course, "title", locale));
  } else if (cert.level.rank >= 3) {
    requirements = labels.prerequisitePro;
  } else {
    requirements = labels.programInDevelopment;
  }

  return {
    slug: cert.slug,
    title,
    levelLabel,
    levelRank: cert.level.rank,
    description,
    requirements,
    validityLabel: labels.validityMonths.replace("{months}", String(cert.validityMonths)),
  };
}
