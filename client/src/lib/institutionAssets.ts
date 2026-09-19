export const SAYLOR_ACADEMY_LOGO = `${import.meta.env.BASE_URL}assets/saylor-academy.jpg`;
const PUBLIC_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function resolvePublicAsset(value: string): string {
  if (/^(https?:\/\/|data:|blob:)/i.test(value)) return value;
  if (value.startsWith(`${PUBLIC_BASE}/`)) return value;
  if (value.startsWith("/")) return `${PUBLIC_BASE}${value}`;
  return `${PUBLIC_BASE}/${value}`;
}

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function institutionImage(title: string, currentImage?: string) {
  if (normalized(title).includes("saylor") && (!currentImage || /manus-storage|saylor-academy-logo/i.test(currentImage))) return SAYLOR_ACADEMY_LOGO;
  if (currentImage) return resolvePublicAsset(currentImage);
  return `${PUBLIC_BASE}/assets/ciq.jpg`;
}
