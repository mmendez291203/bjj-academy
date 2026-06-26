"use client";

/**
 * Formulario de registro de asistencia.
 * El admin selecciona fecha, tipo de clase y marca qué alumnos asistieron.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, colorCinturon, capitalizar } from "@/lib/utils";

type Alumno = {
  id: string;
  email: string;
  nombre?: string;
  cinturon?: string;
  grados?: number;
  activo?: boolean;
  _padreId?: string;
  _perfilId?: string;
};

type Props = {
  alumnos: Alumno[];
  fechaHoy: string; // YYYY-MM-DD
};

const TIPOS = [
  { value: "gi",       label: "BJJ Gi" },
  { value: "no-gi",    label: "No-Gi" },
  { value: "open-mat", label: "Open Mat" },
  { value: "kids",     label: "Kids" },
] as const;

type Resultado = {
  ok: boolean;
  message: string;
  registrados?: number;
  duplicados?: number;
};

export default function AsistenciaForm({ alumnos, fechaHoy }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fecha,     setFecha]     = useState(fechaHoy);
  const [tipo,      setTipo]      = useState<string>("gi");
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set());
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [categoria, setCategoria] = useState<"adultos" | "kids">("adultos");

  const alumnosActivos = alumnos.filter((a) => a.activo !== false);
  const alumnosFiltrados = alumnosActivos.filter((a) =>
    categoria === "kids" ? !!a._perfilId : !a._perfilId
  );

  function toggleAlumno(id: string) {
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleTodos() {
    if (seleccion.size === alumnosFiltrados.length) {
      setSeleccion(new Set());
    } else {
      setSeleccion(new Set(alumnosFiltrados.map((a) => a.id)));
    }
  }

  async function registrar() {
    if (seleccion.size === 0) return;
    setResultado(null);

    const alumnosSeleccionados = alumnosActivos
      .filter((a) => seleccion.has(a.id))
      .map((a) => ({
        id:        a.id,
        email:     a.email,
        nombre:    a.nombre ?? a.email,
        ...(a._padreId  && { _padreId:  a._padreId }),
        ...(a._perfilId && { _perfilId: a._perfilId }),
      }));

    try {
      const res = await fetch("/api/admin/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, tipo, alumnos: alumnosSeleccionados }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResultado({ ok: false, message: data.error ?? "Error al registrar" });
        return;
      }

      setResultado({
        ok:           true,
        message:      data.message,
        registrados:  data.registrados,
        duplicados:   data.duplicados,
      });
      setSeleccion(new Set()); // limpiar selección para la próxima clase

      // refrescar datos del servidor
      startTransition(() => router.refresh());
    } catch {
      setResultado({ ok: false, message: "Error de conexión. Intente nuevamente." });
    }
  }

  return (
    <div className="space-y-6">

      {/* ─── Tabs Adultos / Kids ───────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
        {(["adultos", "kids"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoria(cat); setSeleccion(new Set()); setResultado(null); }}
            className={cn(
              "flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition-all",
              categoria === cat ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {cat === "adultos" ? "Adultos" : "Kids"}
          </button>
        ))}
      </div>

      {/* ─── Fecha y tipo ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Fecha de la clase
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => { setFecha(e.target.value); setResultado(null); }}
            className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
            Tipo de clase
          </label>
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setResultado(null); }}
            className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30"
          >
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Lista de alumnos ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            Alumnos presentes
          </label>
          <button
            onClick={toggleTodos}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {seleccion.size === alumnosFiltrados.length ? "Desmarcar todos" : "Marcar todos"}
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {alumnosFiltrados.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              No hay alumnos {categoria === "kids" ? "kids" : "adultos"} activos.
            </p>
          ) : (
            alumnosFiltrados.map((alumno) => {
              const activo = seleccion.has(alumno.id);
              return (
                <button
                  key={alumno.id}
                  onClick={() => toggleAlumno(alumno.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    activo
                      ? "border-green-700/50 bg-green-950/30"
                      : "border-white/5 bg-gray-950 hover:border-white/10"
                  )}
                >
                  {/* Checkbox visual */}
                  {activo
                    ? <CheckSquare className="w-4 h-4 text-green-400 shrink-0" />
                    : <Square className="w-4 h-4 text-gray-600 shrink-0" />
                  }

                  {/* Datos del alumno */}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", activo ? "text-white" : "text-gray-400")}>
                      {alumno.nombre ?? alumno.email}
                    </p>
                    <p className="text-xs text-gray-600 truncate">{alumno.email}</p>
                  </div>

                  {/* Cinturón + grados */}
                  {alumno.cinturon && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        colorCinturon(alumno.cinturon)
                      )}>
                        {capitalizar(alumno.cinturon)}
                      </span>
                      <span className="text-yellow-400 text-xs font-mono">
                        {"●".repeat(alumno.grados ?? 0)}{"○".repeat(4 - (alumno.grados ?? 0))}
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Resultado ─────────────────────────────────────────────────── */}
      {resultado && (
        <div className={cn(
          "flex items-start gap-3 rounded-lg px-4 py-3 border text-sm",
          resultado.ok
            ? "bg-green-950/30 border-green-700/40 text-green-300"
            : "bg-red-950/30 border-red-700/40 text-red-300"
        )}>
          {resultado.ok
            ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          }
          {resultado.message}
        </div>
      )}

      {/* ─── Botón registrar ───────────────────────────────────────────── */}
      <button
        onClick={registrar}
        disabled={seleccion.size === 0 || isPending}
        className={cn(
          "w-full py-3 rounded-xl font-semibold text-sm transition-all",
          seleccion.size > 0
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        )}
      >
        {isPending
          ? "Registrando…"
          : seleccion.size === 0
            ? "Selecciona alumnos para registrar"
            : `Registrar asistencia — ${seleccion.size} alumno${seleccion.size !== 1 ? "s" : ""}`
        }
      </button>
    </div>
  );
}
