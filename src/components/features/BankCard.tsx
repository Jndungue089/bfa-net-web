import Image from "next/image";
import type { Card } from "@bfa/shared";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

const GRADIENT: Record<Card["product"], string> = {
  // BFA's physical debit cards are the primary brand colour (orange); the secondary navy is used for prepaid.
  Debito: "from-brand-400 via-brand-500 to-brand-700",
  PrePago: "from-[#1b2c85] via-navy-800 to-navy-950",
  Credito: "from-neutral-700 via-neutral-900 to-black",
};
const LABEL: Record<Card["product"], string> = { Debito: "DÉBITO", PrePago: "PRÉ-PAGO", Credito: "CRÉDITO" };

/** ID-1 proportions (85.6 × 54 mm). Only the last 4 digits ever leave the server. */
export function BankCard({ card, className }: { card: Card; className?: string }) {
  const blocked = card.status === "Blocked";
  const expiry = `${String(card.expiryMonth).padStart(2, "0")}/${String(card.expiryYear).slice(-2)}`;
  return (
    <div
      role="img" aria-label={`Cartão ${LABEL[card.product].toLowerCase()} terminado em ${card.last4}${blocked ? ", bloqueado" : ""}`}
      className={cn("relative aspect-[1.586/1] w-full max-w-md overflow-hidden rounded-3xl p-5 text-white shadow-xl shadow-navy-950/30 sm:p-6",
        "bg-gradient-to-br", blocked ? "from-slate-400 via-slate-500 to-slate-700" : GRADIENT[card.product], className)}
    >
      <span aria-hidden className="absolute -right-14 -top-20 size-56 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -bottom-24 -left-16 size-60 rounded-full bg-white/5" />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="rounded-lg bg-white px-2 py-1"><Image src="/logo-mark.png" alt="" width={62} height={24} style={{ height: 24, width: "auto" }} /></span>
          <span className="text-[0.8rem] font-bold tracking-[0.18em] text-white/90">{LABEL[card.product]}</span>
        </div>

        <div className="flex items-center justify-between">
          <span aria-hidden className="relative h-9 w-12 overflow-hidden rounded-md bg-gradient-to-br from-[#f5d77a] to-[#c9a24b]">
            <span className="absolute inset-x-0 top-[11px] h-px bg-black/25" /><span className="absolute inset-x-0 top-[22px] h-px bg-black/25" /><span className="absolute inset-y-0 left-[22px] w-px bg-black/25" />
          </span>
          <Icon name="wifi" className="size-7 rotate-90 text-white/85" />
        </div>

        <p className="tabular text-[clamp(1.05rem,4.6vw,1.4rem)] font-semibold tracking-[0.18em]">•••• •••• •••• {card.last4}</p>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0"><p className="text-[0.6rem] tracking-[0.15em] text-white/60">TITULAR</p><p className="truncate text-sm font-semibold uppercase tracking-wide">{card.holderName}</p></div>
          <div><p className="text-[0.6rem] tracking-[0.15em] text-white/60">VALIDADE</p><p className="text-sm font-semibold">{expiry}</p></div>
        </div>
      </div>

      {blocked && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35"><Icon name="lock" className="size-10" /></div>}
    </div>
  );
}
