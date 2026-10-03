import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sondage Franchisés — Bellepro's | Franchisee Survey",
  description:
    "Boucle de rétroaction officielle du Groupe LBP / Bellepro's : votre taux de satisfaction et des pistes pour votre restaurant. Official feedback loop for Bellepro's franchisees.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
