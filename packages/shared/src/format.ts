// Deterministic formatting (no Intl dependency): identical on Hermes, JSC and V8.
const NBSP = " ";
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const SYMBOL: Record<string, string> = { AOA: "Kz", USD: "USD", EUR: "EUR" };

export function formatMoney(amount: number, currency: string = "AOA", opts: { sign?: boolean } = {}): string {
  const abs = Math.abs(amount);
  const [int = "0", dec = "00"] = abs.toFixed(2).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = amount < 0 ? "-" : opts.sign && amount > 0 ? "+" : "";
  return `${sign}${grouped},${dec}${NBSP}${SYMBOL[currency] ?? currency}`;
}

export const formatKz = (amount: number) => formatMoney(amount, "AOA");

export function formatRate(n: number): string {
  return n.toFixed(3).replace(".", ",");
}

/** Angola is UTC+1 all year (no DST). */
function luanda(iso: string): Date {
  return new Date(new Date(iso).getTime() + 3_600_000);
}

const p2 = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string): string {
  const d = luanda(iso);
  return `${p2(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = luanda(iso);
  return `${formatDate(iso)}, ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
}

/** "2026-09" → "Set". */
export function monthShort(yearMonth: string): string {
  const m = Number(yearMonth.slice(5, 7));
  return MONTHS[m - 1] ?? yearMonth;
}

export function formatPhone(national: string): string {
  return national.replace(/^(\d{3})(\d{3})(\d{3})$/, "+244 $1 $2 $3");
}

/**
 * Parses "1500", "1500,5", "1 500,50" (spaces are grouping) into a number; NaN when malformed.
 * Dots/commas are only accepted as the decimal separator (1–2 digits) so "1.500" is rejected rather than guessed.
 */
export function parseMoneyInput(raw: string): number {
  const s = raw.replace(/[\s\u00A0]/g, "");
  if (!/^\d{1,12}([.,]\d{1,2})?$/.test(s)) return NaN;
  return Number(s.replace(",", "."));
}

export function greeting(now = new Date()): string {
  const h = new Date(now.getTime() + 3_600_000).getUTCHours();
  return h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
}
