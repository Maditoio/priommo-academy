import { requireOrgAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function OrgMembersPage({
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
        include: { members: true },
      },
    },
  });

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <h1 className="text-2xl font-bold">Team members</h1>
        <p className="mt-2 text-muted-foreground">Post-MVP scaffold</p>
        <ul className="mt-6 space-y-2">
          {user?.organization?.members.map((m) => (
            <li key={m.id} className="rounded border bg-white p-3 text-sm">
              {m.name} — {m.email} ({m.role})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
