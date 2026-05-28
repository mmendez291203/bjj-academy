"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Clase = {
  id:              string;
  nombre:          string;
  tipo:            "gi" | "no-gi" | "kids";
  dia:             string;
  horaInicio:      string;
  horaFin:         string;
  instructor:      string;
  capacidadMaxima: number;
  descripcion:     string;
  activa:          boolean;
};

type FormData = Omit<Clase, "id">;

const DIAS = [
  { value: "lunes",     label: "Lunes"     },
  { value: "martes",    label: "Martes"    },
  { value: "miercoles", label: "Miércoles" },
  { value: "jueves",    label: "Jueves"    },
  { value: "viernes",   label: "Viernes"   },
  { value: "sabado",    label: "Sábado"    },
  { value: "domingo",   label: "Domingo"   },
];

const DIAS_ORDER = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
const DIAS_LABEL: Record<string, string> = {
  lunes:"Lunes", martes:"Martes", miercoles:"Miércoles",
  jueves:"Jueves", viernes:"Viernes", sabado:"Sábado", domingo:"Domingo",
};

const TIPO_BADGE: Record<string, string> = {
  gi:     "bg-blue-900/60 text-blue-300",
  "no-gi":"bg-orange-900/60 text-orange-300",
  kids:   "bg-purple-900/60 text-purple-300",
};

const VACÍO: FormData = {
  nombre: "", tipo: "gi", dia: "lunes",
  horaInicio: "19:30", horaFin: "21:00",
  instructor: "Carlos Alberto Donado Nadales",
  capacidadMaxima: 20, descripcion: "", activa: true,
};

const field = "w-full bg-gray-900 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30";
const label = "block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider";

export default function AdminClasesPage() {
  const [clases,    setClases]    = useState<Clase[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editando,  setEditando]  = useState<Clase | null>(null);
  const [form,      setForm]      = useState<FormData>(VACÍO);
  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState("");

  async function cargar() {
    setCargando(true);
    const res  = await fetch("/api/admin/clases");
    const data = await res.json();
    if (data.success) setClases(data.data);
    setCargando(false);
  }
  useEffect(() => { cargar(); }, []);

  function abrirNueva() {
    setEditando(null);
    setForm(VACÍO);
    setError("");
    setModal(true);
  }

  function abrirEditar(c: Clase) {
    setEditando(c);
    setForm({
      nombre: c.nombre, tipo: c.tipo, dia: c.dia,
      horaInicio: c.horaInicio, horaFin: c.horaFin,
      instructor: c.instructor, capacidadMaxima: c.capacidadMaxima,
      descripcion: c.descripcion ?? "", activa: c.activa,
    });
    setError("");
    setModal(true);
  }

  function set(field: keyof FormData, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function guardar() {
    setGuardando(true);
    setError("");
    const url    = editando ? `/api/admin/clases/${editando.id}` : "/api/admin/clases";
    const method = editando ? "PATCH" : "POST";
    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, capacidadMaxima: Number(form.capacidadMaxima) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      setModal(false);
      cargar();
    } catch {
      setError("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  }

  async function toggleActiva(c: Clase) {
    await fetch(`/api/admin/clases/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activa: !c.activa }),
    });
    cargar();
  }

  async function eliminar(c: Clase) {
    if (!confirm(`¿Eliminar "${c.nombre}" del ${DIAS_LABEL[c.dia]}?`)) return;
    await fetch(`/api/admin/clases/${c.id}`, { method: "DELETE" });
    cargar();
  }

  // Agrupar por día
  const porDia = DIAS_ORDER.reduce<Record<string, Clase[]>>((acc, dia) => {
    const del_dia = clases.filter((c) => c.dia === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
    if (del_dia.length) acc[dia] = del_dia;
    return acc;
  }, {});

  return (
    <div className="p-6 sm:p-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Horario de clases</h1>
          <p className="text-sm text-gray-500 mt-1">Agrega, edita o elimina clases del horario</p>
        </div>
        <button
          onClick={abrirNueva}
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva clase
        </button>
      </div>

      {/* Lista */}
      {cargando ? (
        <div className="text-center py-20 text-gray-600 text-sm">Cargando…</div>
      ) : Object.keys(porDia).length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="mb-4">No hay clases en el horario.</p>
          <button onClick={abrirNueva} className="text-white text-sm underline">
            Agregar la primera →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(porDia).map(([dia, clasesDelDia]) => (
            <div key={dia}>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                {DIAS_LABEL[dia]}
              </h2>
              <div className="space-y-2">
                {clasesDelDia.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border px-5 py-4 transition-colors",
                      c.activa
                        ? "border-white/8 bg-gray-950"
                        : "border-white/4 bg-gray-950/50 opacity-60"
                    )}
                  >
                    {/* Badge tipo */}
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
                      TIPO_BADGE[c.tipo]
                    )}>
                      {c.tipo === "gi" ? "Gi" : c.tipo === "no-gi" ? "No-Gi" : "Kids"}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{c.nombre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.horaInicio} – {c.horaFin} · {c.instructor}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle activa */}
                      <button
                        onClick={() => toggleActiva(c)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
                          c.activa ? "bg-green-600" : "bg-gray-700"
                        )}
                        title={c.activa ? "Desactivar" : "Activar"}
                      >
                        <span className={cn(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                          c.activa ? "translate-x-4" : "translate-x-0.5"
                        )} />
                      </button>

                      {/* Editar */}
                      <button
                        onClick={() => abrirEditar(c)}
                        className="p-2 text-gray-600 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => eliminar(c)}
                        className="p-2 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-900/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal ──────────────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-gray-950 border border-white/10 rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">

            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-white font-bold">
                {editando ? "Editar clase" : "Nueva clase"}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">

              {/* Nombre */}
              <div>
                <label className={label}>Nombre de la clase</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Ej: BJJ Gi, Open Mat, Kids…"
                  className={field}
                />
              </div>

              {/* Tipo + Día */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Tipo</label>
                  <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)} className={field}>
                    <option value="gi">Gi</option>
                    <option value="no-gi">No-Gi</option>
                    <option value="kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Día</label>
                  <select value={form.dia} onChange={(e) => set("dia", e.target.value)} className={field}>
                    {DIAS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Hora inicio</label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => set("horaInicio", e.target.value)}
                    className={cn(field, "[color-scheme:dark]")}
                  />
                </div>
                <div>
                  <label className={label}>Hora fin</label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={(e) => set("horaFin", e.target.value)}
                    className={cn(field, "[color-scheme:dark]")}
                  />
                </div>
              </div>

              {/* Instructor + Capacidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Instructor</label>
                  <input
                    type="text"
                    value={form.instructor}
                    onChange={(e) => set("instructor", e.target.value)}
                    className={field}
                  />
                </div>
                <div>
                  <label className={label}>Capacidad máx.</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.capacidadMaxima}
                    onChange={(e) => set("capacidadMaxima", Number(e.target.value))}
                    className={field}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className={label}>Descripción <span className="text-gray-600 normal-case">(opcional)</span></label>
                <textarea
                  rows={2}
                  value={form.descripcion}
                  onChange={(e) => set("descripcion", e.target.value)}
                  placeholder="Breve descripción de la clase…"
                  className={cn(field, "resize-none")}
                />
              </div>

              {/* Activa */}
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-900 px-4 py-3">
                <span className="text-sm text-gray-400">Clase activa</span>
                <button
                  type="button"
                  onClick={() => set("activa", !form.activa)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    form.activa ? "bg-green-600" : "bg-gray-700"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    form.activa ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Footer modal */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando || !form.nombre || !form.instructor}
                className="flex-1 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Agregar clase"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
