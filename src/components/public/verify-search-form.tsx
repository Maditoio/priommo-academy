"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MaterialIcon } from "@/components/ui/material-icon";

export function VerifySearchForm({
  labels,
}: {
  labels: { title: string; subtitle: string; placeholder: string; submit: string };
}) {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/verify/${trimmed}`);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-lg p-8 shadow-md">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
            <MaterialIcon name="search" className="text-accent" size={24} />
          </div>
          <h1 className="mt-6 text-[1.875rem] font-semibold text-ink">{labels.title}</h1>
          <p className="mt-2 text-sm text-ink-muted">{labels.subtitle}</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">{labels.placeholder}</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC123XYZ"
              className="font-mono-code"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <MaterialIcon name="verified" size={18} />
            {labels.submit}
          </Button>
        </form>
      </Card>
    </div>
  );
}
