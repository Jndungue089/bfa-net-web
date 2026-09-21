"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { formatMoney, formatPhone, RECHARGE_PROVIDERS, rechargeSchema, statePaymentSchema, type Receipt, type RechargeProvider } from "@bfa/shared";
import { Button, DigitsField, MoneyField, TextField } from "@/components/ui";
import { useAccounts, usePayState, useRecharge } from "@/hooks/useBank";
import { errorMessage } from "../errors";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";
import { AccountSelectField } from "./AccountSelectField";

type RIn = z.input<typeof rechargeSchema>;
type ROut = z.output<typeof rechargeSchema>;

/** Telemóvel (Unitel, Africell) ou nº de subscritor / contador (DStv, ZAP, ENDE). */
export function RechargeForm({ provider, onDone }: { provider: RechargeProvider; onDone: (r: Receipt) => void }) {
  const info = RECHARGE_PROVIDERS[provider];
  const accounts = useAccounts();
  const recharge = useRecharge();
  const [pending, setPending] = useState<ROut | null>(null);
  const mobile = info.kind === "mobile";
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<RIn, unknown, ROut>({
    resolver: zodResolver(rechargeSchema), defaultValues: { fromAccountId: "", provider, identifier: "", amount: "" },
  });

  const onSubmit = (v: ROut) => {
    const from = accounts.data?.find((a) => a.id === v.fromAccountId);
    if (from && v.amount > from.balance) return setError("amount", { message: "Saldo insuficiente." });
    recharge.reset(); setPending(v);
  };
  const range = `Entre ${formatMoney(info.min).replace(",00", "")} e ${formatMoney(info.max).replace(",00", "")}`;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AccountSelectField accounts={accounts.data} error={errors.fromAccountId?.message} onDefault={(id) => setValue("fromAccountId", id)} {...register("fromAccountId")} />
        {mobile
          ? <TextField label={info.idLabel} inputMode="tel" placeholder={info.idHint} autoComplete="off" error={errors.identifier?.message} {...register("identifier")} />
          : <DigitsField label={info.idLabel} digits={12} placeholder={info.idHint} error={errors.identifier?.message} {...register("identifier")} />}
        <MoneyField label="Montante" hint={range} error={errors.amount?.message} {...register("amount")} />
        <div className="flex flex-wrap gap-2">
          {info.quickAmounts.map((q) => <Button key={q} variant="secondary" className="h-9 px-3" onClick={() => setValue("amount", String(q), { shouldValidate: true })}>{formatMoney(q).replace(",00", "").replace(" Kz", "")}</Button>)}
        </div>
        <Button type="submit" full>Continuar</Button>
      </form>
      <PinConfirmDialog open={!!pending} pending={recharge.isPending} error={recharge.error ? errorMessage(recharge.error) : null} onCancel={() => setPending(null)}
        onConfirm={(pin) => pending && recharge.mutate({ ...pending, pin }, { onSuccess: (r) => { setPending(null); onDone(r); } })}
        summary={pending && <SummaryList rows={[["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>], ["Fornecedor", info.label], [info.idLabel, mobile ? formatPhone(pending.identifier.replace(/\D/g, "").slice(-9)) : pending.identifier]]} />} />
    </>
  );
}

type StIn = z.input<typeof statePaymentSchema>;
type StOut = z.output<typeof statePaymentSchema>;

/** Pagamento ao Estado: referência de 13 dígitos. */
export function StatePaymentForm({ onDone }: { onDone: (r: Receipt) => void }) {
  const accounts = useAccounts();
  const pay = usePayState();
  const [pending, setPending] = useState<StOut | null>(null);
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<StIn, unknown, StOut>({
    resolver: zodResolver(statePaymentSchema), defaultValues: { fromAccountId: "", reference: "", amount: "" },
  });
  const onSubmit = (v: StOut) => {
    const from = accounts.data?.find((a) => a.id === v.fromAccountId);
    if (from && v.amount > from.balance) return setError("amount", { message: "Saldo insuficiente." });
    pay.reset(); setPending(v);
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AccountSelectField accounts={accounts.data} error={errors.fromAccountId?.message} onDefault={(id) => setValue("fromAccountId", id)} {...register("fromAccountId")} />
        <DigitsField label="Referência de pagamento" digits={13} placeholder="13 dígitos" hint="Consta no documento de arrecadação de receita." error={errors.reference?.message} {...register("reference")} />
        <MoneyField label="Montante" error={errors.amount?.message} {...register("amount")} />
        <Button type="submit" full>Continuar</Button>
      </form>
      <PinConfirmDialog open={!!pending} pending={pay.isPending} error={pay.error ? errorMessage(pay.error) : null} onCancel={() => setPending(null)}
        onConfirm={(pin) => pending && pay.mutate({ fromAccountId: pending.fromAccountId, reference: pending.reference, amount: pending.amount, pin }, { onSuccess: (r) => { setPending(null); onDone(r); } })}
        summary={pending && <SummaryList rows={[["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>], ["Beneficiário", "Estado"], ["Referência", pending.reference]]} />} />
    </>
  );
}
