import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthSessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

const LOGO = "https://bjjacademymedia.blob.core.windows.net/media/e6ab8535-3299-4ed8-b259-c73b4b4c4e31.png";

export const metadata: Metadata = {
  title: {
    default:  "RUNAJERABJJ — Jiu-Jitsu Brasileño",
    template: "%s | RUNAJERABJJ",
  },
  description:
    "La academia de Jiu-Jitsu Brasileño más completa. Clases de Gi, No-Gi, Wrestling y Kids. Primera clase gratis.",
  keywords: ["BJJ", "Jiu-Jitsu", "Brasileño", "MMA", "academia", "clases", "grappling"],
  icons: {
    icon: LOGO,
    shortcut: LOGO,
    apple: LOGO,
  },
  openGraph: {
    type:      "website",
    locale:    "es_MX",
    siteName:  "RUNAJERABJJ",
    images: [{ url: LOGO, width: 512, height: 512, alt: "RUNAJERABJJ Logo" }],
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
        <AuthSessionProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
