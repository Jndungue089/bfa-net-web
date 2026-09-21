"use client";
import Link from "next/link";
import { greeting } from "@bfa/shared";
import { AccountCard } from "@/components/features/AccountCard";
import { FxWidget } from "@/components/features/FxWidget";
import { Money } from "@/components/features/Money";
import { StatementList } from "@/components/features/StatementList";
import { Alert, Card, CardTitle, Icon, Skeleton, type IconName } from "@/components/ui";
import { useAccounts, useStatement } from "@/hooks/useBank";
import { useSessionStore } from "@/stores/session";

function QuickAction({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 rounded-2xl py-1 text-center text-sm font-semibold text-white transition hover:opacity-80 active:scale-95">
      <span className="flex size-14 items-center justify-center rounded-full bg-white/15"><Icon name={icon} className="size-6" /></span>{label}
    </Link>
  );
}

export default function DashboardPage() {
  const profile = useSessionStore((s) => s.profile);
  const accounts = useAccounts();
  const main = accounts.data?.find((a) => a.type === "Ordem") ?? accounts.data?.[0];
  const recent = useStatement(main?.id ?? "", {}, 5);
  const total = accounts.data?.filter((a) => a.currency === "AOA").reduce((s, a) => s + a.balance, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">{greeting()},</p>
        <h1 className="text-2xl font-bold text-navy-900">{profile?.fullName.split(" ")[0] ?? "…"}</h1>
      </div>

      <Card className="bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-0">
        <p className="text-sm text-white/70">Saldo total (Kz)</p>
        <div className="mt-1 text-4xl font-bold">{accounts.isPending ? <Skeleton className="h-10 w-64 bg-white/20" /> : <Money value={total} />}</div>
        <div className="mt-6 grid grid-cols-4 gap-2 sm:max-w-md">
          <QuickAction href="/services/transfers" icon="swap" label="Transferir" />
          <QuickAction href="/services" icon="receipt" label="Pagar" />
          <QuickAction href="/services/recharges" icon="phone" label="Carregar" />
          <QuickAction href="/statement" icon="file" label="Extracto" />
        </div>
      </Card>

      {accounts.isError && <Alert kind="error">Não foi possível carregar as suas contas.</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {accounts.isPending ? [0, 1].map((i) => <Skeleton key={i} className="h-36" />) : accounts.data?.map((a) => <AccountCard key={a.id} account={a} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardTitle action={main && <Link href="/statement" aria-label="Ver extracto" className="flex size-10 items-center justify-center rounded-full text-brand-600 hover:bg-brand-50"><Icon name="chevron" /></Link>}>Últimos movimentos</CardTitle>
          {recent.isPending && main ? <Skeleton className="h-40" /> : <StatementList items={recent.data?.pages[0]?.items ?? []} />}
        </Card>
        <FxWidget />
      </div>
    </div>
  );
}
