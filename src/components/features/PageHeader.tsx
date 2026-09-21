import Link from "next/link";
import { Icon } from "@/components/ui";

/** Title row with a back link (icon-only, labelled for assistive tech). */
export function PageHeader({ title, back, action }: { title: string; back?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {back && (
        <Link href={back} aria-label="Voltar" className="-ml-2 flex size-10 items-center justify-center rounded-full text-navy-800 hover:bg-navy-50">
          <Icon name="chevron" className="size-6 rotate-180" />
        </Link>
      )}
      <h1 className="flex-1 text-2xl font-bold text-navy-900">{title}</h1>
      {action}
    </div>
  );
}
