"use client";
import { notFound } from "next/navigation";
import { use } from "react";
import { PROVIDER_ORDER, RECHARGE_PROVIDERS, type RechargeProvider } from "@bfa/shared";
import { FlowShell } from "@/components/features/FlowShell";
import { RechargeForm } from "@/components/features/forms/PaymentForms";
import { ProviderLogo } from "@/components/features/ServiceTile";

export default function RechargePage({ params }: { params: Promise<{ provider: string }> }) {
  const { provider } = use(params);
  // The URL segment is user-controlled: only accept known providers.
  if (!PROVIDER_ORDER.includes(provider as RechargeProvider)) notFound();
  const p = provider as RechargeProvider;
  return (
    <FlowShell title={RECHARGE_PROVIDERS[p].label} back="/services/recharges">
      {(done) => (
        <div className="space-y-5">
          <ProviderLogo provider={p} className="w-40" />
          <RechargeForm provider={p} onDone={done} />
        </div>
      )}
    </FlowShell>
  );
}
