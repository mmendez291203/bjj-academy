"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, FileText, LayoutDashboard, Home, ClipboardList, BookOpen, Images } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin",               label: "Resumen",  icon: LayoutDashboard },
  { href: "/admin/asistencia",    label: "Asist.",   icon: ClipboardList   },
  { href: "/admin/alumnos",       label: "Alumnos",  icon: Users           },
  { href: "/admin/inscripciones", label: "Inscrip.", icon: FileText        },
  { href: "/admin/blog",          label: "Blog",     icon: BookOpen        },
  { href: "/admin/galeria",       label: "Galería",  icon: Images          },
];

export default function AdminBottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-950 border-t border-white/10">
      {/* Scroll horizontal si no caben todos */}
      <div className="flex items-center overflow-x-auto scrollbar-none px-1 py-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 flex-1 min-w-[56px] py-2 px-1 rounded-lg transition-colors",
                active
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-400"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors",
                active ? "bg-red-600" : ""
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-[9px] leading-tight font-medium",
                active ? "text-white" : "text-gray-600"
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Ir al sitio */}
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 flex-1 min-w-[56px] py-2 px-1 rounded-lg text-gray-700 hover:text-gray-500 transition-colors"
        >
          <div className="p-1 rounded-lg">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-[9px] leading-tight font-medium">Sitio</span>
        </Link>
      </div>
    </nav>
  );
}
