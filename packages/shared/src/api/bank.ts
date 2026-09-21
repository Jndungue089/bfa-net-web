import type { ApiClient } from "./client";
import type {
  Account, ActiveSession, Beneficiary, Card, ExchangeRate, Product, Profile, Receipt, RechargeProvider,
  ResolvedIban, ResolvedKwik, Session, StatementPage, StatementQuery, Contact, AboutInfo,
  AssistantInsights, CreditOffer, CreditSimulation, Loan,
} from "../types";

const V1 = "/api/v1";

/** Typed surface of the BFA NET API. Platform code supplies the ApiClient (cookies vs bearer). */
export function createBankApi(c: ApiClient) {
  return {
    auth: {
      login: (b: { customerNumber: string; password: string }) => c.post<Session>(`${V1}/auth/login`, { body: b, auth: false }),
      register: (b: Record<string, unknown>) => c.post<Session>(`${V1}/auth/register`, { body: b, auth: false }),
      refresh: (refreshToken?: string) => c.post<Session>(`${V1}/auth/refresh`, { body: refreshToken ? { refreshToken } : {}, auth: false }),
      logout: (refreshToken?: string) => c.post<void>(`${V1}/auth/logout`, { body: refreshToken ? { refreshToken } : {}, auth: false }),
      logoutAll: () => c.post<void>(`${V1}/auth/logout-all`),
      me: () => c.get<Profile>(`${V1}/me`),
      changePassword: (b: { currentPassword: string; newPassword: string }) => c.post<void>(`${V1}/auth/change-password`, { body: b }),
      changePin: (b: { currentPin: string; newPin: string }) => c.post<void>(`${V1}/auth/change-pin`, { body: b }),
      /** Checks the operations PIN without moving money (same lockout as payments). */
      verifyPin: (pin: string) => c.post<void>(`${V1}/auth/verify-pin`, { body: { pin } }),
      sessions: () => c.get<ActiveSession[]>(`${V1}/auth/sessions`),
      revokeSession: (familyId: string) => c.delete<void>(`${V1}/auth/sessions/${familyId}`),
      biometricEnroll: (b: { password: string; deviceLabel?: string }) => c.post<{ deviceToken: string }>(`${V1}/auth/biometric/enroll`, { body: b }),
      biometricLogin: (b: { customerNumber: string; deviceToken: string }) => c.post<Session>(`${V1}/auth/biometric/login`, { body: b, auth: false }),
      biometricDisable: (deviceToken: string) => c.post<void>(`${V1}/auth/biometric/disable`, { body: { deviceToken } }),
      /**
       * multipart/form-data with one `file` part (JPEG/PNG/WebP, ≤ 10 MB). The server validates the bytes, crops to a
       * square, resizes and re-encodes — clients upload the original untouched.
       */
      uploadAvatar: (form: FormData) => c.put<void>(`${V1}/me/avatar`, { raw: { data: form } }),
      deleteAvatar: () => c.delete<void>(`${V1}/me/avatar`),
    },
    accounts: {
      list: () => c.get<Account[]>(`${V1}/accounts`),
      get: (id: string) => c.get<Account>(`${V1}/accounts/${id}`),
      rename: (id: string, nickname: string | null) => c.patch<Account>(`${V1}/accounts/${id}`, { body: { nickname } }),
      statement: (id: string, q: StatementQuery = {}) => c.get<StatementPage>(`${V1}/accounts/${id}/statement`, { query: { ...q } }),
    },
    money: {
      resolveIban: (iban: string) => c.post<ResolvedIban>(`${V1}/transfers/resolve-iban`, { body: { iban } }),
      transfer: (key: string, b: { fromAccountId: string; toIban: string; beneficiaryName?: string; amount: number; description?: string; pin: string }) =>
        c.post<Receipt>(`${V1}/transfers`, { body: b, idempotencyKey: key }),
      payService: (key: string, b: { fromAccountId: string; entityCode: string; reference: string; amount: number; pin: string }) =>
        c.post<Receipt>(`${V1}/payments/services`, { body: b, idempotencyKey: key }),
      recharge: (key: string, b: { fromAccountId: string; provider: RechargeProvider; identifier: string; amount: number; pin: string }) =>
        c.post<Receipt>(`${V1}/payments/recharges`, { body: b, idempotencyKey: key }),
      payState: (key: string, b: { fromAccountId: string; reference: string; amount: number; pin: string }) =>
        c.post<Receipt>(`${V1}/payments/state`, { body: b, idempotencyKey: key }),
      resolveKwik: (keyValue: string) => c.post<ResolvedKwik>(`${V1}/transfers/kwik/resolve`, { body: { key: keyValue } }),
      kwikTransfer: (key: string, b: { fromAccountId: string; key: string; amount: number; description?: string; pin: string }) =>
        c.post<Receipt>(`${V1}/transfers/kwik`, { body: b, idempotencyKey: key }),
      receipt: (transactionId: string) => c.get<Receipt>(`${V1}/transactions/${transactionId}`),
    },
    assistant: {
      insights: () => c.get<AssistantInsights>(`${V1}/assistant/insights`),
      credit: () => c.get<CreditOffer>(`${V1}/assistant/credit`),
      /** Recomputed by the server; the client never calculates rates or instalments. */
      simulate: (amount: number, months: number) => c.get<CreditSimulation>(`${V1}/assistant/credit/simulate`, { query: { amount, months } }),
      accept: (key: string, b: { accountId: string; amount: number; months: number; pin: string }) =>
        c.post<Loan>(`${V1}/assistant/credit/accept`, { body: b, idempotencyKey: key }),
      loans: () => c.get<Loan[]>(`${V1}/assistant/loans`),
      repay: (key: string, loanId: string, b: { fromAccountId: string; pin: string }) =>
        c.post<Receipt>(`${V1}/assistant/loans/${encodeURIComponent(loanId)}/repay`, { body: b, idempotencyKey: key }),
    },
    beneficiaries: {
      list: () => c.get<Beneficiary[]>(`${V1}/beneficiaries`),
      create: (b: { name: string; iban: string }) => c.post<Beneficiary>(`${V1}/beneficiaries`, { body: b }),
      remove: (id: string) => c.delete<void>(`${V1}/beneficiaries/${id}`),
    },
    cards: {
      list: () => c.get<Card[]>(`${V1}/cards`),
      update: (id: string, b: { blocked?: boolean; onlinePurchases?: boolean; contactless?: boolean; atmWithdrawals?: boolean; internationalPayments?: boolean; dailyLimit?: number }) =>
        c.patch<Card>(`${V1}/cards/${id}`, { body: b }),
    },
    public: {
      exchangeRates: () => c.get<ExchangeRate[]>(`${V1}/public/exchange-rates`, { auth: false }),
      products: () => c.get<Product[]>(`${V1}/public/products`, { auth: false }),
      contacts: () => c.get<Contact[]>(`${V1}/public/contacts`, { auth: false }),
      about: () => c.get<AboutInfo>(`${V1}/public/about`, { auth: false }),
    },
  };
}

export type BankApi = ReturnType<typeof createBankApi>;
