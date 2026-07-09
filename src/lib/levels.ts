export type LevelRecord = { nameFr: string; nameEn: string };

export function levelName(level: LevelRecord, locale: string): string {
  return locale === "fr" ? level.nameFr : level.nameEn;
}
