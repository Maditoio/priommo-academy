import { cn } from "@/lib/utils";

const dotColor: Record<string, string> = {
  VALID: "bg-emerald",
  PUBLISHED: "bg-emerald",
  PAID: "bg-emerald",
  COMPLETED: "bg-emerald",
  ACTIVE: "bg-emerald",
  PENDING: "bg-gold",
  DRAFT: "bg-gold",
  REVOKED: "bg-clay",
  FAILED: "bg-clay",
  EXPIRED: "bg-ink-muted",
  DROPPED: "bg-ink-muted",
  REFUNDED: "bg-ink-muted",
};

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const dot = dotColor[status] ?? "bg-ink-muted";
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-ink", className)}>
      <span className={cn("h-2 w-2 shrink-0 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}
