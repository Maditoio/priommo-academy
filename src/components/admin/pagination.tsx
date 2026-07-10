"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/ui/material-icon";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  showingLabel: string;
  pageSizeLabel: string;
}

function PaginationInner({ page, pageSize, total, showingLabel, pageSizeLabel }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, v));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        {showingLabel.replace("{from}", String(from)).replace("{to}", String(to)).replace("{total}", String(total))}
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{pageSizeLabel}</span>
          <Select value={String(pageSize)} onValueChange={(v) => updateParams({ pageSize: v, page: "1" })}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
          >
            <MaterialIcon name="chevron_left" size={20} />
          </Button>
          <span className="min-w-[4rem] text-center text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            <MaterialIcon name="chevron_right" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={<div className="h-10" aria-hidden />}>
      <PaginationInner {...props} />
    </Suspense>
  );
}
