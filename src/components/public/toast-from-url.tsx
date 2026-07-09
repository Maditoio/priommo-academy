"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function ToastFromUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const toastType = searchParams.get("toast");
    const message = searchParams.get("msg");

    if (!toastType || !message) return;

    if (toastType === "success") toast.success(decodeURIComponent(message));
    else if (toastType === "error") toast.error(decodeURIComponent(message));

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    params.delete("msg");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
