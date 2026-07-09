import { redirect } from "next/navigation";

export function adminRedirect(path: string, message: string, type: "success" | "error" = "success") {
  const params = new URLSearchParams({ toast: type, msg: message });
  redirect(`${path}?${params.toString()}`);
}
