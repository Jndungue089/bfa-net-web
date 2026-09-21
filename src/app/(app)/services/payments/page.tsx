import { OptionRow } from "@/components/features/ServiceTile";
import { PageHeader } from "@/components/features/PageHeader";
import { Card } from "@/components/ui";

export default function ServicePaymentOptions() {
  return (
    <div className="space-y-6">
      <PageHeader title="Pagamento de serviços" back="/services" />
      <Card className="mx-auto max-w-xl !p-3">
        <OptionRow href="/services/payments/reference" icon="barcode" title="Pagamento por referência" subtitle="Entidade e referência" />
      </Card>
    </div>
  );
}
