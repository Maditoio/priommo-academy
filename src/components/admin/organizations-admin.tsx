"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createOrganization } from "@/actions/enrollment";
import { FormDialog } from "@/components/admin/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";

interface OrganizationsAdminProps {
  locale: string;
  labels: {
    createOrganization: string;
    save: string;
    cancel: string;
    orgName: string;
    orgType: string;
    orgEmail: string;
    orgSeats: string;
    createOrganizationDesc: string;
  };
}

export function OrganizationsAdmin({ locale, labels }: OrganizationsAdminProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("modal") === "create";

  function closeDialog() {
    router.push(`/${locale}/admin/organizations`);
  }

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={labels.createOrganization}
      description={labels.createOrganizationDesc}
      className="sm:max-w-[32rem]"
    >
      <form action={createOrganization.bind(null, locale)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name">{labels.orgName}</Label>
          <Input id="org-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-type">{labels.orgType}</Label>
          <Input id="org-type" name="type" placeholder="agence, banque..." required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-email">{labels.orgEmail}</Label>
          <Input id="org-email" name="contactEmail" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="org-seats">{labels.orgSeats}</Label>
          <Input id="org-seats" name="seats" type="number" defaultValue={10} min={1} required />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={closeDialog}>
            {labels.cancel}
          </Button>
          <Button type="submit">
            <MaterialIcon name="save" size={18} />
            {labels.save}
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
