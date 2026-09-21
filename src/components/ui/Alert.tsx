import { cn } from "@/lib/cn";

const tone = {
  error: "bg-red-50 text-red-800 ring-red-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  info: "bg-navy-50 text-navy-800 ring-navy-700/15",
  warning: "bg-amber-50 text-amber-900 ring-amber-200",
} as const;

export function Alert({ kind = "info", children, className }: { kind?: keyof typeof tone; children: React.ReactNode; className?: string }) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cn("rounded-xl px-4 py-3 text-sm ring-1", tone[kind], className)}>
      {children}
    </div>
  );
}
