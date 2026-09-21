"use client";
import { formatIban, type Account } from "@bfa/shared";
import { Icon } from "@/components/ui";
import { usePrivacyStore } from "@/stores/privacy";
import { Money } from "./Money";
import { accountTypeLabel } from "./labels";

/** Balance as a hero panel: big figure, account chip, and the hide-balances switch right where the number is. */
export function BalancePanel({ account }: { account: Account }) {
  const { hideBalances, toggle } = usePrivacyStore();
  return (
    <section aria-label="Saldo disponível" className="relative isolate w-full overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 p-6 text-white shadow-xl shadow-navy-950/25 sm:p-7">
      <span aria-hidden className="absolute -right-10 -top-16 -z-10 size-52 rounded-full bg-brand-500/25 blur-2xl" />
      <span aria-hidden className="absolute -bottom-20 left-10 -z-10 size-56 rounded-full bg-white/5" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/70">Saldo disponível</p>
          <p className="mt-2 text-[clamp(1.9rem,8vw,2.6rem)] font-bold leading-none tracking-tight"><Money value={account.balance} currency={account.currency} /></p>
        </div>
        <button type="button" onClick={toggle} aria-pressed={hideBalances} aria-label={hideBalances ? "Mostrar saldos" : "Ocultar saldos"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/12 hover:bg-white/20"><Icon name={hideBalances ? "eyeOff" : "eye"} /></button>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 font-semibold"><Icon name="card" className="size-4" />{account.nickname ?? accountTypeLabel[account.type]}</span>
        <span className="tabular text-white/70">{formatIban(account.iban)}</span>
      </div>
    </section>
  );
}
