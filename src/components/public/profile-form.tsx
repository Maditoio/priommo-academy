"use client";

import { useRef, useState } from "react";
import { updateProfile } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaterialIcon } from "@/components/ui/material-icon";
import { UserAvatar } from "@/components/ui/user-avatar";

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
    photo: string;
    uploadPhoto: string;
    changePhoto: string;
    removePhoto: string;
    photoHint: string;
    save: string;
    certificateNote: string;
    accountSection: string;
  };
};

export function ProfileForm({ locale, user, labels }: ProfileFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(user.imageUrl);
  const [removePhoto, setRemovePhoto] = useState(false);

  function onFileChange(file: File | undefined) {
    if (!file) return;
    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-[1.875rem] font-semibold text-ink sm:text-3xl">{labels.title}</h1>
        <p className="mt-2 text-ink-muted">{labels.subtitle}</p>
      </div>

      <form
        action={async (fd) => {
          if (removePhoto) fd.set("removePhoto", "true");
          await updateProfile(fd, locale);
        }}
        className="grid gap-6 lg:grid-cols-[220px_1fr]"
      >
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-ink">{labels.photo}</p>
          <div className="mt-4 flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative inline-flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <UserAvatar src={removePhoto ? null : preview} name={user.name} size={120} />
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                <MaterialIcon name="photo_camera" className="text-white" size={28} />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <div className="mt-4 flex flex-col gap-2 w-full">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => fileRef.current?.click()}
              >
                <MaterialIcon name="upload" size={18} />
                {preview && !removePhoto ? labels.changePhoto : labels.uploadPhoto}
              </Button>
              {preview && !removePhoto && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-ink-muted"
                  onClick={() => {
                    setRemovePhoto(true);
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <MaterialIcon name="delete" size={18} />
                  {labels.removePhoto}
                </Button>
              )}
            </div>
            <p className="mt-3 text-center text-xs text-ink-muted">{labels.photoHint}</p>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-medium text-ink">{labels.accountSection}</p>

          <div className="space-y-2">
            <Label htmlFor="name">{labels.name}</Label>
            <Input id="name" name="name" defaultValue={user.name} required minLength={2} />
            <p className="text-xs text-ink-muted">{labels.certificateNote}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{labels.email}</Label>
            <Input id="email" value={user.email} disabled className="bg-bg text-ink-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{labels.phone}</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} />
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            <MaterialIcon name="save" size={18} />
            {labels.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
