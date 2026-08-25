export const SAYLOR_ACADEMY_LOGO = "/manus-storage/saylor-academy-logo_e36f4bf9.jpg";

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function institutionImage(title: string, currentImage?: string) {
  if (currentImage) return currentImage;
  if (normalized(title).includes("saylor")) return SAYLOR_ACADEMY_LOGO;
  return "/assets/ciq.jpg";
}
