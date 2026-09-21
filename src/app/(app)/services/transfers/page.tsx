import { OptionRow } from "@/components/features/ServiceTile";
import { PageHeader } from "@/components/features/PageHeader";
import { Card } from "@/components/ui";

export default function TransferOptions() {
  return (
    <div className="space-y-6">
      <PageHeader title="Transferências" back="/services" />
      <Card className="mx-auto max-w-xl !p-3">
        <OptionRow href="/services/transfers/iban" icon="card" title="Por IBAN" subtitle="Para qualquer conta bancária" />
        <OptionRow href="/services/transfers/kwik" icon="zap" title="KWiK" subtitle="Instantânea, por nº de telemóvel" />
      </Card>
    </div>
  );
}
