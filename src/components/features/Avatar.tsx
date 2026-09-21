"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";

/** Profile picture (same-origin, cookie-authenticated) with an initials fallback when there is none or it fails to load. */
export function Avatar({ name, version, size = 96, className }: { name: string; version: number | null | undefined; size?: number; className?: string }) {
  const [failed, setFailed] = useState<number | null | undefined>(undefined);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
  const show = version != null && failed !== version;
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy-800 font-bold text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }} role="img" aria-label={`Fotografia de ${name}`}>
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element -- authenticated API image, not optimisable by next/image
        <img src={`/api/v1/me/avatar?v=${version}`} alt="" width={size} height={size} className="size-full object-cover" onError={() => setFailed(version)} referrerPolicy="no-referrer" />
      ) : initials || "?"}
    </span>
  );
}
