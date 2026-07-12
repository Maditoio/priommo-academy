import Image from "next/image";
import { MaterialIcon } from "@/components/ui/material-icon";
import { isDataAvatar } from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ src, name, size = 48, className }: UserAvatarProps) {
  const box = cn(
    "block shrink-0 overflow-hidden rounded-full bg-accent-soft",
    className
  );
  const style = { width: size, height: size, minWidth: size, minHeight: size };

  if (src) {
    if (isDataAvatar(src)) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className={cn(box, "object-cover")}
          style={style}
        />
      );
    }
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn(box, "object-cover")}
        style={style}
      />
    );
  }

  return (
    <div className={cn("flex items-center justify-center", box)} style={style}>
      <MaterialIcon name="person" className="text-accent" size={Math.round(size * 0.45)} />
    </div>
  );
}
