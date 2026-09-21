import { PROVIDER_ORDER } from "@bfa/shared";
import { PageHeader } from "@/components/features/PageHeader";
import { ProviderTile } from "@/components/features/ServiceTile";

export default function RechargeProviders() {
  return (
    <div className="space-y-6">
      <PageHeader title="Carregamentos" back="/services" />
      <p className="text-slate-500">Escolha o fornecedor.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {PROVIDER_ORDER.map((p) => <ProviderTile key={p} provider={p} />)}
      </div>
    </div>
  );
}
