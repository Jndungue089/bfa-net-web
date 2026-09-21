// Server-side only: fetches the bank's public "Quem somos" page and keeps TEXT only.
// Nothing from the remote HTML is ever rendered as markup, so it cannot inject script or styles into the app.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5080";
const ALLOWED_PREFIX = "https://www.bfa.ao/";

export interface AboutContent { title: string; subtitle: string | null; values: string[]; sections: Array<{ heading: string; body: string }>; url: string }

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
  if (e[0] === "#") { const n = e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) && n > 31 && n < 0x110000 ? String.fromCodePoint(n) : ""; }
  return ENTITIES[e.toLowerCase()] ?? m;
});
const text = (html: string) => decode(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, " ")).replace(/[ \t\r\f\v]+/g, " ").replace(/ ?\n ?/g, "\n").trim();
const first = (html: string, re: RegExp) => { const m = re.exec(html); return m?.[1] ? text(m[1]) : null; };

export async function getAbout(): Promise<AboutContent | null> {
  try {
    const info = await fetch(`${BACKEND_URL}/api/v1/public/about`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) }).then((r) => (r.ok ? r.json() : null)) as { title: string; url: string } | null;
    if (!info || typeof info.url !== "string" || !info.url.startsWith(ALLOWED_PREFIX)) return null; // never fetch anything off-site
    const res = await fetch(info.url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000), headers: { "user-agent": "BFANET-Reference/1.0" } });
    if (!res.ok) return null;
    const html = (await res.text()).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").slice(0, 400_000);

    const values = [...html.matchAll(/<h2 class="title">([\s\S]*?)<\/h2>/gi)].map((m) => text(m[1] ?? "")).filter(Boolean).slice(0, 6);
    const sections = [...html.matchAll(/<p><strong[^>]*>([\s\S]*?)<\/strong>\s*<br\s*\/?>([\s\S]*?)<\/p>/gi)]
      .map((m) => ({ heading: text(m[1] ?? "").slice(0, 120), body: text(m[2] ?? "").slice(0, 1500) }))
      .filter((s) => s.heading && s.body).slice(0, 12);
    if (!sections.length) return null;
    return { title: first(html, /<h1 class="page-title">([\s\S]*?)<\/h1>/i) ?? info.title, subtitle: first(html, /<h2 class="page-subtitle">([\s\S]*?)<\/h2>/i), values, sections, url: info.url };
  } catch { return null; }
}
