import Image from "next/image";
import { cn } from "@/lib/cn";

/** BFA mark, a thin divider and "NET" — the product wordmark. Sized by `height` (px of the logo). */
export function BrandLockup({ height = 44, className }: { height?: number; className?: string }) {
  const width = Math.round((height * 371) / 144);
  return (
    <div className={cn("flex items-center gap-3", className)} role="img" aria-label="BFA NET">
      <Image src="/logo-mark.png" alt="" width={width} height={height} priority style={{ height, width: "auto" }} />
      <span aria-hidden className="w-px bg-navy-800/40" style={{ height: height * 0.85 }} />
      <span aria-hidden className="font-bold tracking-[0.18em] text-brand-600" style={{ fontSize: height * 0.62, lineHeight: 1 }}>NET</span>
    </div>
  );
}
