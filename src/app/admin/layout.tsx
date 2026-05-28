import Link from "next/link";
import { Users, FileText, LayoutDashboard, Home, ClipboardList, BookOpen, Images, CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import AdminBottomNav from "@/components/admin/AdminBottomNav";

const ADMIN_LINKS = [
  { href: "/admin",               label: "Resumen",       icon: LayoutDashboard },
  { href: "/admin/asistencia",    label: "Asistencia",    icon: ClipboardList   },
  { href: "/admin/alumnos",       label: "Alumnos",       icon: Users           },
  { href: "/admin/inscripciones", label: "Inscripciones", icon: FileText        },
  { href: "/admin/clases",        label: "Clases",        icon: CalendarDays    },
  { href: "/admin/blog",          label: "Blog",          icon: BookOpen        },
  { href: "/admin/galeria",       label: "Galería",       icon: Images          },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await auth() as any;
  const rol: string = session?.user?.rol ?? "admin";
  const esInstructor = rol === "instructor";

  return (
    <div className="min-h-screen bg-black pt-16 flex flex-col md:flex-row">

      {/* ─── Sidebar (desktop) ──────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-white/5 bg-gray-950 pt-8 px-4 hidden md:block">
        <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest mb-4 px-2">
          {esInstructor ? "Panel Instructor" : "Panel Admin"}
        </p>
        <nav className="space-y-1">
          {ADMIN_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 pt-6 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-400 transition-colors">
            <Home className="w-4 h-4" />
            Ir al sitio
          </Link>
        </div>
      </aside>

      {/* ─── Contenido ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* ─── Bottom nav (móvil) ─────────────────────────────────────────── */}
      <AdminBottomNav />

    </div>
  );
}
