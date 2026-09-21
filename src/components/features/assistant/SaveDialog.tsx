"use client";
import { formatIban, formatMoney, type Receipt, type SavingsSuggestion } from "@bfa/shared";
import { useTransfer } from "@/hooks/useBank";
import { errorMessage } from "../errors";
import { PinConfirmDialog } from "../PinConfirmDialog";
import { SummaryList } from "../SummaryList";

/** "Poupar agora": an ordinary, PIN-confirmed transfer from the current account to the customer's own savings account. */
export function SaveDialog({ suggestion, open, onClose, onDone }: { suggestion: SavingsSuggestion; open: boolean; onClose: () => void; onDone: (r: Receipt) => void }) {
  const transfer = useTransfer();
  const { fromAccountId, targetIban, amount } = suggestion;
  return (
    <PinConfirmDialog
      open={open && !!fromAccountId && !!targetIban} title="Poupar agora" pending={transfer.isPending} error={transfer.error ? errorMessage(transfer.error) : null}
      onCancel={() => { transfer.reset(); onClose(); }}
      onConfirm={(pin) => fromAccountId && targetIban && transfer.mutate({ fromAccountId, toIban: targetIban, amount, description: "Poupança automática", pin }, { onSuccess: (r) => { onClose(); onDone(r); } })}
      summary={<SummaryList rows={[["Montante", <strong key="a">{formatMoney(amount)}</strong>], ["Para", "A sua conta poupança"], ["IBAN", targetIban ? formatIban(targetIban) : null], ["Comissão", "Sem comissão"]]} />}
    />
  );
}
