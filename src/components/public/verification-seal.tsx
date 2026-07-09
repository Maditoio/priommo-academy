import { cn } from "@/lib/utils";

export type SealStatus = "valid" | "revoked" | "expired";

interface VerificationSealProps {
  status: SealStatus;
  code: string;
  level?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { outer: "h-16 w-16", inner: "h-[3.25rem] w-[3.25rem]", text: "text-[0.5rem]", level: "text-[0.55rem]" },
  md: { outer: "h-28 w-28", inner: "h-[6.25rem] w-[6.25rem]", text: "text-[0.65rem]", level: "text-xs" },
  lg: { outer: "h-40 w-40", inner: "h-[9rem] w-[9rem]", text: "text-xs", level: "text-sm" },
};

const ringClass: Record<SealStatus, string> = {
  valid: "accent-gradient",
  expired: "bg-ink-muted/30",
  revoked: "bg-danger/80",
};

export function VerificationSeal({
  status,
  code,
  level,
  size = "md",
  className,
}: VerificationSealProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full p-[3px]",
          s.outer,
          ringClass[status]
        )}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-full bg-surface text-center shadow-sm",
            s.inner
          )}
        >
          <span className="text-sm font-semibold text-accent" aria-hidden>
            PA
          </span>
          {level && (
            <span className={cn("mt-0.5 font-medium uppercase tracking-wide text-ink-muted", s.level)}>
              {level}
            </span>
          )}
        </div>
      </div>
      <p className={cn("font-mono-code font-medium uppercase text-ink-muted", s.text)}>
        {code.toUpperCase()}
      </p>
    </div>
  );
}

export function sealStatusFromCertificate(status: string, isExpired?: boolean): SealStatus {
  if (status === "REVOKED") return "revoked";
  if (status === "EXPIRED" || isExpired) return "expired";
  return "valid";
}
