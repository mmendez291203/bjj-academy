"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, capitalizar } from "@/lib/utils";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DIAS  = Array.from({ length: 31 }, (_, i) => i + 1);

type Graduacion = { fecha: string; cinturonAnterior: string; gradosAnterior: number; cinturonNuevo: string; gradosNuevo: number };

type Props = {
  registros:    { fecha: string }[];
  graduaciones: Graduacion[];
  anio:         number;
  compact?:     boolean;
};

export default function AttendanceCalendar({ registros, graduaciones, anio: anioInicial, compact = false }: Props) {
  const [anio, setAnio] = useState(anioInicial);

  const registrosAnio = registros.filter((r) => r.fecha.startsWith(String(anio)));
  const asistidas     = new Set(registrosAnio.map((r) => r.fecha));
  const gradMap       = new Map(
    graduaciones.filter((g) => g.fecha.startsWith(String(anio))).map((g) => [g.fecha, g])
  );

  const Header = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setAnio((a) => a - 1)} className="text-gray-500 hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          {compact ? `Asistencia ${anio}` : `Cartón de Frecuencia ${anio}`}
        </h2>
        <button
          onClick={() => setAnio((a) => a + 1)}
          disabled={anio >= anioInicial}
          className="text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Clase
        </span>
        <span className="flex items-center gap-1">
          <span className="text-yellow-400">★</span> Grad
        </span>
      </div>
    </div>
  );

  /* ── Modo compacto (modal de admin) ─────────────────────────────────── */
  if (compact) {
    return (
      <div className="rounded-xl border border-white/5 bg-gray-950 p-4">
        <Header />

        <div>
          {MESES.map((mes, mi) => {
            const mesNum  = String(mi + 1).padStart(2, "0");
            const prefix  = `${anio}-${mesNum}`;

            const asistidosMes = registrosAnio.filter((r) => r.fecha.startsWith(prefix));
            const gradsMes     = graduaciones.filter((g) => g.fecha.startsWith(prefix));
            const totalMes     = asistidosMes.length;

            // Fechas únicas con algún evento, ordenadas
            const fechasUnicas = Array.from(new Set([
              ...asistidosMes.map((r) => r.fecha),
              ...gradsMes.map((g) => g.fecha),
            ])).sort();

            const tieneEventos = fechasUnicas.length > 0;

            return (
              <div
                key={mes}
                className={cn(
                  "flex items-start gap-3 py-2 border-t border-white/5",
                  !tieneEventos && "opacity-25"
                )}
              >
                {/* Mes */}
                <span className="w-7 text-right text-xs font-semibold text-gray-400 pt-0.5 shrink-0">
                  {mes}
                </span>

                {/* Conteo */}
                <span className={cn(
                  "w-5 text-center text-xs font-bold shrink-0 pt-0.5",
                  totalMes > 0 ? "text-white" : "text-gray-700"
                )}>
                  {totalMes > 0 ? totalMes : "—"}
                </span>

                {/* Chips de días */}
                <div className="flex flex-wrap gap-1 flex-1">
                  {fechasUnicas.map((fecha) => {
                    const dia  = parseInt(fecha.slice(8));
                    const grad = gradMap.get(fecha);

                    if (grad) {
                      const esCinta = grad.cinturonAnterior !== grad.cinturonNuevo;
                      return (
                        <span
                          key={fecha}
                          title={esCinta
                            ? `Cinta: ${capitalizar(grad.cinturonAnterior)} → ${capitalizar(grad.cinturonNuevo)}`
                            : `Grado: ${grad.gradosAnterior}° → ${grad.gradosNuevo}°`}
                          className="inline-flex items-center gap-0.5 text-yellow-400 text-xs font-mono bg-yellow-900/25 px-1.5 py-0.5 rounded"
                        >
                          ★{dia}
                        </span>
                      );
                    }

                    return (
                      <span key={fecha} className="text-xs font-mono text-red-300 bg-red-900/25 px-1.5 py-0.5 rounded">
                        {dia}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-white/5 text-right">
          Total {anio}: <span className="text-white font-bold">{registrosAnio.length}</span> clases
        </p>
      </div>
    );
  }

  /* ── Modo grilla completa (dashboard) ───────────────────────────────── */
  return (
    <div className="rounded-xl border border-white/5 bg-gray-950 p-4 sm:p-6">
      <Header />

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-10 pr-2 text-left text-gray-600 font-semibold pb-1" />
              {DIAS.map((d) => (
                <th key={d} className="text-center text-gray-600 font-normal w-6 pb-1">{d}</th>
              ))}
              <th className="text-center text-gray-600 font-semibold pb-1 pl-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {MESES.map((mes, mi) => {
              const mesNum    = String(mi + 1).padStart(2, "0");
              const prefix    = `${anio}-${mesNum}`;
              const diasEnMes = new Date(anio, mi + 1, 0).getDate();
              const totalMes  = registrosAnio.filter((r) => r.fecha.startsWith(prefix)).length;

              return (
                <tr key={mes} className="border-t border-white/5">
                  <td className="pr-2 py-1 text-gray-500 font-semibold text-right whitespace-nowrap">
                    {mes}
                  </td>
                  {DIAS.map((d) => {
                    const fecha   = `${prefix}-${String(d).padStart(2, "0")}`;
                    const fuera   = d > diasEnMes;
                    const grad    = gradMap.get(fecha);
                    const asistio = asistidas.has(fecha);

                    return (
                      <td key={d} className="text-center py-1 w-6">
                        {fuera ? (
                          <span className="text-gray-800">·</span>
                        ) : grad ? (
                          <span
                            title={
                              grad.cinturonAnterior !== grad.cinturonNuevo
                                ? `Cinta: ${capitalizar(grad.cinturonAnterior)} → ${capitalizar(grad.cinturonNuevo)}`
                                : `Grado: ${grad.gradosAnterior}° → ${grad.gradosNuevo}°`
                            }
                            className="text-yellow-400 text-sm leading-none"
                          >★</span>
                        ) : asistio ? (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                        ) : (
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/10" />
                        )}
                      </td>
                    );
                  })}
                  <td className="text-center py-1 pl-2 font-bold text-white">
                    {totalMes > 0 ? totalMes : <span className="text-gray-700">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 mt-3 text-right">
        Total {anio}: <span className="text-white font-bold">{registrosAnio.length}</span> clases
      </p>
    </div>
  );
}
