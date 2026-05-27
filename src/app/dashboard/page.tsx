/**
 * Dashboard del alumno — Ruta protegida
 * Lee el nombre y email del usuario desde la sesión real de Google/NextAuth.
 * Los stats (cinturón, clases, pagos) son placeholders hasta conectar Cosmos DB.
 */

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import {
  Trophy,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/dashboard/SignOutButton";

export const metadata: Metadata = {
  title: "Mi Dashboard",
  description: "Portal del alumno — progreso, asistencia y pagos.",
};

// ─── Próximas clases reales RUNAJERABJJ ──────────────────────────────────────
const INSTRUCTOR = "Carlos A. Donado";
const proximasClases = [
  { dia: "Lunes",     hora: "7:30 PM", nombre: "BJJ Gi",               instructor: INSTRUCTOR },
  { dia: "Martes",    hora: "7:30 PM", nombre: "BJJ No-Gi",            instructor: INSTRUCTOR },
  { dia: "Miércoles", hora: "7:30 PM", nombre: "BJJ Gi",               instructor: INSTRUCTOR },
  { dia: "Jueves",    hora: "7:30 PM", nombre: "BJJ No-Gi",            instructor: INSTRUCTOR },
  { dia: "Viernes",   hora: "7:30 PM", nombre: "Open Mat — Gi/No-Gi",  instructor: INSTRUCTOR },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-red-400",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-gray-950 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  // Leer sesión real (el middleware ya garantiza que existe)
  const session = await auth();
  const nombre = session?.user?.name?.split(" ")[0] ?? "Alumno";
  const email  = session?.user?.email ?? "";
  const avatar = session?.user?.image;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Avatar de Google o emoji */}
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={nombre}
                className="w-16 h-16 rounded-full border border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-3xl">
                🥋
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                ¡Hola, {nombre}! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-1">{email}</p>
              {/* Cinturón — placeholder hasta tener Cosmos DB */}
              <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full bg-white text-black">
                Cinturón Blanco
              </span>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* ─── Aviso de datos placeholder ──────────────────────────────── */}
        <div className="mb-6 rounded-lg border border-blue-900/30 bg-blue-950/20 px-4 py-3">
          <p className="text-xs text-blue-400">
            <strong>🔧 En construcción:</strong> Tu nombre y foto vienen de Google.
            Las estadísticas (cinturón, clases, pagos) se conectarán a Cosmos DB próximamente.
          </p>
        </div>

        {/* ─── Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar}   label="Clases este mes" value="—"  sub="Próximamente"       color="text-blue-400"   />
          <StatCard icon={TrendingUp} label="Total de clases" value="—"  sub="Próximamente"       color="text-green-400"  />
          <StatCard icon={Trophy}     label="Próximo nivel"   value="—"  sub="Próximamente"       color="text-purple-400" />
          <StatCard icon={CreditCard} label="Próximo pago"    value="—"  sub="Membresía mensual"  color="text-yellow-400" />
        </div>

        {/* ─── Próximas clases ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/5 bg-gray-950 p-6">
          <h2 className="text-lg font-bold text-white mb-5">📅 Horario semanal</h2>
          <div className="space-y-3">
            {proximasClases.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/40 p-3"
              >
                <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.nombre}</p>
                  <p className="text-xs text-gray-500">{c.instructor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{c.hora}</p>
                  <p className="text-xs text-gray-500">{c.dia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
