import { Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/public/course-card";
import { Button } from "@/components/ui/button";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Award, BookOpen, GraduationCap } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("courses");
  const tcommon = await getTranslations("common");

  const featuredCourses = await db.course.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });

  const steps = [
    { icon: BookOpen, title: t("step1Title"), desc: t("step1Desc") },
    { icon: GraduationCap, title: t("step2Title"), desc: t("step2Desc") },
    { icon: Award, title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <>
      <section className="hero-gradient text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-gold-light">
              PROIMMO Academy
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-white/80">{t("heroSubtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="gold">
                <Link href="/courses">
                  {t("ctaCourses")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/certifications">{t("ctaCertifications")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            {t("featuredCourses")}
          </h2>
          {featuredCourses.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  enrollLabel={tc("enroll")}
                  levelLabel={tc("level")}
                  freeLabel={tcommon("free")}
                />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-ink-muted">{tc("noCourses")}</p>
          )}
        </div>
      </section>

      <section className="border-t border-navy/10 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy">
            {t("howItWorks")}
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-gold/30 bg-gold/5">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-navy">{step.title}</h3>
                  <p className="mt-2 text-ink-muted">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
