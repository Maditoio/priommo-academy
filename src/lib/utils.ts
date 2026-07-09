import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = "USD", locale = "fr") {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function localizedField<T extends Record<string, unknown>>(
  entity: T,
  field: string,
  locale: string
): string {
  const key = `${field}${locale === "fr" ? "Fr" : "En"}`;
  const value = entity[key];
  return typeof value === "string" ? value : "";
}
