import { requireOrgAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireOrgAdmin();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      organization: {
        include: { _count: { select: { members: true } } },
      },
    },
  });

  const t = await getTranslations("admin");

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h1 className="text-2xl font-bold">B2B — {user?.organization?.name ?? "Organization"}</h1>
        <p className="mt-2 text-muted-foreground">Post-MVP scaffold</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader><CardTitle className="text-sm">Seats</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {user?.organization?._count.members ?? 0} / {user?.organization?.seats ?? 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
