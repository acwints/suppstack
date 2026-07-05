import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "./components/Layout";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SuppStack - Supplement Marketplace",
  description: "Shop vitamins, minerals, herbs, protein, and everyday wellness supplements with verified merchant checkout.",
  appleWebApp: {
    capable: true,
    title: "SuppStack",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets content extend into the iPhone notch/home-indicator regions inside
  // the native shell and installed web app; safe-area padding is applied in
  // globals.css.
  viewportFit: "cover",
  themeColor: "#ffffff",
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
