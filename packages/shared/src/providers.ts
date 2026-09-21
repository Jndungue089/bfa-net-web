import type { RechargeProvider } from "./types";

export type ProviderKind = "mobile" | "tv" | "energy";

export interface ProviderInfo {
  label: string;
  kind: ProviderKind;
  /** Label of the identifier the customer types. */
  idLabel: string;
  idHint: string;
  min: number;
  max: number;
  quickAmounts: number[];
}

/** Mirrors the validation in RechargeRequestValidator on the server. */
export const RECHARGE_PROVIDERS: Record<RechargeProvider, ProviderInfo> = {
  Unitel: { label: "Unitel", kind: "mobile", idLabel: "Telemóvel", idHint: "9XX XXX XXX", min: 100, max: 50_000, quickAmounts: [200, 500, 1000, 2000, 5000] },
  Africell: { label: "Africell", kind: "mobile", idLabel: "Telemóvel", idHint: "9XX XXX XXX", min: 100, max: 50_000, quickAmounts: [200, 500, 1000, 2000, 5000] },
  Dstv: { label: "DStv", kind: "tv", idLabel: "Nº do cartão / subscritor", idHint: "9 a 12 dígitos", min: 100, max: 500_000, quickAmounts: [5000, 10_000, 15_000, 25_000] },
  Zap: { label: "ZAP", kind: "tv", idLabel: "Nº do cartão / subscritor", idHint: "9 a 12 dígitos", min: 100, max: 500_000, quickAmounts: [5000, 10_000, 15_000, 25_000] },
  Ende: { label: "ENDE", kind: "energy", idLabel: "Nº do contador", idHint: "9 a 12 dígitos", min: 100, max: 500_000, quickAmounts: [2000, 5000, 10_000, 20_000] },
};

export const PROVIDER_ORDER: RechargeProvider[] = ["Unitel", "Africell", "Dstv", "Zap", "Ende"];
