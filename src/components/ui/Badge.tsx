import { cn } from "@/lib/cn";

const tone = {
  neutral: "bg-slate-100 text-slate-700", success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800", brand: "bg-brand-100 text-brand-700",
} as const;

export function Badge({ tone: t = "neutral", children }: { tone?: keyof typeof tone; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tone[t])}>{children}</span>;
}
