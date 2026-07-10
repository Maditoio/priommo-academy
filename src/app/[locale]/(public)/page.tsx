import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { toCertificationCatalogRow } from "@/lib/certification-catalog";
import { levelName } from "@/lib/levels";
import { CertificationCard } from "@/components/public/certification-card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("home");
  const tc = await getTranslations("certifications");
  const tnav = await getTranslations("nav");

  const [certifications, levels, issuedCount] = await Promise.all([
    db.certification.findMany({
      take: 4,
      orderBy: { rank: "asc" },
      include: {
        level: true,
        course: {
          select: {
            slug: true,
            titleFr: true,
            titleEn: true,
            exams: { where: { isPractice: false }, select: { passingScore: true, isPractice: true } },
          },
        },
      },
    }),
    db.certificationLevel.findMany({ orderBy: { rank: "asc" } }),
    db.certificateIssued.count({ where: { status: "VALID" } }),
  ]);

  const catalogLabels = {
    validityMonths: tc("validityMonths"),
    passOfficialExam: tc("passOfficialExam"),
    completePrepProgram: tc("linkedCourse"),
    prerequisitePro: tc("prerequisitePro"),
    programInDevelopment: tc("programInDevelopment"),
  };

  const steps = [
    { icon: "menu_book", title: t("step1Title"), desc: t("step1Desc") },
    { icon: "quiz", title: t("step2Title"), desc: t("step2Desc") },
    { icon: "workspace_premium", title: t("step3Title"), desc: t("step3Desc") },
    { icon: "verified", title: t("step4Title"), desc: t("step4Desc") },
  ];

  const stats = [
    { value: String(levels.length), label: t("statCertifications"), icon: "military_tech" },
    { value: issuedCount > 0 ? `${issuedCount}+` : "—", label: t("statIssued"), icon: "verified" },
    { value: "100%", label: t("statVerifiable"), icon: "qr_code_scanner" },
    { value: "24–48", label: t("statValidity"), icon: "event_available" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[32rem] overflow-hidden bg-ink text-white lg:min-h-[36rem]">
        <Image
          src="/images/hero-bg-certification.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-ink/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(180,83,9,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.05),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white/80 backdrop-blur-sm">
              <MaterialIcon name="workspace_premium" size={16} />
              PROIMMO Academy
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">{t("heroSubtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90">
                <Link href="/certifications">
                  {t("ctaCertifications")}
                  <MaterialIcon name="arrow_forward" size={18} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/verify">{t("ctaVerify")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/register">{t("ctaRegister")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center lg:px-8">
              <MaterialIcon name={stat.icon} size={22} className="mx-auto text-accent" />
              <p className="mt-3 text-3xl font-semibold tabular-nums text-ink">{stat.value}</p>
              <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Program advantage */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {tnav("certifications")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-ink sm:text-4xl">{t("programTitle")}</h2>
            <p className="mt-4 text-lg text-ink-muted">{t("programSubtitle")}</p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {levels.map((level) => (
              <div
                key={level.id}
                className="rounded-2xl border border-border/70 bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-sm font-bold text-accent">
                  {String(level.rank).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-semibold text-ink">{levelName(level, locale)}</h3>
                <p className="mt-2 text-sm text-ink-muted">
                  {certifications.find((c) => c.levelId === level.id)
                    ? toCertificationCatalogRow(
                        certifications.find((c) => c.levelId === level.id)!,
                        locale,
                        catalogLabels
                      ).title
                    : locale === "fr"
                      ? "Programme à venir"
                      : "Program coming soon"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured certifications */}
      <section className="border-t border-border bg-bg py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-ink">{t("featuredTitle")}</h2>
              <p className="mt-2 max-w-2xl text-ink-muted">{t("featuredSubtitle")}</p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/certifications">
                {t("viewAllCertifications")}
                <MaterialIcon name="arrow_forward" size={18} />
              </Link>
            </Button>
          </div>

          {certifications.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {certifications.map((cert) => (
                <CertificationCard
                  key={cert.id}
                  certification={cert}
                  locale={locale}
                  viewLabel={tc("learnMore")}
                  levelLabel={tc("tableLevel")}
                />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-ink-muted">{tc("noCertifications")}</p>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-3xl font-semibold text-ink">{t("howItWorks")}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
                  <MaterialIcon name={step.icon} className="text-accent" size={24} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust CTA */}
      <section className="border-t border-border bg-ink py-20 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold">{t("trustTitle")}</h2>
              <p className="mt-4 text-lg text-white/75">{t("trustDesc")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90">
                <Link href="/certifications">{t("ctaCertifications")}</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/verify">{t("ctaVerify")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
