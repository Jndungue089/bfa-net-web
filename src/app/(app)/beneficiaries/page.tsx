"use client";
import { useState } from "react";
import Link from "next/link";
import { formatIban, isBfaIban, type Beneficiary } from "@bfa/shared";
import { BeneficiaryForm } from "@/components/features/forms/BeneficiaryForm";
import { PageHeader } from "@/components/features/PageHeader";
import { errorMessage } from "@/components/features/errors";
import { Alert, Badge, Button, Card, Icon, Modal, Sheet, Skeleton } from "@/components/ui";
import { useBeneficiaries, useRemoveBeneficiary } from "@/hooks/useBank";

export default function BeneficiariesPage() {
  const list = useBeneficiaries();
  const remove = useRemoveBeneficiary();
  const [target, setTarget] = useState<Beneficiary | null>(null);
  const [adding, setAdding] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Beneficiários" back="/profile" action={<Button onClick={() => setAdding(true)}><Icon name="userPlus" className="size-4" /><span className="hidden sm:inline">Novo</span><span className="sm:hidden sr-only">Novo beneficiário</span></Button>} />
      <Card className="!p-3">
        {list.isPending ? <Skeleton className="h-32" /> : list.isError ? <Alert kind="error">Não foi possível carregar os beneficiários.</Alert> : !list.data.length ? (
          <div className="flex flex-col items-center gap-2 py-10 text-slate-500"><Icon name="users" className="size-9" /><p className="text-sm">Ainda não guardou nenhum beneficiário.</p></div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.data.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-50 font-bold text-navy-800" aria-hidden>{b.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{b.name}</p>
                  <p className="truncate text-xs text-slate-500 tabular">{isBfaIban(b.iban) && <Badge tone="brand">BFA</Badge>} {formatIban(b.iban)}</p>
                </div>
                <Link href={`/services/transfers/iban?to=${b.iban}`} aria-label={`Transferir para ${b.name}`} className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100"><Icon name="send" /></Link>
                <button type="button" onClick={() => setTarget(b)} aria-label={`Remover ${b.name}`} className="flex size-11 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600"><Icon name="trash" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Novo beneficiário"><BeneficiaryForm onAdded={() => setAdding(false)} /></Sheet>

      <Modal open={!!target} onClose={() => setTarget(null)} title="Remover beneficiário?">
        <p className="text-sm text-slate-600">{target?.name} será removido da sua lista.</p>
        {remove.error && <Alert kind="error" className="mt-3">{errorMessage(remove.error)}</Alert>}
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" full onClick={() => setTarget(null)}>Cancelar</Button>
          <Button variant="danger" full loading={remove.isPending} onClick={() => target && remove.mutate(target.id, { onSuccess: () => setTarget(null) })}>Remover</Button>
        </div>
      </Modal>
    </div>
  );
}
