"use client";

/**
 * Tabla de alumnos con modal de edición.
 * Componente cliente — maneja estado del modal y llama a la API.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2, Baby, CalendarDays } from "lucide-react";
import { cn, colorCinturon, capitalizar } from "@/lib/utils";

type AsistenciaRec = { id: string; fecha: string; tipo: string };

function getMonthlyStats(registros: AsistenciaRec[]) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("es-MX", { month: "short", year: "2-digit" });
    const count = registros.filter((r) => r.fecha.startsWith(key)).length;
    return { key, label, count };
  });
}

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
      const res = await fetch(`/api/admin/usuarios/${u.id}`, { method: "DELETE" });
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
      const body: Record<string, unknown> = {
        cinturon:          form.cinturon,
        grados:            Number(form.grados),
        clasesCompletadas: Number(form.clasesCompletadas),
        proximoPago:       form.proximoPago ? new Date(form.proximoPago + "T12:00:00").toISOString() : null,
      };
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

  return (
    <>
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
            {usuarios.map((u) => (
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
              <div className="min-h-[200px]">
                {cargandoHistorial ? (
                  <p className="text-sm text-gray-500 text-center py-10">Cargando historial…</p>
                ) : historial === null ? null : historial.length === 0 ? (
                  <p className="text-sm text-gray-600 text-center py-10">Sin registros de asistencia.</p>
                ) : (
                  <div className="space-y-5">
                    {/* Barras mensuales */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Últimos 6 meses</p>
                      {(() => {
                        const stats = getMonthlyStats(historial);
                        const max = Math.max(...stats.map((s) => s.count), 1);
                        return (
                          <div className="space-y-2">
                            {stats.map((s) => (
                              <div key={s.key} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-14 shrink-0 capitalize">{s.label}</span>
                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                  <div
                                    className="bg-red-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(s.count / max) * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-white w-5 text-right shrink-0">{s.count}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    {/* Lista de clases recientes */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Clases recientes</p>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {historial.slice(0, 20).map((r) => (
                          <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-950 px-3 py-2">
                            <span className="text-xs text-gray-400">{r.fecha}</span>
                            <span className="text-xs font-semibold uppercase text-red-400 bg-red-900/20 px-2 py-0.5 rounded-full">
                              {r.tipo}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
