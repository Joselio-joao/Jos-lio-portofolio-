import { describe, expect, it } from "vitest";
import { isValidOtp, normalizeOtp } from "./otp";

describe("OTP authentication", () => {
  it("keeps only six numeric digits", () => {
    expect(normalizeOtp(" 12a3 4567 ")).toBe("123456");
  });

  it("accepts only a complete six-digit code", () => {
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("12345a")).toBe(false);
  });
});
