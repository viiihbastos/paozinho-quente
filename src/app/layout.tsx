import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paozinho Quente — Encontre pão quente perto de você",
  description: "Sistema de localização de paozinho quente com cronograma de fornadas, reservas e assinaturas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
