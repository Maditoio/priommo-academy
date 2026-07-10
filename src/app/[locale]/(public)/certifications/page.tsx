import { db } from "@/lib/db";
import { toCertificationCatalogRow } from "@/lib/certification-catalog";
import { CertificationLevelsTable } from "@/components/public/certification-levels-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";
import { Link } from "@/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function CertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("certifications");
  const tnav = await getTranslations("nav");

  const [certifications, issuedCount] = await Promise.all([
    db.certification.findMany({
      orderBy: { rank: "asc" },
      include: {
        level: true,
        course: {
          select: {
            slug: true,
            titleFr: true,
            titleEn: true,
            exams: { select: { passingScore: true, isPractice: true } },
          },
        },
      },
    }),
    db.certificateIssued.count({ where: { status: "VALID" } }),
  ]);

  const catalogLabels = {
    validityMonths: t("validityMonths"),
    passOfficialExam: t("passOfficialExam"),
    completePrepProgram: t("linkedCourse"),
    prerequisitePro: t("prerequisitePro"),
    programInDevelopment: t("programInDevelopment"),
  };

  const rows = certifications.map((cert) => toCertificationCatalogRow(cert, locale, catalogLabels));

  const prepOptions = [
    { icon: "laptop_mac", title: t("prepOnlineTitle"), desc: t("prepOnlineDesc") },
    { icon: "quiz", title: t("prepExamTitle"), desc: t("prepExamDesc") },
    { icon: "corporate_fare", title: t("prepOrgTitle"), desc: t("prepOrgDesc") },
  ];

  const resources = [
    { icon: "verified", title: t("resourceVerify"), desc: t("resourceVerifyDesc"), href: "/verify" },
    { icon: "dashboard", title: t("resourceDashboard"), desc: t("resourceDashboardDesc"), href: "/login" },
    { icon: "handshake", title: t("resourceContact"), desc: t("resourceContactDesc"), href: "/register" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-ink text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            PROIMMO Academy
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/75">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90">
              <Link href="/register">
                {tnav("register")}
                <MaterialIcon name="arrow_forward" size={18} />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/verify">{tnav("verify")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Advantage + stats */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-start">
            <div>
              <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{t("advantageTitle")}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-muted">{t("advantageDesc")}</p>
            </div>
            <div className="grid gap-4">
              {[
                { stat: "91%", label: t("statHire") },
                { stat: "85%", label: t("statTrust") },
                { stat: issuedCount > 0 ? `${issuedCount}+` : "—", label: t("statIssued") },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-surface px-5 py-4 shadow-sm">
                  <p className="text-3xl font-semibold text-accent">{item.stat}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certification levels table */}
      <section className="border-t border-border bg-bg py-16 lg:py-20" id="levels">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{t("levelsTitle")}</h2>
          <p className="mt-3 max-w-3xl text-ink-muted">{t("levelsDesc")}</p>

          <div className="mt-10">
            {rows.length > 0 ? (
              <CertificationLevelsTable
                rows={rows}
                labels={{
                  certification: t("tableCertification"),
                  level: t("tableLevel"),
                  description: t("tableDescription"),
                  requirements: t("tableRequirements"),
                  validity: t("tableValidity"),
                  learnMore: t("learnMore"),
                }}
              />
            ) : (
              <p className="py-12 text-center text-ink-muted">{t("noCertifications")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Preparation options */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-2xl font-semibold text-ink">{t("prepTitle")}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {prepOptions.map((option) => (
              <Card key={option.title} className="border-border/70 shadow-sm">
                <CardContent className="pt-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft">
                    <MaterialIcon name={option.icon} size={22} className="text-accent" />
                  </span>
                  <h3 className="mt-4 font-semibold text-ink">{option.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{option.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="border-t border-border bg-surface-hover/30 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-2xl font-semibold text-ink">{t("resourcesTitle")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {resources.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-2xl border border-border/70 bg-surface p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
              >
                <MaterialIcon name={resource.icon} size={24} className="text-accent" />
                <h3 className="mt-3 font-semibold text-ink group-hover:text-accent">{resource.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{resource.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
