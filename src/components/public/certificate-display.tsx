"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { VerificationSeal, sealStatusFromCertificate } from "@/components/public/verification-seal";
import { StatusBadge } from "@/components/public/status-badge";
import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";
import { getVerifyUrl } from "@/lib/qr";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { toast } from "sonner";

interface CertificateDisplayProps {
  uniqueCode: string;
  status: string;
  level: string;
  title: string;
  holderName?: string;
  holderImageUrl?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  qrDataUrl: string;
  locale: string;
  statusLabel: string;
  labels: {
    verify: string;
    issuedAt: string;
    expiresAt: string;
    copyLink: string;
    holder?: string;
    copied?: string;
  };
  compact?: boolean;
}

export function CertificateDisplay({
  uniqueCode,
  status,
  level,
  title,
  holderName,
  holderImageUrl,
  issuedAt,
  expiresAt,
  qrDataUrl,
  locale,
  statusLabel,
  labels,
  compact = false,
}: CertificateDisplayProps) {
  const dateLocale = locale === "fr" ? fr : enUS;
  const issued = new Date(issuedAt);
  const expires = expiresAt ? new Date(expiresAt) : null;
  const isExpired = !!(expires && expires < new Date());
  const effectiveStatus = isExpired && status === "VALID" ? "EXPIRED" : status;
  const verifyUrl = getVerifyUrl(uniqueCode, locale);

  function copyLink() {
    navigator.clipboard.writeText(verifyUrl);
    toast.success(labels.copied ?? "Link copied");
  }

  return (
    <div className={`rounded-2xl bg-surface p-6 shadow-md ${compact ? "" : "w-full max-w-md"}`}>
      <div className="flex flex-col items-center text-center">
        <VerificationSeal
          status={sealStatusFromCertificate(effectiveStatus, isExpired)}
          code={uniqueCode}
          level={level}
          size={compact ? "sm" : "md"}
        />
        <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
        <StatusBadge status={effectiveStatus} label={statusLabel} className="mt-2" />
      </div>

      {holderName && (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-6">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent-soft">
            {holderImageUrl ? (
              <Image
                src={holderImageUrl}
                alt={holderName}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              <MaterialIcon name="person" className="text-accent" size={28} />
            )}
          </div>
          <div className="text-center">
            {labels.holder && <p className="text-xs text-ink-muted">{labels.holder}</p>}
            <p className="text-base font-semibold text-ink">{holderName}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <Image
          src={qrDataUrl}
          alt="QR verification code"
          width={compact ? 140 : 180}
          height={compact ? 140 : 180}
          className="rounded-xl border border-border bg-white p-2"
        />
      </div>

      <p className="mt-3 text-center font-mono-code text-xs text-ink-muted">
        {uniqueCode.toUpperCase()}
      </p>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{labels.issuedAt}</dt>
          <dd className="font-medium text-ink">{format(issued, "PPP", { locale: dateLocale })}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{labels.expiresAt}</dt>
          <dd className="font-medium text-ink">
            {expires ? format(expires, "PPP", { locale: dateLocale }) : "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="default" className="flex-1">
          <Link href={`/verify/${uniqueCode}`}>
            <MaterialIcon name="open_in_new" size={18} />
            {labels.verify}
          </Link>
        </Button>
        <Button type="button" variant="secondary" className="flex-1" onClick={copyLink}>
          <MaterialIcon name="content_copy" size={18} />
          {labels.copyLink}
        </Button>
      </div>
    </div>
  );
}
