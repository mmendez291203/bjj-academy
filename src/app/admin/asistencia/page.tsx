/**
 * /admin/asistencia
 * Registro de asistencia a clases.
 * Carga la lista de alumnos activos desde Cosmos DB (server),
 * y delega la interacción al componente cliente AsistenciaForm.
 */

import { findAll, findByQuery, CONTAINERS } from "@/lib/azure/cosmos";
import AsistenciaForm from "@/components/admin/AsistenciaForm";
import { formatFecha } from "@/lib/utils";
import { ClipboardList } from "lucide-react";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Asistencia — Admin" };

type Alumno = {
  id: string;
  email: string;
  nombre?: string;
  cinturon?: string;
  grados?: number;
  activo?: boolean;
  rol?: string;
  perfiles?: { id: string; nombre: string; cinturon?: string; grados?: number }[];
  _padreId?: string;
  _perfilId?: string;
};

type AsistenciaDoc = {
  id: string;
  fecha: string;
  tipo: string;
  alumnoNombre: string;
  alumnoEmail: string;
  creadoEn: string;
};

export default async function AsistenciaPage() {
  const [todosUsuarios, ultimasClases] = await Promise.all([
    findAll<Alumno>(CONTAINERS.USUARIOS).catch(() => []),
    findByQuery<AsistenciaDoc>(
      CONTAINERS.ASISTENCIA,
      "SELECT TOP 30 * FROM c ORDER BY c.creadoEn DESC"
    ).catch(() => []),
  ]);

  // Expandir padres en filas individuales por hijo
  const alumnos: Alumno[] = [];
  for (const u of todosUsuarios) {
    if (u.rol === "padre" && u.perfiles?.length) {
      for (const p of u.perfiles) {
        alumnos.push({
          id:        p.id,
          email:     u.email,
          nombre:    p.nombre,
          cinturon:  p.cinturon,
          grados:    p.grados,
          activo:    true,
          _padreId:  u.id,
          _perfilId: p.id,
        });
      }
    } else {
      alumnos.push(u);
    }
  }

  // Fecha de hoy en formato YYYY-MM-DD (zona horaria del servidor)
  const hoy = new Date().toISOString().slice(0, 10);

  // Agrupar las últimas clases por fecha+tipo para mostrar el resumen
  const resumenMap = new Map<string, { fecha: string; tipo: string; alumnos: string[] }>();
  for (const r of ultimasClases) {
    const key = `${r.fecha}|${r.tipo}`;
    if (!resumenMap.has(key)) {
      resumenMap.set(key, { fecha: r.fecha, tipo: r.tipo, alumnos: [] });
    }
    resumenMap.get(key)!.alumnos.push(r.alumnoNombre ?? r.alumnoEmail);
  }
  const resumen = Array.from(resumenMap.values()).slice(0, 8);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Registro de Asistencia</h1>
        <p className="text-gray-400 mt-1">
          Marca qué alumnos asistieron a cada clase. El progreso se actualiza automáticamente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ─── Formulario (col 1-3) ──────────────────────────────────── */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-gray-950 p-6">
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-red-400" />
            Nueva clase
          </h2>
          <AsistenciaForm alumnos={alumnos} fechaHoy={hoy} />
        </div>

        {/* ─── Historial reciente (col 4-5) ─────────────────────────── */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-white mb-4">Clases recientes</h2>
          {resumen.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-gray-950 p-6 text-center">
              <p className="text-sm text-gray-600">No hay clases registradas aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumen.map(({ fecha, tipo, alumnos: nombres }) => (
                <div
                  key={`${fecha}|${tipo}`}
                  className="rounded-xl border border-white/5 bg-gray-950 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">
                      {formatFecha(fecha + "T12:00:00")}
                    </span>
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">
                      {tipo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {nombres.length} alumno{nombres.length !== 1 ? "s" : ""}:{" "}
                    <span className="text-gray-400">{nombres.join(", ")}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
