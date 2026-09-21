"use client";
import { BankCard } from "@/components/features/BankCard";
import { BalancePanel } from "@/components/features/BalancePanel";
import { ServiceTile } from "@/components/features/ServiceTile";
import { Skeleton } from "@/components/ui";
import { useAccounts, useCards } from "@/hooks/useBank";

export default function ServicesPage() {
  const cards = useCards();
  const accounts = useAccounts();
  const card = cards.data?.[0];
  const account = accounts.data?.find((a) => a.id === card?.accountId) ?? accounts.data?.[0];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Serviços</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-stretch">
        {cards.isPending ? <Skeleton className="aspect-[1.586/1] w-full max-w-md rounded-3xl" /> : card ? <BankCard card={card} /> : null}
        {accounts.isPending ? <Skeleton className="h-44 w-full rounded-3xl" /> : account ? <BalancePanel account={account} /> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <ServiceTile href="/services/payments" icon="receipt" label="Pagamento de serviços" />
        <ServiceTile href="/services/state" icon="state" label="Pagamentos ao Estado" />
        <ServiceTile href="/services/recharges" icon="phone" label="Carregamentos" />
        <ServiceTile href="/services/transfers" icon="swap" label="Transferências" />
      </div>
    </div>
  );
}
