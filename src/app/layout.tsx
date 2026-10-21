import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "@/styles/globals.css";

const editorial = localFont({
  src: [
    { path: "../fonts/cormorant-regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-editorial",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../fonts/inter-regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/inter-medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/inter-semibold.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mendara Medical House",
  description: "Mendara Medical House abre en La Sabana un espacio diseñado para especialistas que desean hacer crecer su consulta privada en un entorno de alto nivel.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${editorial.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
