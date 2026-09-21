import { cleanText, normalizeIban, normalizePhone } from "./sanitize";
import { isValidIban } from "./iban";
import { RX } from "./regex";

/**
 * Payment QR payloads (semicolon-separated key=value, versioned):
 *   BFAPAY:v1;iban=AO06…;amount=1500.00;name=Loja Central;ref=FT-2026-19
 *   BFAKWIK:v1;key=923456789;amount=1500.00;name=Maria
 * QR content is attacker-controlled (anyone can print a QR), so parsing is strict and whitelisted and
 * the UI must treat `name` as an unverified label — the server-resolved holder is what to trust.
 */
export type QrPayload =
  | { kind: "pay"; iban: string; amount?: number; name?: string; ref?: string }
  | { kind: "kwik"; key: string; amount?: number; name?: string };

export type QrResult = { ok: true; payload: QrPayload } | { ok: false; reason: string };

const MAX_LENGTH = 300;
const REF = /^[A-Za-z0-9\-_/.]{1,30}$/;
const AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;
const KEYS = { pay: ["iban", "amount", "name", "ref"], kwik: ["key", "amount", "name"] } as const;
const bad = (reason: string): QrResult => ({ ok: false, reason });

export function parseQr(raw: string): QrResult {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_LENGTH) return bad("Código QR inválido.");
  const [head, ...parts] = raw.trim().split(";");
  const kind = head === "BFAPAY:v1" ? "pay" : head === "BFAKWIK:v1" ? "kwik" : null;
  if (!kind) return bad("Este QR não é um código de pagamento BFA.");

  const fields = new Map<string, string>();
  for (const part of parts) {
    if (!part) continue;
    const i = part.indexOf("=");
    const k = i > 0 ? part.slice(0, i) : "";
    if (!(KEYS[kind] as readonly string[]).includes(k)) return bad("Código QR inválido.");
    if (fields.has(k)) return bad("Código QR inválido.");
    fields.set(k, part.slice(i + 1));
  }

  let amount: number | undefined;
  const rawAmount = fields.get("amount");
  if (rawAmount !== undefined) {
    if (!AMOUNT.test(rawAmount) || Number(rawAmount) <= 0) return bad("Montante do QR inválido.");
    amount = Number(rawAmount);
  }
  const nameRaw = fields.get("name");
  const name = nameRaw === undefined ? undefined : cleanText(nameRaw);
  if (name !== undefined && (name.length === 0 || name.length > 60 || !RX.description.test(name))) return bad("Nome do QR inválido.");

  if (kind === "pay") {
    const iban = normalizeIban(fields.get("iban") ?? "");
    if (!isValidIban(iban)) return bad("IBAN do QR inválido.");
    const ref = fields.get("ref");
    if (ref !== undefined && !REF.test(ref)) return bad("Referência do QR inválida.");
    return { ok: true, payload: { kind, iban, amount, name, ref } };
  }

  const key = normalizePhone(fields.get("key") ?? "");
  if (!RX.phone.test(key)) return bad("Chave KWiK do QR inválida.");
  return { ok: true, payload: { kind, key, amount, name } };
}

export const buildPayQr = (p: { iban: string; amount?: number; name?: string; ref?: string }) =>
  ["BFAPAY:v1", `iban=${p.iban}`, p.amount ? `amount=${p.amount.toFixed(2)}` : "", p.name ? `name=${p.name}` : "", p.ref ? `ref=${p.ref}` : ""].filter(Boolean).join(";");

export const buildKwikQr = (p: { key: string; amount?: number; name?: string }) =>
  ["BFAKWIK:v1", `key=${p.key}`, p.amount ? `amount=${p.amount.toFixed(2)}` : "", p.name ? `name=${p.name}` : ""].filter(Boolean).join(";");
