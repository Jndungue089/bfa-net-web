import { passwordStrength } from "@bfa/shared";
import { cn } from "@/lib/cn";

const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];
const colors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"];

export function PasswordStrength({ value }: { value: string }) {
  const s = passwordStrength(value);
  if (!value) return null;
  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full", i <= s ? colors[s] : "bg-slate-200")} />)}</div>
      <span className="w-16 text-right text-xs text-slate-500">{labels[s]}</span>
    </div>
  );
}
