/** NFC-normalise, drop control / format / private-use chars (zero-width, bidi overrides), collapse whitespace, trim. */
export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .normalize("NFC")
    .replace(/[\t\n\r]+/g, " ")
    .replace(/[\p{Cc}\p{Cf}\p{Co}\p{Cs}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("244") && digits.length === 12 ? digits.slice(3) : digits;
}

export const normalizeEmail = (s: string) => cleanText(s).toLowerCase();
export const normalizeNationalId = (s: string) => cleanText(s).replace(/\s/g, "").toUpperCase();
export const normalizeIban = (s: string) => cleanText(s).replace(/\s/g, "").toUpperCase();
export const digitsOnly = (s: string) => s.replace(/\D/g, "");
