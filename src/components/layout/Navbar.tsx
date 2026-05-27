"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LOGO_URL = "https://bjjacademymedia.blob.core.windows.net/media/1d9186b8-0994-4897-a394-319deeecf77d.png";

const navLinks = [
  { href: "/",              label: "Inicio"        },
  { href: "/clases",        label: "Clases"        },
  { href: "/inscripciones", label: "Inscríbete"    },
  { href: "/blog",          label: "Blog"          },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen]   = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ─── Logo ─────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <Image
            src={LOGO_URL}
            alt={process.env.NEXT_PUBLIC_ACADEMY_NAME ?? "Academia BJJ"}
            width={40}
            height={40}
            className="rounded-md object-contain"
          />
          <span>
            {process.env.NEXT_PUBLIC_ACADEMY_NAME ?? "Academia BJJ"}
          </span>
        </Link>

        {/* ─── Links desktop ────────────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-red-400"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ─── CTA + Portal ─────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Portal Alumno
            </Button>
          </Link>
          <Link href="/inscripciones">
            <Button size="sm">
              Clase Gratis →
            </Button>
          </Link>
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
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full">Portal Alumno</Button>
            </Link>
            <Link href="/inscripciones" onClick={() => setOpen(false)}>
              <Button className="w-full">Clase Gratis →</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
