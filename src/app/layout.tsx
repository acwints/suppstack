import type { Metadata, Viewport } from "next";
import { inter } from "./fonts/inter";
import "./globals.css";
import { Layout } from "./components/Layout";
import { Providers } from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.suppstack.app"),
  title: "SuppStack AI - Supplement Marketplace",
  description: "Shop vitamins, minerals, herbs, protein, and everyday wellness supplements with verified merchant checkout.",
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
