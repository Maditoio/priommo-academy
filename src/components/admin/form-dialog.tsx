"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Centered modal for short admin forms — spec: ~480–560px, shadow-lg, rounded-2xl */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[min(90vh,40rem)] w-[calc(100%-2rem)] max-w-[32rem] flex-col gap-0 overflow-hidden border-0 p-0 shadow-lg",
          className
        )}
      >
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="text-xl font-semibold leading-snug text-ink">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-[0.8125rem] leading-relaxed text-ink-muted">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
