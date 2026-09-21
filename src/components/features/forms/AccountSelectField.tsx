"use client";
import { useEffect } from "react";
import type { Account } from "@bfa/shared";
import { formatMoney } from "@bfa/shared";
import { SelectField } from "@/components/ui";
import { accountTypeLabel } from "../labels";

interface Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  accounts: Account[] | undefined;
  error?: string;
  /** Preselect the first current account once loaded. */
  onDefault?: (id: string) => void;
}

export function AccountSelectField({ accounts, error, onDefault, ...rest }: Props) {
  useEffect(() => {
    const first = accounts?.find((a) => a.type === "Ordem" && a.status === "Active") ?? accounts?.find((a) => a.status === "Active");
    if (first) onDefault?.(first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  return (
    <SelectField label="Conta de origem" error={error} {...rest}>
      <option value="">Seleccione…</option>
      {accounts?.filter((a) => a.status === "Active").map((a) => (
        <option key={a.id} value={a.id}>{a.nickname ?? accountTypeLabel[a.type]} · {formatMoney(a.balance, a.currency)}</option>
      ))}
    </SelectField>
  );
}
