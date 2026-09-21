// Wire types — mirror BfaNet.Application.Contracts. Money is a JSON number with ≤ 2 decimals.
export type Currency = "AOA" | "USD" | "EUR";
export type AccountType = "Ordem" | "Ordenado" | "Poupanca" | "Bankita" | "Interna";
export type AccountStatus = "Active" | "Frozen" | "Closed";
export type Direction = "Debit" | "Credit";
export type TransactionKind = "Transfer" | "ServicePayment" | "TopUp" | "StatePayment" | "Deposit" | "Fee" | "Loan" | "LoanRepayment";
export type TransactionStatus = "Completed" | "Failed" | "Reversed";
export type CardProduct = "Debito" | "PrePago" | "Credito";
export type CardStatus = "Active" | "Blocked" | "Cancelled";
export type RechargeProvider = "Unitel" | "Africell" | "Dstv" | "Zap" | "Ende";

export interface Profile {
  id: string; customerNumber: string; fullName: string; email: string; phone: string;
  nationalId: string; birthDate: string; lastLoginAt: string | null;
  /** Unix ms of the last avatar change, null when there is none. Use as a cache-buster: /api/v1/me/avatar?v=… */
  avatarVersion: number | null;
}
export interface Session { accessToken: string | null; refreshToken: string | null; expiresInSeconds: number; profile: Profile }
export interface ActiveSession { familyId: string; device: string | null; ipAddress: string | null; createdAt: string; current: boolean }

export interface Account {
  id: string; iban: string; accountNumber: string; type: AccountType; currency: Currency;
  balance: number; status: AccountStatus; nickname: string | null; openedAt: string;
}
export interface StatementItem {
  entryId: number; transactionId: string; reference: string; kind: TransactionKind; direction: Direction;
  amount: number; balanceAfter: number; description: string | null; counterparty: string | null; createdAt: string;
}
export interface StatementPage { items: StatementItem[]; nextCursor: number | null }
export interface StatementQuery { from?: string; to?: string; direction?: Direction; cursor?: number; limit?: number }

export interface Receipt {
  transactionId: string; reference: string; kind: TransactionKind; status: TransactionStatus;
  amount: number; fee: number; currency: Currency; description: string | null;
  counterpartyName: string | null; counterpartyIban: string | null; balanceAfter: number; createdAt: string;
  /** From the viewer's side: Debit = money left, Credit = money arrived. */
  direction: Direction; originatorName: string | null;
}
export interface ResolvedIban { valid: boolean; internalAccount: boolean; holderMasked: string | null; bankName: string | null }

export interface Beneficiary { id: string; name: string; iban: string; bankName: string | null; createdAt: string }
export interface Card {
  id: string; accountId: string; product: CardProduct; productName: string; last4: string; holderName: string;
  expiryMonth: number; expiryYear: number; status: CardStatus; onlinePurchases: boolean; contactless: boolean;
  atmWithdrawals: boolean; internationalPayments: boolean; dailyLimit: number;
}
export interface ExchangeRate { currency: Currency; buy: number; sell: number; source: string; updatedAt: string }
export interface Product { code: string; category: string; name: string; summary: string; url: string }

export interface ResolvedKwik { found: boolean; holderMasked: string | null }
export interface Contact { kind: "phone" | "email" | "web" | "branch"; label: string; value: string; url: string }
export interface AboutInfo { title: string; url: string }

// ---- Financial assistant ----
export type InsightKind = "success" | "info" | "warning" | "tip";
export interface HealthFactor { name: string; score: number; max: number; note: string }
export interface Health { score: number; label: "Excelente" | "Boa" | "Razoável" | "Atenção" | string; factors: HealthFactor[] }
export interface MonthFlow { month: string; income: number; spend: number }
export interface CategorySpend { category: string; label: string; amount: number; averageBefore: number; sharePercent: number }
export interface RecurringPayment { name: string; category: string; categoryLabel: string; amount: number; lastDate: string; nextDate: string }
export interface Insight { id: string; kind: InsightKind; title: string; message: string; actionType: "save" | "credit" | "statement" | null; actionAmount: number | null }
export interface SavingsSuggestion { amount: number; reason: string; yearlyProjection: number; fromAccountId: string | null; targetAccountId: string | null; targetIban: string | null }
export interface AssistantInsights {
  generatedAt: string; hasEnoughData: boolean; currency: Currency; health: Health;
  spentThisMonth: number; projectedSpend: number; averageMonthlySpend: number; averageMonthlyIncome: number; savingsRatePercent: number;
  spendableBalance: number; savingsBalance: number; dailyBudget: number; daysLeft: number;
  months: MonthFlow[]; categories: CategorySpend[]; recurring: RecurringPayment[]; insights: Insight[]; saving: SavingsSuggestion | null;
}
export interface LoanInstallment { number: number; dueDate: string; amount: number; paidAt: string | null }
export interface Loan {
  id: string; principal: number; termMonths: number; annualRatePercent: number; installment: number; totalRepayable: number;
  outstanding: number; status: "Active" | "Paid"; createdAt: string; installments: LoanInstallment[];
}
export interface CreditOffer {
  eligible: boolean; maxAmount: number; minAmount: number; annualRatePercent: number; originationFeePercent: number; terms: number[];
  maxInstallment: number; reasons: string[]; blockers: string[]; activeLoan: Loan | null;
}
export interface CreditSimulation {
  amount: number; months: number; annualRatePercent: number; fee: number; netDisbursed: number; installment: number;
  totalRepayable: number; totalInterest: number; withinCapacity: boolean;
}
