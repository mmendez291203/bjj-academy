/**
 * Dashboard del alumno — Ruta protegida
 *
 * En producción, usa el middleware de Next.js para redirigir si no hay sesión.
 * Por ahora mostramos datos de demo.
 */

import type { Metadata } from "next";
import {
  Trophy,
  Calendar,
  CreditCard,
  TrendingUp,
  Clock,
} from "lucide-react";
import { colorCinturon, capitalizar, formatFecha } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mi Dashboard",
  description: "Portal del alumno — progreso, asistencia y pagos.",
};

// ─── Datos demo del alumno ────────────────────────────────────────────────────
const alumnoDemo = {
  nombre:       "Mario",
  apellido:     "Méndez",
  cinturon:     "azul" as const,
  galones:      2,
  fechaInicio:  "2023-03-15",
  clasesEsteMes: 12,
  totalClases:  87,
  proximoPago:  "2026-06-01",
  membresia:    "mensual" as const,
};

// ─── Próximas clases demo ─────────────────────────────────────────────────────
const proximasClases = [
  { dia: "Hoy",     hora: "19:00", nombre: "BJJ Avanzado",    instructor: "Prof. Carlos" },
  { dia: "Mañana",  hora: "07:00", nombre: "BJJ Fundamentals", instructor: "Prof. Carlos" },
  { dia: "Miércoles", hora: "20:30", nombre: "No-Gi Grappling", instructor: "Coach Ana"  },
];

// ─── Stats cards ─────────────────────────────────────────────────────────────
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
export default function DashboardPage() {
  const { nombre, cinturon, galones, fechaInicio, clasesEsteMes, totalClases } = alumnoDemo;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-10">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-3xl">
            🥋
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              ¡Hola, {nombre}! 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  colorCinturon(cinturon)
                )}
              >
                Cinturón {capitalizar(cinturon)}
                {galones > 0 && ` · ${galones} galón${galones > 1 ? "es" : ""}`}
              </span>
              <span className="text-xs text-gray-500">
                Desde {formatFecha(fechaInicio)}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            label="Clases este mes"
            value={clasesEsteMes}
            sub="Meta: 16 clases"
            color="text-blue-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total de clases"
            value={totalClases}
            sub="Histórico"
            color="text-green-400"
          />
          <StatCard
            icon={Trophy}
            label="Próximo nivel"
            value="Morado"
            sub="~300 clases estimado"
            color="text-purple-400"
          />
          <StatCard
            icon={CreditCard}
            label="Próximo pago"
            value={formatFecha(alumnoDemo.proximoPago)}
            sub="Membresía mensual"
            color="text-yellow-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Progreso de cinturón ───────────────────────────────── */}
          <div className="lg:col-span-2 rounded-xl border border-white/5 bg-gray-950 p-6">
            <h2 className="text-lg font-bold text-white mb-5">
              🎯 Progreso hacia cinturón morado
            </h2>

            {/* Barra de progreso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Clases completadas: {totalClases}</span>
                <span>Meta estimada: ~300</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all"
                  style={{ width: `${Math.min((totalClases / 300) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((totalClases / 300) * 100)}% completado
              </p>
            </div>

            {/* Línea de cinturones */}
            <div className="flex items-center justify-between">
              {[
                { nivel: "Blanco",  color: "bg-white",     completado: true  },
                { nivel: "Azul",    color: "bg-blue-600",  completado: true  },
                { nivel: "Morado",  color: "bg-purple-600",completado: false },
                { nivel: "Café",    color: "bg-amber-800", completado: false },
                { nivel: "Negro",   color: "bg-gray-900 border border-white/20", completado: false },
              ].map((c, i, arr) => (
                <div key={c.nivel} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full transition-all",
                      c.color,
                      c.completado ? "ring-2 ring-white/30 scale-110" : "opacity-40"
                    )}
                  />
                  <span className="text-xs text-gray-500">{c.nivel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Próximas clases ────────────────────────────────────── */}
          <div className="rounded-xl border border-white/5 bg-gray-950 p-6">
            <h2 className="text-lg font-bold text-white mb-5">
              📅 Próximas clases
            </h2>
            <div className="space-y-3">
              {proximasClases.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/40 p-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{c.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {c.dia} · {c.hora} · {c.instructor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Nota de producción ─────────────────────────────────────────── */}
        <div className="mt-8 rounded-lg border border-yellow-900/30 bg-yellow-950/20 px-4 py-3">
          <p className="text-xs text-yellow-400">
            <strong>💡 Nota de desarrollo:</strong> Esta página muestra datos de demostración.
            En producción, los datos vendrán de Azure Cosmos DB usando la sesión del alumno autenticado.
          </p>
        </div>
      </div>
    </div>
  );
}
