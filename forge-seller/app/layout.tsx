import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sartoria Seller · The Forge",
  description: "Manufacturer command center for AI-powered garment digital twins."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-saturn-900 text-slate-100">{children}</body>
    </html>
  );
}
