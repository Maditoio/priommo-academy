"use client";

import Image from "next/image";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";

type ProfileFormProps = {
  locale: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
    imageUrl: string | null;
  };
  labels: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    imageHint: string;
    save: string;
    certificateNote: string;
  };
};

export function ProfileForm({ locale, user, labels }: ProfileFormProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-accent-soft shadow-sm">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={user.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <MaterialIcon name="person" className="text-accent" size={40} />
          )}
        </div>
        <h1 className="text-[1.875rem] font-semibold text-ink">{labels.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">{labels.subtitle}</p>
      </div>

      <form
        action={async (fd) => updateProfile(fd, locale)}
        className="space-y-5 rounded-2xl bg-surface p-6 shadow-md"
      >
        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
          <p className="text-xs text-ink-muted">{labels.certificateNote}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" value={user.email} disabled className="bg-bg opacity-70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">{labels.imageUrl}</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://..."
            defaultValue={user.imageUrl ?? ""}
          />
          <p className="text-xs text-ink-muted">{labels.imageHint}</p>
        </div>

        <Button type="submit" className="w-full">
          <MaterialIcon name="save" size={18} />
          {labels.save}
        </Button>
      </form>
    </div>
  );
}
