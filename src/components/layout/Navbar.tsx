"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const LOGO_URL = "https://bjjacademymedia.blob.core.windows.net/media/1d9186b8-0994-4897-a394-319deeecf77d.png";

const navLinks = [
  { href: "/",              label: "Inicio"     },
  { href: "/clases",        label: "Clases"     },
  { href: "/inscripciones", label: "Inscríbete" },
  { href: "/blog",          label: "Blog"       },
];

export default function Navbar() {
  const pathname        = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const tieneSesion = status === "authenticated";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const esAdmin     = (session as any)?.user?.rol === "admin";

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ─── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <Image
            src={LOGO_URL}
            alt={process.env.NEXT_PUBLIC_ACADEMY_NAME ?? "RUNAJERABJJ"}
            width={40}
            height={40}
            className="rounded-md object-contain"
          />
          <span>{process.env.NEXT_PUBLIC_ACADEMY_NAME ?? "RUNAJERABJJ"}</span>
        </Link>

        {/* ─── Links desktop ────────────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href ? "text-red-400" : "text-gray-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ─── CTA + Sesión ─────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {tieneSesion ? (
            <>
              {/* Botón Admin — solo visible si rol=admin */}
              {esAdmin && (
                <Link href="/admin" className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-900/50 px-2.5 py-1 rounded-md transition-colors">
                  ⚙️ Admin
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <span className="text-lg">🥋</span>
                )}
                {session?.user?.name?.split(" ")[0] ?? "Mi Portal"}
              </Link>
              <a href="/api/signout" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5">
                Salir
              </a>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Iniciar Sesión</Button>
              </Link>
              <Link href="/inscripciones">
                <Button size="sm">Clase Gratis →</Button>
              </Link>
            </>
          )}
        </div>

        {/* ─── Menú mobile ──────────────────────────────────────────────── */}
        <button
          className="md:hidden text-gray-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* ─── Drawer mobile ──────────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden bg-black border-t border-white/5 px-4 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block text-base font-medium transition-colors",
                pathname === link.href ? "text-red-400" : "text-gray-300"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3 border-t border-white/10">
            {tieneSesion ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Mi Portal</Button>
                </Link>
                <a href="/api/signout" className="w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors">
                  Cerrar Sesión
                </a>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                </Link>
                <Link href="/inscripciones" onClick={() => setOpen(false)}>
                  <Button className="w-full">Clase Gratis →</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
