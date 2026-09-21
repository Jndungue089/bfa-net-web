import Link from "next/link";
import Image from "next/image";
import { RECHARGE_PROVIDERS, type RechargeProvider } from "@bfa/shared";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui";

const PROVIDER_LOGO: Record<RechargeProvider, { src: string; bg: string; fit: "contain" | "cover" }> = {
  Unitel: { src: "/providers/unitel.png", bg: "bg-white", fit: "contain" },
  Africell: { src: "/providers/africell.png", bg: "bg-white", fit: "contain" },
  Dstv: { src: "/providers/dstv.png", bg: "bg-[#1d2266]", fit: "cover" },
  Zap: { src: "/providers/zap.png", bg: "bg-white", fit: "contain" },
  Ende: { src: "/providers/ende.jpeg", bg: "bg-white", fit: "contain" },
};

/** Grid tile: large icon in a tinted circle + label. */
export function ServiceTile({ href, icon, label }: { href: string; icon: IconName; label: string }) {
  return (
    <Link href={href} className="group flex min-h-32 flex-col justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md hover:ring-brand-500/40 active:scale-[0.98]">
      <span className="flex size-13 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-100"><Icon name={icon} className="size-7" /></span>
      <span className="mt-3 text-[0.95rem] font-semibold leading-snug text-navy-900">{label}</span>
    </Link>
  );
}

/** List row: icon, title, optional subtitle, chevron. */
export function OptionRow({ href, icon, title, subtitle }: { href: string; icon: IconName; title: string; subtitle?: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-xl px-2 py-3.5 transition hover:bg-navy-50">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon name={icon} /></span>
      <span className="min-w-0 flex-1"><span className="block font-semibold text-navy-900">{title}</span>{subtitle && <span className="block text-sm text-slate-500">{subtitle}</span>}</span>
      <Icon name="chevron" className="size-5 text-slate-400" />
    </Link>
  );
}

export function ProviderLogo({ provider, className }: { provider: RechargeProvider; className?: string }) {
  const v = PROVIDER_LOGO[provider];
  return (
    <span className={cn("relative block aspect-[1.7/1] overflow-hidden rounded-xl", v.bg, className)}>
      <Image src={v.src} alt="" fill sizes="(max-width: 640px) 45vw, 220px" className={v.fit === "cover" ? "object-cover" : "object-contain p-1"} />
    </span>
  );
}

export function ProviderTile({ provider }: { provider: RechargeProvider }) {
  return (
    <Link href={`/services/recharges/${provider}`} aria-label={RECHARGE_PROVIDERS[provider].label}
      className="flex flex-col gap-2.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md hover:ring-brand-500/40 active:scale-[0.98]">
      <ProviderLogo provider={provider} className="w-full" />
      <span className="text-center font-semibold text-navy-900">{RECHARGE_PROVIDERS[provider].label}</span>
    </Link>
  );
}
