import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "destructive" | "secondary" | "default";

const statusMap: Record<string, { variant: StatusVariant; label?: string }> = {
  VALID: { variant: "success" },
  PUBLISHED: { variant: "success" },
  PAID: { variant: "success" },
  COMPLETED: { variant: "success" },
  ACTIVE: { variant: "success" },
  PENDING: { variant: "warning" },
  DRAFT: { variant: "warning" },
  REVOKED: { variant: "destructive" },
  FAILED: { variant: "destructive" },
  EXPIRED: { variant: "destructive" },
  DROPPED: { variant: "secondary" },
  REFUNDED: { variant: "secondary" },
};

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusMap[status] ?? { variant: "secondary" as StatusVariant };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
