import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: { default: "BFA NET", template: "%s · BFA NET" },
  description: "Internet banking do BFA — consulte contas, transfira e pague com segurança.",
  robots: { index: false, follow: false },
  icons: { icon: "/logo.png" },
};
export const viewport: Viewport = { themeColor: "#0d1b5e", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading request headers opts the tree into dynamic rendering, which the per-request CSP nonce requires.
  await headers();
  return (
    <html lang="pt-AO">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
