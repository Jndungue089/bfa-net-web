import { z } from "zod";
import { cleanText, normalizeEmail, normalizeIban, normalizeNationalId, normalizePhone } from "./sanitize";
import { RX } from "./regex";
import { isBfaIban, isValidIban } from "./iban";
import { PASSWORD_MAX, passwordIssue, pinIssue } from "./credentials";
import { parseMoneyInput } from "./format";
import { RECHARGE_PROVIDERS } from "./providers";

// ---- field building blocks (each one sanitises first, then validates) ----

export const customerNumberField = z.string().trim().regex(RX.customerNumber, "O número de adesão tem 8 dígitos.");

export const personNameField = z
  .string()
  .transform(cleanText)
  .refine((v) => RX.personName.test(v), "Nome inválido (apenas letras, espaços, apóstrofo e hífen).");

export const emailField = z
  .string()
  .transform(normalizeEmail)
  .refine((v) => v.length <= 254 && RX.email.test(v), "Email inválido.");

export const phoneField = z
  .string()
  .transform(normalizePhone)
  .refine((v) => RX.phone.test(v), "Telemóvel inválido (9XX XXX XXX).");

export const nationalIdField = z
  .string()
  .transform(normalizeNationalId)
  .refine((v) => RX.nationalId.test(v), "Nº do BI inválido (ex.: 005678901LA041).");

export const ibanField = z
  .string()
  .transform(normalizeIban)
  .refine((v) => isValidIban(v), "IBAN inválido.");

export const pinField = z.string().refine((v) => RX.pin.test(v), "O PIN tem 6 dígitos.");

export const newPinField = z.string().superRefine((v, ctx) => {
  const issue = pinIssue(v);
  if (issue) ctx.addIssue({ code: "custom", message: issue });
});

export const descriptionField = z
  .string()
  .transform(cleanText)
  .refine((v) => RX.description.test(v), "Descrição com caracteres não permitidos (máx. 140).");

export const newPasswordField = z.string().max(PASSWORD_MAX, "Palavra-passe demasiado longa.").superRefine((v, ctx) => {
  const issue = passwordIssue(v);
  if (issue) ctx.addIssue({ code: "custom", message: issue });
});

/** Text input "1 500,50" → number, 0 < n ≤ max, ≤ 2 decimals. */
export const moneyField = (max = 5_000_000, min = 0.01) =>
  z
    .string()
    .min(1, "Indique o montante.")
    .transform((v) => parseMoneyInput(v))
    .refine((n) => !Number.isNaN(n), "Montante inválido (ex.: 1500,50).")
    .refine((n) => Number.isNaN(n) || n >= min, `O montante mínimo é ${min}.`)
    .refine((n) => Number.isNaN(n) || n <= max, "Excede o limite por operação.");

// ---- forms ----

export const loginSchema = z.object({
  customerNumber: customerNumberField,
  password: z.string().min(1, "Indique a palavra-passe.").max(PASSWORD_MAX),
});

const adultBirthDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")
  .refine((v) => {
    const d = new Date(`${v}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return false;
    const cutoff = new Date();
    cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
    return d <= cutoff && d.getUTCFullYear() > new Date().getUTCFullYear() - 120;
  }, "É necessário ter pelo menos 18 anos.");

export const registerSchema = z
  .object({
    fullName: personNameField,
    email: emailField,
    phone: phoneField,
    nationalId: nationalIdField,
    taxId: z.string().transform((v) => v.trim()).refine((v) => v === "" || RX.taxId.test(v), "NIF inválido (10 dígitos)."),
    birthDate: adultBirthDate,
    password: newPasswordField,
    confirmPassword: z.string(),
    pin: newPinField,
    confirmPin: z.string(),
    acceptTerms: z.boolean().refine((v) => v, "É necessário aceitar os termos e condições."),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "As palavras-passe não coincidem." });
    if (v.pin !== v.confirmPin) ctx.addIssue({ code: "custom", path: ["confirmPin"], message: "Os PIN não coincidem." });
    const issue = passwordIssue(v.password, { fullName: v.fullName });
    if (issue) ctx.addIssue({ code: "custom", path: ["password"], message: issue });
  });

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1, "Indique a palavra-passe actual."), newPassword: newPasswordField, confirmPassword: z.string() })
  .superRefine((v, ctx) => {
    if (v.newPassword !== v.confirmPassword) ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "As palavras-passe não coincidem." });
    if (v.newPassword === v.currentPassword) ctx.addIssue({ code: "custom", path: ["newPassword"], message: "Deve ser diferente da actual." });
  });

export const changePinSchema = z
  .object({ currentPin: pinField, newPin: newPinField, confirmPin: z.string() })
  .superRefine((v, ctx) => {
    if (v.newPin !== v.confirmPin) ctx.addIssue({ code: "custom", path: ["confirmPin"], message: "Os PIN não coincidem." });
    if (v.newPin === v.currentPin) ctx.addIssue({ code: "custom", path: ["newPin"], message: "Deve ser diferente do actual." });
  });

export const transferSchema = z.object({
  fromAccountId: z.uuid("Seleccione a conta de origem."),
  toIban: ibanField,
  beneficiaryName: z.string().transform(cleanText).refine((v) => v === "" || RX.personName.test(v), "Nome inválido."),
  amount: moneyField(),
  description: descriptionField,
}).superRefine((v, ctx) => {
  // Interbank transfers need the beneficiary's name (the server enforces the same rule).
  if (isValidIban(v.toIban) && !isBfaIban(v.toIban) && !v.beneficiaryName)
    ctx.addIssue({ code: "custom", path: ["beneficiaryName"], message: "Indique o nome do beneficiário." });
});

export const beneficiarySchema = z.object({ name: personNameField, iban: ibanField });

export const servicePaymentSchema = z.object({
  fromAccountId: z.uuid("Seleccione a conta de origem."),
  entityCode: z.string().regex(RX.serviceEntity, "A entidade tem 5 dígitos."),
  reference: z.string().transform((v) => v.replace(/\s/g, "")).refine((v) => RX.serviceReference.test(v), "A referência tem 9 dígitos."),
  amount: moneyField(),
});

const RECHARGE_PROVIDER_IDS = ["Unitel", "Africell", "Dstv", "Zap", "Ende"] as const;

/** Recharge / TV / electricity: the identifier rule and amount range depend on the provider. */
export const rechargeSchema = z
  .object({
    fromAccountId: z.uuid("Seleccione a conta de origem."),
    provider: z.enum(RECHARGE_PROVIDER_IDS),
    identifier: z.string().transform((v) => v.trim()),
    amount: moneyField(500_000, 100),
  })
  .superRefine((v, ctx) => {
    const info = RECHARGE_PROVIDERS[v.provider];
    if (info.kind === "mobile") {
      if (!RX.phone.test(normalizePhone(v.identifier))) ctx.addIssue({ code: "custom", path: ["identifier"], message: "Telemóvel inválido (9XX XXX XXX)." });
    } else if (!/^\d{9,12}$/.test(v.identifier.replace(/\D/g, "")) || /\D/.test(v.identifier.replace(/\s/g, ""))) {
      ctx.addIssue({ code: "custom", path: ["identifier"], message: "Número inválido (9 a 12 dígitos)." });
    }
    if (!Number.isNaN(v.amount) && (v.amount < info.min || v.amount > info.max))
      ctx.addIssue({ code: "custom", path: ["amount"], message: `Montante entre ${info.min.toLocaleString("pt-PT")} e ${info.max.toLocaleString("pt-PT")} Kz.` });
  });

/** Pagamento ao Estado: 13-digit reference. */
export const statePaymentSchema = z.object({
  fromAccountId: z.uuid("Seleccione a conta de origem."),
  reference: z.string().transform((v) => v.replace(/\s/g, "")).refine((v) => /^\d{13}$/.test(v), "A referência tem 13 dígitos."),
  amount: moneyField(),
});

/** KWiK: recipient key is a mobile number. */
export const kwikSchema = z.object({
  fromAccountId: z.uuid("Seleccione a conta de origem."),
  key: phoneField,
  amount: moneyField(),
  description: descriptionField,
});

export const statementFilterSchema = z
  .object({ from: z.string(), to: z.string(), direction: z.enum(["", "Debit", "Credit"]) })
  .refine((v) => !v.from || !v.to || v.from <= v.to, { path: ["to"], message: "A data final deve ser posterior à inicial." });

export const cardLimitSchema = z.object({ dailyLimit: moneyField(2_000_000, 0) });
export const pinConfirmSchema = z.object({ pin: pinField });

export type LoginForm = z.input<typeof loginSchema>;
export type RegisterForm = z.input<typeof registerSchema>;
export type TransferForm = z.input<typeof transferSchema>;
export type TransferValues = z.output<typeof transferSchema>;

/** Microcredit request, bounded by the offer the server computed (the server re-checks everything on acceptance). */
export const makeCreditSchema = (offer: { minAmount: number; maxAmount: number; terms: readonly number[] }) =>
  z.object({
    accountId: z.uuid("Seleccione a conta que recebe o valor."),
    amount: moneyField(offer.maxAmount, offer.minAmount),
    months: z.number().refine((m) => offer.terms.includes(m), "Escolha um prazo disponível."),
  });
