export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { findAll, findByQuery, CONTAINERS } from "@/lib/azure/cosmos";
import { colorCinturon, capitalizar, formatFecha } from "@/lib/utils";
import { clasesMock } from "@/lib/data/clases-mock";
import type { Clase, PerfilHijo } from "@/types";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, CreditCard, TrendingUp, Clock } from "lucide-react";
import SignOutButton from "@/components/dashboard/SignOutButton";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Mi Dashboard",
  description: "Portal del alumno — progreso, asistencia y pagos.",
};

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

const BELT_ORDER = [
  "blanco",
  "gris-blanco", "gris", "gris-negro",
  "amarillo-blanco", "amarillo", "amarillo-negro",
  "naranja-blanco", "naranja", "naranja-negro",
  "verde-blanco", "verde", "verde-negro",
  "azul", "morado", "cafe", "negro",
] as const;

const BELT_DISPLAY: Record<string, string> = {
  blanco: "Blanco",
  "gris-blanco": "Gris/Blanco", gris: "Gris", "gris-negro": "Gris/Negro",
  "amarillo-blanco": "Amarillo/Blanco", amarillo: "Amarillo", "amarillo-negro": "Amarillo/Negro",
  "naranja-blanco": "Naranja/Blanco", naranja: "Naranja", "naranja-negro": "Naranja/Negro",
  "verde-blanco": "Verde/Blanco", verde: "Verde", "verde-negro": "Verde/Negro",
  azul: "Azul", morado: "Morado", cafe: "Café", negro: "Negro",
};

