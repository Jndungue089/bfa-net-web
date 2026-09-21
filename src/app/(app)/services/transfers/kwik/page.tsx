import { OptionRow } from "@/components/features/ServiceTile";
import { PageHeader } from "@/components/features/PageHeader";
import { Card } from "@/components/ui";

export default function KwikOptions() {
  return (
    <div className="space-y-6">
      <PageHeader title="KWiK" back="/services/transfers" />
      <Card className="mx-auto max-w-xl !p-3">
        <OptionRow href="/services/transfers/kwik/key" icon="keypad" title="Por chave KWiK" subtitle="Nº de telemóvel do destinatário" />
      </Card>
    </div>
  );
}
