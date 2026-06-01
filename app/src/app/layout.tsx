import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sealed — Trustless Sealed-Bid Auctions",
  description: "Encrypted bids. On-chain settlement. No trusted middleman. Powered by Story CDR.",
  openGraph: {
    title: "Sealed",
    description: "The first trustless sealed-bid auction platform on Story.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ position: "relative", zIndex: 1, background: "#08080E", color: "#F0EEF8" }}>
        <Providers>
          <Navbar />
          <main style={{ minHeight: "100vh" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}