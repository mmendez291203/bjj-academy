"use client";

import { useState } from "react";
import { Clock, Users } from "lucide-react";
import { cn, formatHora } from "@/lib/utils";
import type { Clase, TipoClase } from "@/types";

// ─── Configuración de tipos ───────────────────────────────────────────────────
const FILTROS: { value: TipoClase | "todos"; label: string }[] = [
  { value: "todos",  label: "Todos"   },
  { value: "gi",     label: "Gi"      },
  { value: "no-gi",  label: "No-Gi"   },
  { value: "kids",   label: "Kids"    },
];

const TIPO_LABEL: Record<TipoClase, string> = {
  gi:     "Gi",
  "no-gi": "No-Gi",
  kids:   "Kids",
};

const TIPO_CARD: Record<TipoClase, string> = {
  gi:     "border-blue-700   bg-blue-950/40   hover:border-blue-500",
  "no-gi": "border-orange-700 bg-orange-950/40 hover:border-orange-500",
  kids:   "border-purple-700 bg-purple-950/40 hover:border-purple-500",
};

const TIPO_BADGE: Record<TipoClase, string> = {
  gi:     "bg-blue-900   text-blue-200",
  "no-gi": "bg-orange-900 text-orange-200",
  kids:   "bg-purple-900 text-purple-200",
};

const DIAS_LABEL: Record<string, string> = {
  lunes:     "Lunes",
  martes:    "Martes",
  miercoles: "Miércoles",
  jueves:    "Jueves",
  viernes:   "Viernes",
  sabado:    "Sábado",
  domingo:   "Domingo",
};

const DIAS_ORDER = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ClasesGrid({ clases }: { clases: Clase[] }) {
  const [filtro, setFiltro] = useState<TipoClase | "todos">("todos");

  const clasesFiltradas = filtro === "todos"
    ? clases
    : clases.filter((c) => c.tipo === filtro);

  // Agrupar por día manteniendo el orden
  const porDia = DIAS_ORDER.reduce<Record<string, Clase[]>>((acc, dia) => {
    const del_dia = clasesFiltradas
      .filter((c) => c.dia === dia && c.activa)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    if (del_dia.length > 0) acc[dia] = del_dia;
    return acc;
  }, {});

  return (
    <>
      {/* ─── Filtros ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {FILTROS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFiltro(value)}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-semibold transition-all",
              filtro === value
                ? "bg-white text-black"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─── Sin resultados ───────────────────────────────────────────────── */}
      {Object.keys(porDia).length === 0 && (
        <div className="text-center py-20 text-gray-600">
          <p>No hay clases de {FILTROS.find(f => f.value === filtro)?.label} programadas aún.</p>
        </div>
      )}

      {/* ─── Grid por día ────────────────────────────────────────────────── */}
      <div className="space-y-10">
        {Object.entries(porDia).map(([dia, clasesDelDia]) => (
          <div key={dia}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-red-500">▍</span>
              {DIAS_LABEL[dia]}
              <span className="text-sm font-normal text-gray-500">
                — {clasesDelDia.length} clase{clasesDelDia.length !== 1 ? "s" : ""}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clasesDelDia.map((clase) => {
                const tipo = (clase.tipo as TipoClase) in TIPO_CARD
                  ? clase.tipo as TipoClase
                  : "gi";

                return (
                  <div
                    key={clase.id}
                    className={cn(
                      "rounded-xl border p-5 transition-all",
                      TIPO_CARD[tipo]
                    )}
                  >
                    <span className={cn(
                      "inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-3",
                      TIPO_BADGE[tipo]
                    )}>
                      {TIPO_LABEL[tipo]}
                    </span>

                    <h3 className="font-bold text-white text-lg mb-1">{clase.nombre}</h3>
                    <p className="text-xs text-gray-400 mb-3">{clase.instructor}</p>

                    {clase.descripcion && (
                      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        {clase.descripcion}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatHora(clase.horaInicio)} – {formatHora(clase.horaFin)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Máx. {clase.capacidadMaxima}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
