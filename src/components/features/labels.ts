import type { AccountType, CardProduct, TransactionKind } from "@bfa/shared";
import type { IconName } from "@/components/ui";

export const kindLabel: Record<TransactionKind, string> = {
  Transfer: "Transferência", ServicePayment: "Pagamento de serviços", TopUp: "Carregamento", StatePayment: "Pagamento ao Estado", Deposit: "Depósito", Fee: "Comissão", Loan: "Microcrédito", LoanRepayment: "Prestação de microcrédito",
};
export const kindIcon: Record<TransactionKind, IconName> = {
  Transfer: "swap", ServicePayment: "receipt", TopUp: "phone", StatePayment: "state", Deposit: "download", Fee: "hash", Loan: "coins", LoanRepayment: "coins",
};
export const accountTypeLabel: Record<AccountType, string> = {
  Ordem: "Conta à Ordem", Ordenado: "Conta Ordenado", Poupanca: "Conta Poupança", Bankita: "Conta Bankita", Interna: "Interna",
};
export const cardProductLabel: Record<CardProduct, string> = { Debito: "Débito", PrePago: "Pré-pago", Credito: "Crédito" };
