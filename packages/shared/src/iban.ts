import { RX } from "./regex";

/** ISO 13616 mod-97 check, piecewise so it works without BigInt. */
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s/g, "").toUpperCase();
  if (!RX.iban.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const ch of rearranged) {
    const code = ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of code) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export const isBfaIban = (iban: string) => iban.slice(4, 8) === "0006";

export function formatIban(iban: string): string {
  return iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
}

export function maskIban(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  return clean.length < 8 ? "••••" : `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}
