"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { formatMoney, servicePaymentSchema, type Receipt } from "@bfa/shared";
import { MoneyField, TextField, Button } from "@/components/ui";
import { useAccounts, usePayService } from "@/hooks/useBank";
import { errorMessage } from "../errors";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";
import { AccountSelectField } from "./AccountSelectField";

type In = z.input<typeof servicePaymentSchema>;
type Out = z.output<typeof servicePaymentSchema>;

export function ServicePaymentForm({ onDone }: { onDone: (r: Receipt) => void }) {
  const accounts = useAccounts();
  const pay = usePayService();
  const [pending, setPending] = useState<Out | null>(null);
  const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm<In, unknown, Out>({
    resolver: zodResolver(servicePaymentSchema),
    defaultValues: { fromAccountId: "", entityCode: "", reference: "", amount: "" },
  });

  const onSubmit = (v: Out) => {
    const from = accounts.data?.find((a) => a.id === v.fromAccountId);
    if (from && v.amount > from.balance) return setError("amount", { message: "Saldo insuficiente." });
    pay.reset();
    setPending(v);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AccountSelectField accounts={accounts.data} error={errors.fromAccountId?.message} onDefault={(id) => setValue("fromAccountId", id)} {...register("fromAccountId")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Entidade" inputMode="numeric" maxLength={5} placeholder="5 dígitos" error={errors.entityCode?.message} {...register("entityCode")} />
          <TextField label="Referência" inputMode="numeric" maxLength={11} placeholder="9 dígitos" error={errors.reference?.message} {...register("reference")} />
        </div>
        <MoneyField label="Montante" error={errors.amount?.message} {...register("amount")} />
        <Button type="submit" full>Continuar</Button>
      </form>
      <PinConfirmDialog
        open={!!pending} pending={pay.isPending} error={pay.error ? errorMessage(pay.error) : null}
        onCancel={() => setPending(null)}
        onConfirm={(pin) => pending && pay.mutate({ ...pending, pin }, { onSuccess: (r) => { setPending(null); onDone(r); } })}
        summary={pending && <SummaryList rows={[["Montante", <strong key="a">{formatMoney(pending.amount)}</strong>], ["Entidade", pending.entityCode], ["Referência", pending.reference]]} />}
      />
    </>
  );
}
