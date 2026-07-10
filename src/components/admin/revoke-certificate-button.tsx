"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revokeCertificateAction } from "@/actions/enrollment";
import { FormDialog } from "@/components/admin/form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
import { toast } from "sonner";

export function RevokeCertificateButton({
  id,
  label,
  locale,
  reasonLabel,
  confirmLabel,
  cancelLabel,
}: {
  id: string;
  label: string;
  locale: string;
  reasonLabel: string;
  confirmLabel: string;
  cancelLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await revokeCertificateAction(id, reason, locale);
      toast.success("Certificate revoked");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to revoke certificate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-danger hover:text-danger"
        onClick={() => setOpen(true)}
        title={label}
        aria-label={label}
      >
        <MaterialIcon name="block" size={18} />
      </Button>
      <FormDialog open={open} onOpenChange={setOpen} title={label}>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="reason">{reasonLabel}</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 border-t border-border/60 bg-surface px-6 py-4">
            <Button type="submit" variant="destructive" disabled={loading}>
              <MaterialIcon name="block" size={18} />
              {confirmLabel}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              {cancelLabel}
            </Button>
          </div>
        </form>
      </FormDialog>
    </>
  );
}
