import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
};

/** Google Material Symbols Outlined (loaded in root layout). */
export function MaterialIcon({ name, className, filled = false, size = 20 }: MaterialIconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center leading-none",
        className
      )}
      style={{
        fontSize: size,
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
