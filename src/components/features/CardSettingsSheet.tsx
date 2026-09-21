"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import type { z } from "zod";
import { cardLimitSchema, formatMoney, type Card as CardData } from "@bfa/shared";
import { Alert, Button, Icon, Modal, MoneyField, Sheet, Toggle, type IconName } from "@/components/ui";
import { useUpdateCard } from "@/hooks/useBank";
import { errorMessage } from "./errors";

type In = z.input<typeof cardLimitSchema>;
type Out = z.output<typeof cardLimitSchema>;

function SettingRow({ icon, label, hint, checked, disabled, onChange }: { icon: IconName; label: string; hint?: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-800"><Icon name={icon} /></span>
      <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{label}</p>{hint && <p className="text-sm text-slate-500">{hint}</p>}</div>
      <Toggle checked={checked} onChange={onChange} label={label} disabled={disabled} />
    </div>
  );
}

/**
 * Everything adjustable on a card in one bottom sheet. Changes are optimistic (see useUpdateCard): the touched
 * control flips at once, nothing else is re-fetched or disabled, and a failed change rolls back by itself.
 */
export function CardSettingsSheet({ card, open, onClose }: { card: CardData; open: boolean; onClose: () => void }) {
  const flags = useUpdateCard();   // toggles + block: independent from the limit form
  const limit = useUpdateCard();
  const [confirmBlock, setConfirmBlock] = useState(false);
  const blocked = card.status === "Blocked";
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<In, unknown, Out>({ resolver: zodResolver(cardLimitSchema), defaultValues: { dailyLimit: String(card.dailyLimit) } });
  const set = (patch: Partial<Record<"onlinePurchases" | "contactless" | "atmWithdrawals" | "internationalPayments", boolean>>) => flags.mutate({ id: card.id, ...patch });
  const failure = flags.error ?? limit.error;

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Definições do cartão">
        {failure && <Alert kind="error">{errorMessage(failure)} A alteração foi revertida.</Alert>}
        <p className="text-xs font-medium tracking-wider text-slate-500">CANAIS DE UTILIZAÇÃO</p>
        <SettingRow icon="globe" label="Compras online" checked={card.onlinePurchases} disabled={blocked} onChange={(v) => set({ onlinePurchases: v })} />
        <SettingRow icon="wifi" label="Sem contacto" hint="Pagamentos por aproximação" checked={card.contactless} disabled={blocked} onChange={(v) => set({ contactless: v })} />
        <SettingRow icon="cash" label="Levantamentos ATM" checked={card.atmWithdrawals} disabled={blocked} onChange={(v) => set({ atmWithdrawals: v })} />
        <SettingRow icon="plane" label="Pagamentos internacionais" hint="Fora de Angola" checked={card.internationalPayments} disabled={blocked} onChange={(v) => set({ internationalPayments: v })} />

        <p className="pt-2 text-xs font-medium tracking-wider text-slate-500">LIMITE DIÁRIO · actual {formatMoney(card.dailyLimit)}</p>
        <form noValidate className="flex items-end gap-3" onSubmit={handleSubmit((v) => limit.mutate({ id: card.id, dailyLimit: v.dailyLimit }, {
          onSuccess: (c) => reset({ dailyLimit: String(c.dailyLimit) }),
          onError: () => reset({ dailyLimit: String(card.dailyLimit) }),
        }))}>
          <MoneyField label="Novo limite" className="flex-1" error={errors.dailyLimit?.message} disabled={blocked} {...register("dailyLimit")} />
          <Button type="submit" variant="secondary" disabled={!isDirty || blocked} loading={limit.isPending}>Guardar</Button>
        </form>

        <Button variant={blocked ? "primary" : "danger"} full onClick={() => (blocked ? flags.mutate({ id: card.id, blocked: false }) : setConfirmBlock(true))}>
          <Icon name={blocked ? "unlock" : "lock"} className="size-4" />{blocked ? "Desbloquear cartão" : "Bloquear cartão"}
        </Button>
      </Sheet>

      <Modal open={confirmBlock} onClose={() => setConfirmBlock(false)} title="Bloquear cartão?">
        <p className="text-sm text-slate-600">O cartão terminado em <strong>{card.last4}</strong> deixará de funcionar até ser desbloqueado.</p>
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" full onClick={() => setConfirmBlock(false)}>Cancelar</Button>
          <Button variant="danger" full onClick={() => { flags.mutate({ id: card.id, blocked: true }); setConfirmBlock(false); }}>Bloquear</Button>
        </div>
      </Modal>
    </>
  );
}
