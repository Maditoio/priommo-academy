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
  sm: {
    wrap: "w-[4.5rem]",
    badge: "h-[3.75rem]",
    monogram: "text-xs",
    level: "text-[0.5rem]",
    code: "text-[0.5rem]",
    ribbon: "h-2.5",
  },
  md: {
    wrap: "w-[7.5rem]",
    badge: "h-[6.25rem]",
    monogram: "text-lg",
    level: "text-[0.6rem]",
    code: "text-[0.65rem]",
    ribbon: "h-3.5",
  },
  lg: {
    wrap: "w-[10.5rem]",
    badge: "h-[8.75rem]",
    monogram: "text-2xl",
    level: "text-xs",
    code: "text-xs",
    ribbon: "h-4",
  },
};

const statusStyles: Record<SealStatus, { frame: string; ribbon: string; text: string }> = {
  valid: {
    frame: "accent-gradient shadow-md",
    ribbon: "bg-accent/90",
    text: "text-accent",
  },
  expired: {
    frame: "bg-ink-muted/25 shadow-sm",
    ribbon: "bg-ink-muted/50",
    text: "text-ink-muted",
  },
  revoked: {
    frame: "bg-danger/80 shadow-sm",
    ribbon: "bg-danger",
    text: "text-danger",
  },
};

export function VerificationSeal({
  status,
  code,
  level,
  size = "md",
  className,
}: VerificationSealProps) {
  const s = sizeMap[size];
  const palette = statusStyles[status];

  return (
    <div className={cn("flex flex-col items-center gap-2", s.wrap, className)}>
      <div className="relative w-full">
        <div
          className={cn("absolute inset-x-3 top-0 rounded-t-sm", s.ribbon, palette.ribbon)}
          aria-hidden
        />
        <div
          className={cn(
            "relative mx-auto mt-1 flex w-[88%] flex-col items-center justify-center rounded-lg p-[3px]",
            s.badge,
            palette.frame
          )}
        >
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-[0.4rem] bg-surface text-center shadow-inner"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)",
            }}
          >
            <span className={cn("font-bold leading-none", palette.text, s.monogram)} aria-hidden>
              PA
            </span>
            {level && (
              <span
                className={cn(
                  "mt-1 max-w-[90%] truncate font-semibold uppercase tracking-wider text-ink-muted",
                  s.level
                )}
              >
                {level}
              </span>
            )}
          </div>
        </div>
      </div>
      <p className={cn("w-full truncate text-center font-mono-code font-medium uppercase text-ink-muted", s.code)}>
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
