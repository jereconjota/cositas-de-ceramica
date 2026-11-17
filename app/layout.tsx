import type { Metadata, Viewport } from "next";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import { NOMBRE_TIA, NOMBRE_TIENDA } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: NOMBRE_TIENDA, template: `%s · ${NOMBRE_TIENDA}` },
  description: `Piezas de cerámica hechas a mano por ${NOMBRE_TIA}.`,
  openGraph: {
    title: NOMBRE_TIENDA,
    description: `Piezas de cerámica hechas a mano por ${NOMBRE_TIA}.`,
    locale: "es_AR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff6e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
