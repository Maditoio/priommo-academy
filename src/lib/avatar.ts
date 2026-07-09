const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function processAvatarUpload(
  file: File | null
): Promise<string | null | undefined> {
  if (!file || file.size === 0) return undefined;

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

export function isDataAvatar(src: string) {
  return src.startsWith("data:");
}
