import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { MarcoApp } from "@/components/marco-app";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

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
  themeColor: "#1c5c3c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CO" className={`${publicSans.variable} antialiased`}>
      <body className="font-sans">
        <MarcoApp>{children}</MarcoApp>
      </body>
    </html>
  );
}
