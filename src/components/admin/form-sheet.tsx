"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/** Right slide-over for longer admin forms — spec: ~480–640px, scrollable */
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: FormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "flex w-full max-w-[36rem] flex-col gap-0 overflow-hidden border-0 p-0 shadow-lg sm:max-w-[36rem]",
          className
        )}
      >
        <div className="shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
          <SheetHeader className="space-y-1.5 text-left">
            <SheetTitle className="text-xl font-semibold leading-snug text-ink">{title}</SheetTitle>
            {description && (
              <SheetDescription className="text-[0.8125rem] leading-relaxed text-ink-muted">
                {description}
              </SheetDescription>
            )}
          </SheetHeader>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
