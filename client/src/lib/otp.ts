export const OTP_LENGTH = 6;

export function normalizeOtp(value: string): string {
  return value.replace(/\D/g, "").slice(0, OTP_LENGTH);
}

export function isValidOtp(value: string): boolean {
  return /^\d{6}$/.test(normalizeOtp(value));
}
