import { Link } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/public/course-card";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

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
  const tc = await getTranslations("courses");
  const tcommon = await getTranslations("common");

  const featuredCourses = await db.course.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { level: true, _count: { select: { modules: true } } },
  });

  const steps = [
    { icon: "menu_book", title: t("step1Title"), desc: t("step1Desc") },
    { icon: "school", title: t("step2Title"), desc: t("step2Desc") },
    { icon: "workspace_premium", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <>
      <section className="hero-band">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-widest text-white/70">
              PROIMMO Academy
            </p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-white/80">{t("heroSubtitle")}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-accent hover:bg-white/90">
                <Link href="/courses">
                  {t("ctaCourses")}
                  <MaterialIcon name="arrow_forward" size={18} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/certifications">{t("ctaCertifications")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-3xl font-semibold text-ink sm:text-4xl">{t("featuredCourses")}</h2>
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

      <section className="border-t border-border py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <h2 className="text-3xl font-semibold text-ink">{t("howItWorks")}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
                  <MaterialIcon name={step.icon} className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
