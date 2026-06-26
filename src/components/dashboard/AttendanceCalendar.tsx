"use client";

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DIAS  = Array.from({ length: 31 }, (_, i) => i + 1);

type Graduacion = { fecha: string; cinturonNuevo: string; gradosNuevo: number };

type Props = {
  registros:    { fecha: string }[];
  graduaciones: Graduacion[];
  anio:         number;
};

export default function AttendanceCalendar({ registros, graduaciones, anio }: Props) {
  const asistidas = new Set(registros.map((r) => r.fecha));
  const gradMap   = new Map(graduaciones.map((g) => [g.fecha, g]));

  return (
    <div className="rounded-xl border border-white/5 bg-gray-950 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Cartón de Frecuencia {anio}
        </h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            Clase
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            Graduación
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-10 pr-2 text-left text-gray-600 font-semibold pb-1" />
              {DIAS.map((d) => (
                <th key={d} className="text-center text-gray-600 font-normal w-6 pb-1">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MESES.map((mes, mi) => {
              const mesNum  = String(mi + 1).padStart(2, "0");
              const prefix  = `${anio}-${mesNum}`;
              const diasEnMes = new Date(anio, mi + 1, 0).getDate();
              return (
                <tr key={mes} className="border-t border-white/5">
                  <td className="pr-2 py-1 text-gray-500 font-semibold text-right whitespace-nowrap">
                    {mes}
                  </td>
                  {DIAS.map((d) => {
                    const fecha = `${prefix}-${String(d).padStart(2, "0")}`;
                    const fuera = d > diasEnMes;
                    const grad  = gradMap.get(fecha);
                    const asistio = asistidas.has(fecha);

                    return (
                      <td key={d} className="text-center py-1 w-6">
                        {fuera ? (
                          <span className="text-gray-800">·</span>
                        ) : grad ? (
                          <span title={`Graduación: ${grad.cinturonNuevo} ${grad.gradosNuevo}°`} className="text-yellow-400 text-sm leading-none">
                            ★
                          </span>
                        ) : asistio ? (
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
                        ) : (
                          <span className="inline-block w-2.5 h-2.5 rounded-full border border-white/10" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-600 mt-3 text-right">
        Total {anio}: <span className="text-white font-bold">{registros.length}</span> clases
      </p>
    </div>
  );
}
