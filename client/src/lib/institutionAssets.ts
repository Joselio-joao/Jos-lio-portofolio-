export const SAYLOR_ACADEMY_LOGO = `${import.meta.env.BASE_URL}assets/saylor-academy.jpg`;

function normalized(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function institutionImage(title: string, currentImage?: string) {
  if (normalized(title).includes("saylor")) return SAYLOR_ACADEMY_LOGO;
  if (currentImage) return currentImage;
  return "/assets/ciq.jpg";
}
