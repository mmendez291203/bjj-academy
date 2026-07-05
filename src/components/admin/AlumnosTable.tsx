"use client";

/**
 * Tabla de alumnos con modal de edición.
 * Componente cliente — maneja estado del modal y llama a la API.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Baby, CalendarDays } from "lucide-react";
import { cn, colorCinturon, capitalizar } from "@/lib/utils";
import AttendanceCalendar from "@/components/dashboard/AttendanceCalendar";

type AsistenciaRec = { id: string; fecha: string; tipo: string };

export type UsuarioAdmin = {
  id: string;
  nombre?: string;
  email: string;
  rol: string;
  cinturon?: string;
  grados?: number;
  clasesCompletadas?: number;
  clasesEsteMes?: number;
  proximoPago?: string | null;
  activo?: boolean;
  historialGraduaciones?: { fecha: string; cinturonAnterior: string; gradosAnterior: number; cinturonNuevo: string; gradosNuevo: number }[];
  // Campos internos para perfiles de hijos (no se guardan en DB directamente)
  _tipo?: "perfil";
  _padreId?: string;
  _perfilId?: string;
};

type FormState = {
  rol: string;
  cinturon: string;
  grados: number;
  clasesCompletadas: number;
  clasesEsteMes: number;
  proximoPago: string;
  activo: boolean;
};

const CINTURONES: { value: string; label: string; grupo: string }[] = [
  // Adultos
  { value: "blanco",          label: "Blanco",          grupo: "Adultos" },
  { value: "azul",            label: "Azul",            grupo: "Adultos" },
  { value: "morado",          label: "Morado",          grupo: "Adultos" },
  { value: "cafe",            label: "Café",            grupo: "Adultos" },
  { value: "negro",           label: "Negro",           grupo: "Adultos" },
  // Niños — Gris
  { value: "gris-blanco",     label: "Gris / Blanco",   grupo: "Niños" },
  { value: "gris",            label: "Gris",            grupo: "Niños" },
  { value: "gris-negro",      label: "Gris / Negro",    grupo: "Niños" },
  // Niños — Amarillo
  { value: "amarillo-blanco", label: "Amarillo / Blanco", grupo: "Niños" },
  { value: "amarillo",        label: "Amarillo",        grupo: "Niños" },
  { value: "amarillo-negro",  label: "Amarillo / Negro", grupo: "Niños" },
  // Niños — Naranja
  { value: "naranja-blanco",  label: "Naranja / Blanco", grupo: "Niños" },
  { value: "naranja",         label: "Naranja",         grupo: "Niños" },
  { value: "naranja-negro",   label: "Naranja / Negro", grupo: "Niños" },
  // Niños — Verde
  { value: "verde-blanco",    label: "Verde / Blanco",  grupo: "Niños" },
  { value: "verde",           label: "Verde",           grupo: "Niños" },
  { value: "verde-negro",     label: "Verde / Negro",   grupo: "Niños" },
];

function Grados({ n }: { n: number }) {
  return (
    <span className="text-yellow-400 tracking-widest text-sm font-mono">
      {"●".repeat(n)}{"○".repeat(4 - n)}
    </span>
  );
}

export default function AlumnosTable({ usuarios, rolActual }: { usuarios: UsuarioAdmin[]; rolActual?: string }) {
  const router = useRouter();
  const esAdmin = rolActual === "admin";
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [form, setForm] = useState<FormState>({
    rol: "alumno", cinturon: "blanco", grados: 0, clasesCompletadas: 0,
    clasesEsteMes: 0, proximoPago: "", activo: true,
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"editar" | "historial">("editar");
  const [historial, setHistorial] = useState<AsistenciaRec[] | null>(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [eliminandoGrad, setEliminandoGrad] = useState<number | null>(null);

  function abrirModal(u: UsuarioAdmin) {
    setEditando(u);
    setForm({
      rol:               u.rol               ?? "alumno",
      cinturon:          u.cinturon          ?? "blanco",
      grados:            u.grados            ?? 0,
      clasesCompletadas: u.clasesCompletadas ?? 0,
      clasesEsteMes:     u.clasesEsteMes     ?? 0,
      proximoPago:       u.proximoPago       ? u.proximoPago.slice(0, 10) : "",
      activo:            u.activo !== false,
    });
    setError("");
    setTab("editar");
    setHistorial(null);
  }

  function cerrarModal() {
    setEditando(null);
    setError("");
    setTab("editar");
    setHistorial(null);
  }

  async function cargarHistorial(alumnoId: string) {
    setCargandoHistorial(true);
    try {
      const res = await fetch(`/api/admin/asistencia/alumno?alumnoId=${alumnoId}`);
      const data = await res.json();
      setHistorial(data.success ? data.data : []);
    } catch {
      setHistorial([]);
    } finally {
      setCargandoHistorial(false);
    }
  }

  function switchTab(t: "editar" | "historial") {
    setTab(t);
    if (t === "historial" && historial === null && editando) {
      cargarHistorial(editando.id);
    }
  }

  async function eliminar(u: UsuarioAdmin) {
    if (!confirm(`¿Eliminar a ${u.nombre ?? u.email}? Esta acción no se puede deshacer.`)) return;
    try {
      let res: Response;
      if (u._tipo === "perfil" && u._padreId && u._perfilId) {
        // Perfiles de hijos: PATCH al padre eliminando el perfil del array
        res = await fetch(`/api/admin/usuarios/${u._padreId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eliminarPerfilId: u._perfilId }),
        });
      } else {
        res = await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
      }
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.error ?? "Error al eliminar");
      }
    } catch {
      alert("Error de conexión");
    }
  }

  async function guardar() {
    if (!editando) return;
    setGuardando(true);
    setError("");
    const esPerfil = editando._tipo === "perfil";
    // Para perfiles de hijos: PATCH al padre con perfilId incluido
    const targetId = esPerfil ? (editando._padreId ?? editando.id) : editando.id;
    try {
      const hayGraduacion =
        form.cinturon !== (editando.cinturon ?? "blanco") ||
        Number(form.grados) !== (editando.grados ?? 0);

      const body: Record<string, unknown> = {
        cinturon:          form.cinturon,
        grados:            Number(form.grados),
        clasesCompletadas: Number(form.clasesCompletadas),
        proximoPago:       form.proximoPago ? new Date(form.proximoPago + "T12:00:00").toISOString() : null,
      };

      if (hayGraduacion) {
        const hoy = new Date().toISOString().slice(0, 10);
        const historialPrevio = editando.historialGraduaciones ?? [];
        body.historialGraduaciones = [
          ...historialPrevio,
          {
            fecha:            hoy,
            cinturonAnterior: editando.cinturon ?? "blanco",
            gradosAnterior:   editando.grados ?? 0,
            cinturonNuevo:    form.cinturon,
            gradosNuevo:      Number(form.grados),
          },
        ];
      }
      if (esPerfil) {
        body.perfilId = editando._perfilId;
      } else {
        body.rol          = form.rol;
        body.clasesEsteMes = Number(form.clasesEsteMes);
        body.activo       = form.activo;
      }
      const res = await fetch(`/api/admin/usuarios/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }
      cerrarModal();
      router.refresh(); // refresca los datos del server component
    } catch {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminarGraduacion(idx: number) {
    if (!editando) return;
    if (!confirm("¿Eliminar esta entrada del historial de graduaciones?")) return;
    setEliminandoGrad(idx);
    const nuevoHistorial = (editando.historialGraduaciones ?? []).filter((_, i) => i !== idx);
    const targetId = editando._tipo === "perfil" ? (editando._padreId ?? editando.id) : editando.id;
    const body: Record<string, unknown> = { historialGraduaciones: nuevoHistorial };
    if (editando._tipo === "perfil") body.perfilId = editando._perfilId;
    try {
      const res = await fetch(`/api/admin/usuarios/${targetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditando((prev) => prev ? { ...prev, historialGraduaciones: nuevoHistorial } : null);
      } else {
        alert("Error al eliminar la graduación");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setEliminandoGrad(null);
    }
  }

  const filasFiltradas = busqueda.trim()
    ? usuarios.filter((u) => {
        const q = busqueda.toLowerCase();
        return (u.nombre ?? "").toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      })
    : usuarios;

  return (
    <>
      {/* ─── Buscador ──────────────────────────────────────────────────────── */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-gray-950 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-white/30"
        />
        {busqueda && (
          <button onClick={() => setBusqueda("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors text-xs">
            ✕
          </button>
        )}
        {busqueda && (
          <p className="text-xs text-gray-500 mt-1.5">
            {filasFiltradas.length === 0
              ? "Ningún alumno coincide con esa búsqueda"
              : `${filasFiltradas.length} alumno${filasFiltradas.length !== 1 ? "s" : ""} encontrado${filasFiltradas.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* ─── Tabla ─────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-950 border-b border-white/5">
            <tr>
              {["Nombre", "Email", "Rol", "Cinturón", "Grados", "Clases", "Estado", ""].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filasFiltradas.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white font-medium">
                  <div className="flex items-center gap-2">
                    {u.nombre ?? "—"}
                    {u._tipo === "perfil" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-900/40 text-purple-400 border border-purple-800/40">
                        <Baby className="w-3 h-3" /> Kids
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u._tipo === "perfil" ? (
                    <span className="text-gray-600">papá: {u.email}</span>
                  ) : u.email}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    u.rol === "admin"
                      ? "bg-red-900/40 text-red-400"
                      : "bg-gray-800 text-gray-400"
                  )}>
                    {u.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.cinturon ? (
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      colorCinturon(u.cinturon)
                    )}>
                      {CINTURONES.find((c) => c.value === u.cinturon)?.label ?? capitalizar(u.cinturon)}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Grados n={u.grados ?? 0} />
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {u.clasesCompletadas ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full",
                    u.activo !== false
                      ? "bg-green-900/40 text-green-400"
                      : "bg-gray-800 text-gray-500"
                  )}>
                    {u.activo !== false ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => abrirModal(u)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Editar
                    </button>
                    {esAdmin && (
                      <button
                        onClick={() => eliminar(u)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ─── Modal de edición ──────────────────────────────────────────────── */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {editando._tipo === "perfil" && <Baby className="w-4 h-4 text-purple-400" />}
                  {editando.nombre ?? editando.email}
                </h2>
              </div>
              <button onClick={cerrarModal} className="text-gray-500 hover:text-white transition-colors mt-0.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              {editando._tipo === "perfil" ? `Kids · papá: ${editando.email}` : editando.email}
            </p>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-950 rounded-lg p-1">
              {(["editar", "historial"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all",
                    tab === t ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  {t === "historial" && <CalendarDays className="w-3.5 h-3.5" />}
                  {t === "editar" ? "Editar" : "Historial de asistencia"}
                </button>
              ))}
            </div>

            {/* ── Tab: Historial ───────────────────────────── */}
            {tab === "historial" && (
              <div className="space-y-4 min-h-[200px]">

                {/* Graduation history */}
                {(editando?.historialGraduaciones ?? []).length > 0 ? (
                  <div className="rounded-xl border border-white/5 bg-gray-950 p-4">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="text-yellow-400">★</span> Historial de graduaciones
                    </h3>
                    <div className="space-y-2">
                      {editando!.historialGraduaciones!.map((g, i) => {
                        const esCambioCinta = g.cinturonAnterior !== g.cinturonNuevo;
                        return (
                          <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900 border border-white/5">
                            <span className={cn(
                              "shrink-0 text-xs font-bold px-2 py-0.5 rounded-full",
                              esCambioCinta ? "bg-yellow-900/30 text-yellow-400" : "bg-blue-900/30 text-blue-400"
                            )}>
                              {esCambioCinta ? "Cinta" : "Grado"}
                            </span>
                            <div className="flex-1 flex items-center gap-1.5 min-w-0 flex-wrap">
                              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorCinturon(g.cinturonAnterior))}>
                                {capitalizar(g.cinturonAnterior)}
                              </span>
                              <span className="text-gray-700 text-xs font-mono">{"●".repeat(g.gradosAnterior)}</span>
                              <span className="text-gray-600 text-xs">→</span>
                              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorCinturon(g.cinturonNuevo))}>
                                {capitalizar(g.cinturonNuevo)}
                              </span>
                              <span className="text-yellow-400 text-xs font-mono">{"●".repeat(g.gradosNuevo)}</span>
                            </div>
                            <span className="text-xs text-gray-600 shrink-0 whitespace-nowrap">
                              {new Date(g.fecha + "T12:00:00").toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "2-digit" })}
                            </span>
                            <button
                              onClick={() => eliminarGraduacion(i)}
                              disabled={eliminandoGrad === i}
                              className="text-gray-700 hover:text-red-400 transition-colors shrink-0 disabled:opacity-50"
                              title="Eliminar esta graduación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 text-center py-2">Sin graduaciones registradas.</p>
                )}

                {/* Attendance calendar */}
                {cargandoHistorial ? (
                  <p className="text-sm text-gray-500 text-center py-10">Cargando asistencia…</p>
                ) : historial === null ? null : historial.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-4">Sin registros de asistencia.</p>
                ) : (
                  <AttendanceCalendar
                    registros={historial}
                    graduaciones={editando?.historialGraduaciones ?? []}
                    anio={new Date().getFullYear()}
                    compact
                  />
                )}
              </div>
            )}

            {/* ── Tab: Editar ──────────────────────────────── */}
            {tab === "editar" && <div className="space-y-4">
              {/* Rol — solo para alumnos normales */}
              {editando._tipo !== "perfil" && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Rol en el sistema
                </label>
                <select
                  value={form.rol}
                  onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                >
                  <option value="alumno">Alumno — acceso solo a su portal</option>
                  <option value="instructor">Instructor — acceso total al panel</option>
                  <option value="admin">Admin — acceso total + configuración</option>
                </select>
                <p className="text-xs text-gray-600 mt-1.5">
                  ⚠️ El cambio aplica la próxima vez que el usuario cierre e inicie sesión.
                </p>
              </div>
              )}

              {/* Cinturón */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Cinturón
                </label>
                <select
                  value={form.cinturon}
                  onChange={(e) => setForm((f) => ({ ...f, cinturon: e.target.value }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                >
                  {["Adultos", "Niños"].map((grupo) => (
                    <optgroup key={grupo} label={`── ${grupo} ──`}>
                      {CINTURONES.filter((c) => c.grupo === grupo).map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Grados */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Grados (rayas)
                </label>
                <select
                  value={form.grados}
                  onChange={(e) => setForm((f) => ({ ...f, grados: Number(e.target.value) }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                >
                  {[0, 1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "grado" : "grados"} — {"●".repeat(n)}{"○".repeat(4 - n)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clases completadas */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Clases completadas (total)
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.clasesCompletadas}
                  onChange={(e) => setForm((f) => ({ ...f, clasesCompletadas: Number(e.target.value) }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Clases este mes — solo alumnos normales */}
              {editando._tipo !== "perfil" && (
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Clases este mes
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.clasesEsteMes}
                  onChange={(e) => setForm((f) => ({ ...f, clasesEsteMes: Number(e.target.value) }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30"
                />
              </div>
              )}

              {/* Próximo pago */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                  Próximo pago
                </label>
                <input
                  type="date"
                  value={form.proximoPago}
                  onChange={(e) => setForm((f) => ({ ...f, proximoPago: e.target.value }))}
                  className="w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
                />
              </div>

              {/* Activo toggle — solo alumnos normales */}
              {editando._tipo !== "perfil" && (
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Alumno activo
                </label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    form.activo ? "bg-green-600" : "bg-gray-700"
                  )}
                >
                  <span className={cn("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", form.activo ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>
              )}
            </div>}

            {/* Error */}
            {error && tab === "editar" && (
              <p className="mt-4 text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Acciones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={cerrarModal}
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:border-white/20 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              {tab === "editar" && (
                <button
                  onClick={guardar}
                  disabled={guardando}
                  className="flex-1 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  {guardando ? "Guardando…" : "Guardar cambios"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
