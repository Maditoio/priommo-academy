"use client";

import { useState } from "react";
import { revokeCertificateAction } from "@/actions/enrollment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RevokeCertificateButton({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!open) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
    );
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await revokeCertificateAction(id, reason);
        setOpen(false);
      }}
    >
      <div>
        <Label className="text-xs">Reason</Label>
        <Input value={reason} onChange={(e) => setReason(e.target.value)} required className="h-8" />
      </div>
      <Button type="submit" variant="destructive" size="sm">Confirm</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
    </form>
  );
}
