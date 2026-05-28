import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { formatFecha } from "@/lib/utils";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Inscripciones — Admin" };

type Inscripcion = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  nivel?: string;
  clase?: string;
  mensaje?: string;
  creadoEn?: string;
  _ts?: number;
};

export default async function InscripcionesPage() {
  const inscripciones = await findAll<Inscripcion>(CONTAINERS.INSCRIPCIONES).catch(() => []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Inscripciones</h1>
        <p className="text-gray-400 mt-1">{inscripciones.length} solicitud{inscripciones.length !== 1 ? "es" : ""} recibida{inscripciones.length !== 1 ? "s" : ""}</p>
      </div>

      {inscripciones.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No hay inscripciones todavía.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-950 border-b border-white/5">
              <tr>
                {["Nombre", "Email", "Teléfono", "Nivel", "Clase", "Fecha"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inscripciones.map((ins) => (
                <tr key={ins.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{ins.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{ins.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{ins.telefono ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{ins.nivel ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{ins.clase ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {ins.creadoEn ? formatFecha(ins.creadoEn) : ins._ts ? formatFecha(new Date(ins._ts * 1000).toISOString()) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
