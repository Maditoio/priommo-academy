import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { processMockPayment } from "@/actions/enrollment";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ failed?: string }>;
}) {
  const { locale, id } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) redirect(`/${locale}/login`);

  const t = await getTranslations("payment");

  const payment = await db.payment.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!payment) notFound();

  const course =
    payment.relatedType === "course"
      ? await db.course.findUnique({ where: { id: payment.relatedId } })
      : null;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <MaterialIcon name="credit_card" className="mx-auto text-accent" size={40} />
          <CardTitle className="mt-4">{t("mockTitle")}</CardTitle>
          <CardDescription>{t("mockDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-3xl font-semibold text-ink">
              {formatPrice(payment.amount.toString(), payment.currency, locale)}
            </p>
            {course && (
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "fr" ? course.titleFr : course.titleEn}
              </p>
            )}
          </div>

          {sp.failed && (
            <p className="text-center text-sm text-destructive">{t("failed")}</p>
          )}

          <form
            action={async () => {
              "use server";
              await processMockPayment(id, true, locale);
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              {t("simulateSuccess")}
            </Button>
          </form>

          <form
            action={async () => {
              "use server";
              await processMockPayment(id, false, locale);
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              {t("simulateFailure")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
