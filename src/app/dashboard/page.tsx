/**
 * Dashboard del alumno — datos reales desde Cosmos DB
 * Muestra cinturón, grados, clases completadas y próximo pago
 * del usuario autenticado. El middleware garantiza que hay sesión.
 */

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { colorCinturon, capitalizar, formatFecha } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, CreditCard, TrendingUp, Clock } from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";

export const metadata: Metadata = {
  title: "Mi Dashboard",
  description: "Portal del alumno — progreso, asistencia y pagos.",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
type UsuarioDB = {
  id: string;
  email: string;
  nombre?: string;
  cinturon?: string;
  grados?: number;
  clasesCompletadas?: number;
  clasesEsteMes?: number;
  proximoPago?: string | null;
  fechaInicio?: string;
  activo?: boolean;
};

// ─── Lógica de cinturones ─────────────────────────────────────────────────────
const BELT_ORDER   = ["blanco", "azul", "morado", "cafe", "negro"] as const;
const BELT_DISPLAY: Record<string, string> = {
  blanco: "Blanco", azul: "Azul", morado: "Morado", cafe: "Café", negro: "Negro",
};
// Clases mínimas aproximadas para cada cinturón (referencia BJJ)
const CLASES_PARA_NEXT: Record<string, number> = {
  blanco: 150, azul: 300, morado: 300, cafe: 300, negro: 0,
};

function getProgresoNivel(cinturon: string, clases: number) {
  const idx = BELT_ORDER.indexOf(cinturon as typeof BELT_ORDER[number]);
  if (idx === -1 || idx >= BELT_ORDER.length - 1) {
    return { siguiente: "Cinturón Negro ✔", porcentaje: 100, clasesRestantes: 0 };
  }
  const siguiente  = BELT_DISPLAY[BELT_ORDER[idx + 1]];
  const necesarias = CLASES_PARA_NEXT[cinturon] ?? 200;
  const porcentaje = Math.min(100, Math.round((clases / necesarias) * 100));
  const restantes  = Math.max(0, necesarias - clases);
  return { siguiente, porcentaje, clasesRestantes: restantes };
}

// ─── Horario semanal RUNAJERABJJ ─────────────────────────────────────────────
const INSTRUCTOR = "Carlos A. Donado";
const HORARIO = [
  { dia: "Lunes",     hora: "7:30 PM", nombre: "BJJ Gi",              instructor: INSTRUCTOR },
  { dia: "Martes",    hora: "7:30 PM", nombre: "BJJ No-Gi",           instructor: INSTRUCTOR },
  { dia: "Miércoles", hora: "7:30 PM", nombre: "BJJ Gi",              instructor: INSTRUCTOR },
  { dia: "Jueves",    hora: "7:30 PM", nombre: "BJJ No-Gi",           instructor: INSTRUCTOR },
  { dia: "Viernes",   hora: "7:30 PM", nombre: "Open Mat — Gi/No-Gi", instructor: INSTRUCTOR },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color = "text-red-400",
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
  const session = await auth();
  const email   = session?.user?.email ?? "";
  const nombre  = session?.user?.name?.split(" ")[0] ?? "Alumno";
  const avatar  = session?.user?.image;

  // Buscar datos del usuario en Cosmos DB
  let usuario: UsuarioDB | null = null;
  try {
    const todos = await findAll<UsuarioDB>(CONTAINERS.USUARIOS);
    usuario = todos.find((u) => u.email === email) ?? null;
  } catch {
    // Si falla, el dashboard muestra los datos de la sesión sin stats
  }

  const cinturon          = usuario?.cinturon          ?? "blanco";
  const grados            = usuario?.grados            ?? 0;
  const clasesCompletadas = usuario?.clasesCompletadas ?? 0;
  const clasesEsteMes     = usuario?.clasesEsteMes     ?? 0;
  const proximoPago       = usuario?.proximoPago       ?? null;

  const progreso = getProgresoNivel(cinturon, clasesCompletadas);

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={nombre}
                className="w-16 h-16 rounded-full border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                🥋
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-white">
                ¡Hola, {nombre}! 👋
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{email}</p>

              {/* Cinturón + grados */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  colorCinturon(cinturon)
                )}>
                  {capitalizar(cinturon)}
                </span>
                {/* Grados (rayas del cinturón) */}
                <span className="text-yellow-400 tracking-widest text-sm font-mono" title={`${grados} grado${grados !== 1 ? "s" : ""}`}>
                  {"●".repeat(grados)}{"○".repeat(4 - grados)}
                </span>
                <span className="text-xs text-gray-600">
                  {grados} de 4 grados
                </span>
              </div>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* ─── Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Calendar}
            label="Clases este mes"
            value={clasesEsteMes}
            sub="RUNAJERABJJ"
            color="text-blue-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total de clases"
            value={clasesCompletadas}
            sub={usuario?.fechaInicio ? `Desde ${new Date(usuario.fechaInicio).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}` : "Historial total"}
            color="text-green-400"
          />
          <StatCard
            icon={Trophy}
            label="Próximo nivel"
            value={progreso.siguiente}
            sub={progreso.clasesRestantes > 0
              ? `~${progreso.clasesRestantes} clases más (referencia)`
              : "¡Nivel alcanzado!"}
            color="text-purple-400"
          />
          <StatCard
            icon={CreditCard}
            label="Próximo pago"
            value={proximoPago ? formatFecha(proximoPago) : "—"}
            sub="Membresía mensual"
            color="text-yellow-400"
          />
        </div>

        {/* ─── Barra de progreso hacia siguiente cinturón ──────────────── */}
        {progreso.porcentaje < 100 && (
          <div className="rounded-xl border border-white/5 bg-gray-950 p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">
                Progreso hacia cinturón {progreso.siguiente}
              </span>
              <span className="text-sm font-bold text-white">{progreso.porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all"
                style={{ width: `${progreso.porcentaje}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Basado en ~{CLASES_PARA_NEXT[cinturon]} clases de referencia para alcanzar el siguiente cinturón.
              El instructor decide la promoción.
            </p>
          </div>
        )}

        {/* ─── Horario semanal ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/5 bg-gray-950 p-6">
          <h2 className="text-lg font-bold text-white mb-5">📅 Horario semanal</h2>
          <div className="space-y-3">
            {HORARIO.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/40 p-3"
              >
                <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.nombre}</p>
                  <p className="text-xs text-gray-500">{c.instructor}</p>
                </div>
                <div className="text-right shrink-0">
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
