import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default:  "Academia BJJ — Jiu-Jitsu Brasileño",
    template: "%s | Academia BJJ",
  },
  description:
    "La academia de Jiu-Jitsu Brasileño más completa. Clases de Gi, No-Gi, Wrestling y Kids. Primera clase gratis.",
  keywords: ["BJJ", "Jiu-Jitsu", "Brasileño", "MMA", "academia", "clases", "grappling"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Academia BJJ",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
