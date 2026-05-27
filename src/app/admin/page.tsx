import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { Users, FileText, Calendar, ClipboardList } from "lucide-react";
import Link from "next/link";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Panel Admin — RUNAJERABJJ" };

export default async function AdminPage() {
  // Cargar datos en paralelo
  const [inscripciones, usuarios, clases] = await Promise.all([
    findAll(CONTAINERS.INSCRIPCIONES).catch(() => []),
    findAll(CONTAINERS.USUARIOS).catch(() => []),
    findAll(CONTAINERS.CLASES).catch(() => []),
  ]);

  const stats = [
    { label: "Inscripciones",  value: inscripciones.length, icon: FileText,  color: "text-blue-400",   href: "/admin/inscripciones" },
    { label: "Alumnos",        value: usuarios.length,      icon: Users,     color: "text-green-400",  href: "/admin/alumnos"       },
    { label: "Clases activas", value: clases.length,        icon: Calendar,  color: "text-red-400",    href: "/clases"              },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Panel de Administración</h1>
        <p className="text-gray-400 mt-1">RUNAJERABJJ — Vista general</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="rounded-xl border border-white/5 bg-gray-950 p-6 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-4xl font-bold text-white">{value}</p>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-lg font-bold text-white mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/asistencia" className="rounded-xl border border-white/5 bg-gray-950 p-5 hover:border-red-800/50 transition-all">
          <ClipboardList className="w-6 h-6 text-red-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">Registrar Asistencia</h3>
          <p className="text-sm text-gray-500">Marca qué alumnos asistieron hoy.</p>
        </Link>
        <Link href="/admin/alumnos" className="rounded-xl border border-white/5 bg-gray-950 p-5 hover:border-green-800/50 transition-all">
          <Users className="w-6 h-6 text-green-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">Alumnos</h3>
          <p className="text-sm text-gray-500">Editar cinturón, grados y pagos.</p>
        </Link>
        <Link href="/admin/inscripciones" className="rounded-xl border border-white/5 bg-gray-950 p-5 hover:border-blue-800/50 transition-all">
          <FileText className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">Inscripciones</h3>
          <p className="text-sm text-gray-500">Solicitudes de clase gratis.</p>
        </Link>
      </div>
    </div>
  );
}
