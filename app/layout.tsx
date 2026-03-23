import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verificacion de Certificados",
  description: "Sistema publico para validar certificados mediante codigo QR."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
