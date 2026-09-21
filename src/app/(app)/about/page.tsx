import type { Metadata } from "next";
import { PageHeader } from "@/components/features/PageHeader";
import { Alert, Card, Icon } from "@/components/ui";
import { getAbout } from "@/lib/about";

export const metadata: Metadata = { title: "Sobre o BFA" };
export const revalidate = 3600;

export default async function AboutPage() {
  const about = await getAbout();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Sobre o BFA" back="/profile" />
      {!about ? <Alert kind="error">Informação indisponível de momento.</Alert> : (
        <>
          <Card className="bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-0">
            <h2 className="text-2xl font-bold">{about.title}</h2>
            {about.subtitle && <p className="mt-1 text-white/80">{about.subtitle}</p>}
            {about.values.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">{about.values.map((v) => <li key={v} className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold">{v}</li>)}</ul>
            )}
          </Card>
          {about.sections.map((s) => (
            <Card key={s.heading}>
              <h3 className="mb-2 text-lg font-semibold text-brand-600">{s.heading}</h3>
              <p className="whitespace-pre-line leading-relaxed text-slate-700">{s.body}</p>
            </Card>
          ))}
          <a href={about.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"><Icon name="link" className="size-4" />Ver no site do BFA</a>
        </>
      )}
    </div>
  );
}
