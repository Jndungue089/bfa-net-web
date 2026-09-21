import { z } from "zod";

const DAY = 86_400_000;

/** Today's date (YYYY-MM-DD) in Luanda time (UTC+1, no DST). */
export function luandaToday(now: Date = new Date()): string {
  return new Date(now.getTime() + 3_600_000).toISOString().slice(0, 10);
}

export function shiftDays(isoDate: string, days: number): string {
  return new Date(new Date(`${isoDate}T00:00:00Z`).getTime() + days * DAY).toISOString().slice(0, 10);
}

export type PeriodPreset = "month" | "30d" | "90d";

export function presetRange(preset: PeriodPreset, now: Date = new Date()): { from: string; to: string } {
  const to = luandaToday(now);
  if (preset === "month") return { from: `${to.slice(0, 8)}01`, to };
  return { from: shiftDays(to, preset === "30d" ? -29 : -89), to };
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD.")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v; // rejects 2026-02-30 and 2026-13-01
  }, "Data inválida.");

/** Custom statement period: valid dates, from ≤ to, at most 366 days, not in the future. */
export const dateRangeSchema = z
  .object({ from: isoDate, to: isoDate })
  .superRefine((v, ctx) => {
    if (v.from > v.to) ctx.addIssue({ code: "custom", path: ["to"], message: "A data final deve ser posterior à inicial." });
    else if ((new Date(`${v.to}T00:00:00Z`).getTime() - new Date(`${v.from}T00:00:00Z`).getTime()) / DAY > 366)
      ctx.addIssue({ code: "custom", path: ["to"], message: "O período máximo é de 366 dias." });
    if (v.to > luandaToday()) ctx.addIssue({ code: "custom", path: ["to"], message: "A data não pode ser futura." });
  });
