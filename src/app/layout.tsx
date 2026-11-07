import type { Metadata, Viewport } from "next";
import { MarcoApp } from "@/components/marco-app";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Reciclamos · ¿Cuándo saco el reciclaje?",
    template: "%s · Reciclamos",
  },
  description:
    "Prototipo académico de una función para la Bogotá SuperApp: con tu dirección te dice qué día y a qué hora sacar la bolsa blanca para que llegue a un reciclador. Datos ficticios.",
  applicationName: "Reciclamos (prototipo)",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#E3272A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className="antialiased">
      <body className="font-sans">
        <MarcoApp>{children}</MarcoApp>
      </body>
    </html>
  );
}
