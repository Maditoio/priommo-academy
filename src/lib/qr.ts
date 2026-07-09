import QRCode from "qrcode";

export async function generateCertificateQR(uniqueCode: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/fr/verify/${uniqueCode}`;
  return QRCode.toDataURL(verifyUrl, {
    width: 256,
    margin: 2,
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}

export function getVerifyUrl(uniqueCode: string, locale = "fr"): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/${locale}/verify/${uniqueCode}`;
}
