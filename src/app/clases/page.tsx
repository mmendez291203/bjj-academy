import type { Metadata } from "next";
import { clasesMock } from "@/lib/data/clases-mock";
import type { DiaSemana, TipoClase } from "@/types";
import { formatHora, cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Horario de Clases",
  description: "Consulta el horario completo de clases de BJJ Gi, No-Gi, Wrestling y Kids.",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIAS: DiaSemana[] = [
  "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
];

const DIAS_LABEL: Record<DiaSemana, string> = {
  lunes:     "Lunes",
  martes:    "Martes",
  miercoles: "Miércoles",
  jueves:    "Jueves",
  viernes:   "Viernes",
  sabado:    "Sábado",
  domingo:   "Domingo",
};

const TIPO_COLORS: Record<TipoClase, string> = {
  "gi":       "border-blue-700 bg-blue-950/40 hover:border-blue-500",
  "no-gi":    "border-orange-700 bg-orange-950/40 hover:border-orange-500",
  "wrestling":"border-yellow-700 bg-yellow-950/40 hover:border-yellow-500",
  "fitness":  "border-green-700 bg-green-950/40 hover:border-green-500",
  "kids":     "border-purple-700 bg-purple-950/40 hover:border-purple-500",
};

const TIPO_BADGE: Record<TipoClase, string> = {
  "gi":       "bg-blue-900 text-blue-200",
  "no-gi":    "bg-orange-900 text-orange-200",
  "wrestling":"bg-yellow-900 text-yellow-200",
  "fitness":  "bg-green-900 text-green-200",
  "kids":     "bg-purple-900 text-purple-200",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClasesPage() {
  /**
   * En producción, reemplaza clasesMock con:
   * const clases = await findAll<Clase>(CONTAINERS.CLASES)
   *
   * Next.js ejecuta esto en el servidor (Server Component),
   * por lo que el fetch ocurre antes de enviar HTML al cliente.
   */
  const clases = clasesMock;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Horario de Clases
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Entrena a tu ritmo. Tenemos clases para todos los niveles, mañana y noche.
          </p>

          {/* Leyenda de tipos */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {(Object.entries(TIPO_BADGE) as [TipoClase, string][]).map(([tipo, cls]) => (
              <span key={tipo} className={cn("text-xs font-semibold px-3 py-1 rounded-full", cls)}>
                {tipo === "gi"       ? "BJJ Gi"     :
                 tipo === "no-gi"   ? "No-Gi"      :
                 tipo === "wrestling"? "Wrestling"  :
                 tipo === "fitness" ? "Fitness"    : "Kids"}
              </span>
            ))}
          </div>
        </div>

        {/* ─── Tabla por día ──────────────────────────────────────────── */}
        <div className="space-y-10">
          {DIAS.map((dia) => {
            const clasesDelDia = clases
              .filter((c) => c.dia === dia && c.activa)
              .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

            if (clasesDelDia.length === 0) return null;

            return (
              <div key={dia}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-red-500">▍</span>
                  {DIAS_LABEL[dia]}
                  <span className="text-sm font-normal text-gray-500">
                    — {clasesDelDia.length} clase{clasesDelDia.length > 1 ? "s" : ""}
                  </span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clasesDelDia.map((clase) => (
                    <div
                      key={clase.id}
                      className={cn(
                        "rounded-xl border p-5 transition-all",
                        TIPO_COLORS[clase.tipo]
                      )}
                    >
                      {/* Tipo badge */}
                      <span
                        className={cn(
                          "inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-3",
                          TIPO_BADGE[clase.tipo]
                        )}
                      >
                        {clase.tipo.toUpperCase()}
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── CTA ─────────────────────────────────────────────────────── */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">¿Listo para comenzar?</p>
          <Link href="/inscripciones">
            <Button size="lg">Reservar clase gratis →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
