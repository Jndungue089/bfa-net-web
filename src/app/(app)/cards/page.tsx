"use client";
import { useState } from "react";
import type { Card } from "@bfa/shared";
import { BankCard } from "@/components/features/BankCard";
import { CardSettingsSheet } from "@/components/features/CardSettingsSheet";
import { Alert, Button, Icon, Skeleton } from "@/components/ui";
import { useCards } from "@/hooks/useBank";

function CardBlock({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  const blocked = card.status === "Blocked";
  return (
    <div className="space-y-4">
      <BankCard card={card} />
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon name={blocked ? "lock" : "shield"} className={blocked ? "size-4.5 text-red-600" : "size-4.5 text-emerald-600"} />
        {blocked ? "Cartão bloqueado" : "Cartão activo"} · {card.productName}
      </div>
      <Button variant="secondary" full className="max-w-md" onClick={() => setOpen(true)}><Icon name="settings" className="size-4" />Definições do cartão</Button>
      <CardSettingsSheet card={card} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export default function CardsPage() {
  const cards = useCards();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">Cartões</h1>
      {cards.isError && <Alert kind="error">Não foi possível carregar os cartões.</Alert>}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {cards.isPending ? <Skeleton className="aspect-[1.586/1] w-full max-w-md rounded-3xl" /> : cards.data?.map((c) => <CardBlock key={c.id} card={c} />)}
      </div>
      {cards.data?.length === 0 && <p className="text-sm text-slate-500">Não tem cartões associados.</p>}
    </div>
  );
}
