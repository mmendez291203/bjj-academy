/**
 * Dashboard del alumno — datos reales desde Cosmos DB
 * Muestra cinturón, grados, clases completadas y próximo pago
 * del usuario autenticado. El middleware garantiza que hay sesión.
 */

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { findAll, findByQuery, CONTAINERS } from "@/lib/azure/cosmos";
import { colorCinturon, capitalizar, formatFecha } from "@/lib/utils";
import { clasesMock } from "@/lib/data/clases-mock";
import type { Clase } from "@/types";
import { redirect } from "next/navigation";
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
const BELT_ORDER = [
  "blanco",
  "gris-blanco", "gris", "gris-negro",
  "amarillo-blanco", "amarillo", "amarillo-negro",
  "naranja-blanco", "naranja", "naranja-negro",
  "verde-blanco", "verde", "verde-negro",
  "azul", "morado", "cafe", "negro",
] as const;

const BELT_DISPLAY: Record<string, string> = {
  blanco:            "Blanco",
  "gris-blanco":     "Gris / Blanco",
  gris:              "Gris",
  "gris-negro":      "Gris / Negro",
  "amarillo-blanco": "Amarillo / Blanco",
  amarillo:          "Amarillo",
  "amarillo-negro":  "Amarillo / Negro",
  "naranja-blanco":  "Naranja / Blanco",
  naranja:           "Naranja",
  "naranja-negro":   "Naranja / Negro",
  "verde-blanco":    "Verde / Blanco",
  verde:             "Verde",
  "verde-negro":     "Verde / Negro",
  azul:              "Azul",
  morado:            "Morado",
  cafe:              "Café",
  negro:             "Negro",
};

const CLASES_PARA_NEXT: Record<string, number> = {
  blanco:            40,
  "gris-blanco":     40,  gris: 40,  "gris-negro": 40,
  "amarillo-blanco": 40,  amarillo: 40,  "amarillo-negro": 40,
  "naranja-blanco":  40,  naranja: 40,   "naranja-negro": 40,
  "verde-blanco":    40,  verde: 40,     "verde-negro": 40,
  azul: 300, morado: 300, cafe: 300, negro: 0,
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

const DIAS_ORDEN = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

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

  // Buscar datos del usuario en Cosmos DB (verificación en tiempo real)
  let usuario: UsuarioDB | null = null;
  try {
    const todos = await findAll<UsuarioDB>(CONTAINERS.USUARIOS);
    usuario = todos.find((u) => u.email === email) ?? null;
  } catch {
    // Si falla la conexión a DB, se muestran los datos de la sesión sin stats
  }

  // Bloqueo en tiempo real: si está inactivo en la DB, forzar logout
  if (usuario && usuario.activo === false) {
    redirect("/login?error=inactivo");
  }

  const cinturon          = usuario?.cinturon  ?? "blanco";
  const grados            = usuario?.grados    ?? 0;
  const proximoPago       = usuario?.proximoPago ?? null;

  // Clases completadas totales (campo del usuario, admin lo mantiene al registrar asistencia)
  const clasesCompletadas = usuario?.clasesCompletadas ?? 0;

  // Cargar horario desde Cosmos DB con fallback a mock
  let horario: Clase[] = [];
  try {
    const clasesDB = await findAll<Clase>(CONTAINERS.CLASES);
    horario = (clasesDB.length > 0 ? clasesDB : clasesMock)
      .filter((c) => c.activa !== false)
      .sort((a, b) => DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia));
  } catch {
    horario = clasesMock.sort((a, b) => DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia));
  }

  // Clases este mes: calculadas desde la tabla de asistencia (siempre precisas)
  const ahora     = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  let clasesEsteMes = 0;
  try {
    const asistenciaMes = await findByQuery<{ id: string }>(
      CONTAINERS.ASISTENCIA,
      "SELECT c.id FROM c WHERE c.alumnoEmail = @email AND STARTSWITH(c.fecha, @mes)",
      [
        { name: "@email", value: email },
        { name: "@mes",   value: mesActual },
      ]
    );
    clasesEsteMes = asistenciaMes.length;
  } catch {
    // Si falla, muestra 0
  }

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
            {horario.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/40 p-3"
              >
                <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.nombre}</p>
                  <p className="text-xs text-gray-500">{c.instructor ?? "RUNAJERABJJ"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{c.horaInicio}</p>
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