const CLASES_PARA_NEXT: Record<string, number> = {
  blanco: 40,
  "gris-blanco": 40, gris: 40, "gris-negro": 40,
  "amarillo-blanco": 40, amarillo: 40, "amarillo-negro": 40,
  "naranja-blanco": 40, naranja: 40, "naranja-negro": 40,
  "verde-blanco": 40, verde: 40, "verde-negro": 40,
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

const DIAS_ORDEN = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

function StatCard({ icon: Icon, label, value, sub, color = "text-red-400" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
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

type Graduacion = { fecha: string; cinturonAnterior: string; gradosAnterior: number; cinturonNuevo: string; gradosNuevo: number };

function proximoPagoActivo(fechaGuardada: string | null | undefined): string | null {
  if (!fechaGuardada) return null;
  const base = new Date(fechaGuardada);
  if (isNaN(base.getTime())) return null;
  const dia = base.getUTCDate();
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);
  let candidato = new Date(base);
  candidato.setUTCHours(0, 0, 0, 0);
  while (candidato <= hoy) {
    candidato.setUTCMonth(candidato.getUTCMonth() + 1);
    // Ajustar si el mes no tiene el día (ej: 31 en febrero)
    const mesTarget = candidato.getUTCMonth();
    candidato.setUTCDate(dia);
    if (candidato.getUTCMonth() !== mesTarget) {
      // El día no existe en ese mes, usar el último día del mes
      candidato.setUTCDate(0);
    }
  }
  return candidato.toISOString();
}

type DashboardUIProps = {
  nombre: string;
  email: string;
  avatar?: string | null;
  cinturon: string;
  grados: number;
  clasesCompletadas: number;
  clasesEsteMes: number;
  proximoPago: string | null;
  progreso: ReturnType<typeof getProgresoNivel>;
  horario: Clase[];
  fechaInicio?: string;
  perfiles?: PerfilHijo[];
  perfilActual?: PerfilHijo;
  registrosAnio?: { fecha: string }[];
  graduaciones?: Graduacion[];
  anio?: number;
};

function DashboardUI({
  nombre, email, avatar, cinturon, grados,
  clasesCompletadas, clasesEsteMes, proximoPago,
  progreso, horario, fechaInicio, perfiles, perfilActual,
  registrosAnio, graduaciones, anio,
}: DashboardUIProps) {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Selector de perfil (padres con múltiples hijos) ─────────── */}
        {perfiles && perfiles.length > 1 && perfilActual && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Viendo a:</span>
            {perfiles.map((p) => (
              <a
                key={p.id}
                href={`/api/dashboard/select-perfil?id=${p.id}`}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border",
                  p.id === perfilActual.id
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                )}
              >
                {p.nombre}
              </a>
            ))}
          </div>
        )}

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <div className="flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={nombre} className="w-16 h-16 rounded-full border border-white/10 shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                🥋
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">¡Hola, {nombre}! 👋</h1>
              <p className="text-sm text-gray-500 mt-0.5">{email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorCinturon(cinturon))}>
                  {capitalizar(cinturon)}
                </span>
                <span className="text-yellow-400 tracking-widest text-sm font-mono">
                  {"●".repeat(grados)}{"○".repeat(4 - grados)}
                </span>
                <span className="text-xs text-gray-600">{grados} de 4 grados</span>
              </div>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* ─── Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Clases este mes" value={clasesEsteMes} sub="RUNAJERABJJ" color="text-blue-400" />
          <StatCard
            icon={TrendingUp} label="Total de clases" value={clasesCompletadas}
            sub={fechaInicio ? `Desde ${new Date(fechaInicio).toLocaleDateString("es-MX", { month: "long", year: "numeric" })}` : "Historial total"}
            color="text-green-400"
          />
          <StatCard
            icon={Trophy} label="Próximo nivel" value={progreso.siguiente}
            sub={progreso.clasesRestantes > 0 ? `~${progreso.clasesRestantes} clases más (referencia)` : "¡Nivel alcanzado!"}
            color="text-purple-400"
          />
          <StatCard
            icon={CreditCard} label="Próximo pago"
            value={proximoPago ? formatFecha(proximoPago) : "—"}
            sub="Membresía mensual" color="text-yellow-400"
          />
        </div>

        {/* ─── Barra de progreso ───────────────────────────────────────── */}
        {progreso.porcentaje < 100 && (
          <div className="rounded-xl border border-white/5 bg-gray-950 p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Progreso hacia cinturón {progreso.siguiente}</span>
              <span className="text-sm font-bold text-white">{progreso.porcentaje}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all" style={{ width: `${progreso.porcentaje}%` }} />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Basado en ~{CLASES_PARA_NEXT[cinturon]} clases de referencia. El instructor decide la promoción.
            </p>
          </div>
        )}

        {/* ─── Cartón de frecuencia anual ─────────────────────────────── */}
        {registrosAnio && (
          <div className="mb-8">
            <AttendanceCalendar
              registros={registrosAnio}
              graduaciones={graduaciones ?? []}
              anio={anio ?? new Date().getFullYear()}
            />
          </div>
        )}

        {/* ─── Horario semanal ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-white/5 bg-gray-950 p-6">
          <h2 className="text-lg font-bold text-white mb-5">📅 Horario semanal</h2>
          <div className="space-y-3">
            {horario.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/40 p-3">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  const email   = session?.user?.email ?? "";
  const rol     = (session?.user as any)?.rol ?? "alumno"; // eslint-disable-line
  const avatar  = session?.user?.image;

  const horarioFallback = async () => {
    try {
      const clasesDB = await findAll<Clase>(CONTAINERS.CLASES);
      return (clasesDB.length > 0 ? clasesDB : clasesMock)
        .filter((c) => c.activa !== false)
        .sort((a, b) => DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia));
    } catch {
      return clasesMock.sort((a, b) => DIAS_ORDEN.indexOf(a.dia) - DIAS_ORDEN.indexOf(b.dia));
    }
  };

  // ── Padre: leer perfil seleccionado ────────────────────────────────────────
  if (rol === "padre") {
    const jar      = await cookies();
    const perfilId = jar.get("bjj_perfil_id")?.value;

    const padres = await findByQuery<{ id: string; email: string; perfiles?: PerfilHijo[] }>(
      CONTAINERS.USUARIOS,
      "SELECT * FROM c WHERE c.email = @email",
      [{ name: "@email", value: email }]
    );
    const padre   = padres[0];
    const perfiles = padre?.perfiles ?? [];

    if (!perfiles.length) redirect("/login?error=inactivo");
    if (perfiles.length > 1 && !perfilId) redirect("/dashboard/select");

    const perfil = perfilId
      ? perfiles.find((p) => p.id === perfilId) ?? perfiles[0]
      : perfiles[0];

    const horario = await horarioFallback();
    const progreso = getProgresoNivel(perfil.cinturon ?? "blanco", perfil.clasesCompletadas ?? 0);

    const anio = new Date().getFullYear();
    let registrosAnio: { fecha: string }[] = [];
    const graduaciones: Graduacion[] = (perfil as any).historialGraduaciones ?? []; // eslint-disable-line

    try {
      const registros = await findByQuery<{ fecha: string }>(
        CONTAINERS.ASISTENCIA,
        "SELECT c.fecha FROM c WHERE c.alumnoId = @id",
        [{ name: "@id", value: perfil.id }]
      );
      registrosAnio = registros;
    } catch { /* omitir */ }

    return <DashboardUI
      nombre={perfil.nombre} email={email} avatar={avatar}
      cinturon={perfil.cinturon ?? "blanco"} grados={perfil.grados ?? 0}
      clasesCompletadas={perfil.clasesCompletadas ?? 0} clasesEsteMes={0}
      proximoPago={proximoPagoActivo(perfil.proximoPago)} progreso={progreso}
      horario={horario} fechaInicio={perfil.fechaInicio}
      perfiles={perfiles} perfilActual={perfil}
      registrosAnio={registrosAnio} graduaciones={graduaciones} anio={anio}
    />;
  }

  // ── Alumno/instructor/admin normal ──────────────────────────────────────────
  const nombre = session?.user?.name?.split(" ")[0] ?? "Alumno";

  let usuario: UsuarioDB | null = null;
  try {
    const todos = await findAll<UsuarioDB>(CONTAINERS.USUARIOS);
    usuario = todos.find((u) => u.email === email) ?? null;
  } catch { /* muestra datos de sesión */ }

  if (usuario && usuario.activo === false) redirect("/login?error=inactivo");

  const cinturon          = usuario?.cinturon          ?? "blanco";
  const grados            = usuario?.grados            ?? 0;
  const proximoPago       = proximoPagoActivo(usuario?.proximoPago);
  const clasesCompletadas = usuario?.clasesCompletadas ?? 0;

  const horario = await horarioFallback();

  const ahora     = new Date();
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}`;
  let clasesEsteMes = 0;
  try {
    const asistenciaMes = await findByQuery<{ id: string }>(
      CONTAINERS.ASISTENCIA,
      "SELECT c.id FROM c WHERE c.alumnoEmail = @email AND STARTSWITH(c.fecha, @mes)",
      [{ name: "@email", value: email }, { name: "@mes", value: mesActual }]
    );
    clasesEsteMes = asistenciaMes.length;
  } catch { /* muestra 0 */ }

  const progreso = getProgresoNivel(cinturon, clasesCompletadas);

  const anio = new Date().getFullYear();
  let historialMensual;
  let registrosAnio: { fecha: string }[] = [];
  const graduaciones: Graduacion[] = (usuario as any)?.historialGraduaciones ?? []; // eslint-disable-line

  try {
    if (usuario?.id) {
      const registros = await findByQuery<{ fecha: string }>(
        CONTAINERS.ASISTENCIA,
        "SELECT c.fecha FROM c WHERE c.alumnoId = @id",
        [{ name: "@id", value: usuario.id }]
      );
      registrosAnio = registros;
    }
  } catch { /* omitir */ }

  return <DashboardUI
    nombre={nombre} email={email} avatar={avatar}
    cinturon={cinturon} grados={grados}
    clasesCompletadas={clasesCompletadas} clasesEsteMes={clasesEsteMes}
    proximoPago={proximoPago} progreso={progreso}
    horario={horario} fechaInicio={usuario?.fechaInicio}
    registrosAnio={registrosAnio} graduaciones={graduaciones} anio={anio}
  />;
}
