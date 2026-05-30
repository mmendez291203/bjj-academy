"use client";

import { useEffect, useState } from "react";
import { formatFecha } from "@/lib/utils";
import { CheckCircle, Clock, UserCheck, XCircle, Loader2, Eye, EyeOff, Baby } from "lucide-react";

type Inscripcion = {
  id: string;
  tipo?: "adulto" | "kids";
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  claseInteres?: string;
  estado?: string;
  createdAt?: string;
  creadoEn?: string;
  _ts?: number;
};

const CLASE_LABEL: Record<string, string> = {
  gi:         "Gi",
  "no-gi":    "No-Gi",
  "open-mat": "Open Mat",
  kids:       "Kids",
};

function EstadoBadge({ estado }: { estado?: string }) {
  if (estado === "admitido") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-900/40 text-green-400 border border-green-800/50">
        <CheckCircle className="w-3 h-3" />
        Admitido
      </span>
    );
  }
  if (estado === "rechazado") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-900/30 text-red-400 border border-red-800/40">
        <XCircle className="w-3 h-3" />
        Rechazado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-900/30 text-yellow-500 border border-yellow-800/40">
      <Clock className="w-3 h-3" />
      Pendiente
    </span>
  );
}

export default function InscripcionesPage() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading]             = useState(true);
  const [admitiendo, setAdmitiendo]       = useState<string | null>(null);
  const [rechazando, setRechazando]       = useState<string | null>(null);
  const [feedback, setFeedback]           = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [verProcesadas, setVerProcesadas] = useState(false);

  useEffect(() => {
    fetch("/api/admin/inscripciones")
      .then((r) => r.json())
      .then((json) => setInscripciones(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function admitir(id: string) {
    setAdmitiendo(id);
    setFeedback(null);
    try {
      const res  = await fetch(`/api/admin/inscripciones/${id}/admitir`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ id, msg: json.mensaje, ok: true });
        setTimeout(() => {
          setInscripciones((prev) =>
            prev.map((ins) => (ins.id === id ? { ...ins, estado: "admitido" } : ins))
          );
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ id, msg: json.error ?? "Error al admitir", ok: false });
      }
    } catch {
      setFeedback({ id, msg: "Error de conexión", ok: false });
    } finally {
      setAdmitiendo(null);
    }
  }

  async function rechazar(id: string) {
    setRechazando(id);
    setFeedback(null);
    try {
      const res  = await fetch(`/api/admin/inscripciones/${id}/rechazar`, { method: "POST" });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ id, msg: json.mensaje, ok: false });
        setTimeout(() => {
          setInscripciones((prev) =>
            prev.map((ins) => (ins.id === id ? { ...ins, estado: "rechazado" } : ins))
          );
          setFeedback(null);
        }, 1500);
      } else {
        setFeedback({ id, msg: json.error ?? "Error al rechazar", ok: false });
      }
    } catch {
      setFeedback({ id, msg: "Error de conexión", ok: false });
    } finally {
      setRechazando(null);
    }
  }

  const pendientes  = inscripciones.filter((i) => !i.estado || i.estado === "pendiente");
  const admitidos   = inscripciones.filter((i) => i.estado === "admitido");
  const rechazados  = inscripciones.filter((i) => i.estado === "rechazado");
  const procesadas  = inscripciones.filter((i) => i.estado === "admitido" || i.estado === "rechazado");

  const visibles = verProcesadas ? inscripciones : pendientes;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Inscripciones</h1>
        <p className="text-gray-400 mt-1">{inscripciones.length} solicitud{inscripciones.length !== 1 ? "es" : ""} en total</p>

        {/* Stats */}
        {inscripciones.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-400">{pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/20 border border-green-800/30">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-green-400">{admitidos.length} admitido{admitidos.length !== 1 ? "s" : ""}</span>
            </div>
            {rechazados.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-800/30">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-red-400">{rechazados.length} rechazado{rechazados.length !== 1 ? "s" : ""}</span>
              </div>
            )}
            {procesadas.length > 0 && (
              <button
                onClick={() => setVerProcesadas((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-white/10 transition-colors"
              >
                {verProcesadas ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                <span className="text-xs font-semibold text-gray-400">
                  {verProcesadas ? "Ocultar procesadas" : "Ver todas"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
        </div>
      ) : pendientes.length === 0 && !verProcesadas ? (
        <div className="text-center py-20 text-gray-600">
          <CheckCircle className="w-8 h-8 mx-auto mb-3 text-gray-700" />
          <p>No hay solicitudes pendientes.</p>
          {procesadas.length > 0 && (
            <button
              onClick={() => setVerProcesadas(true)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
            >
              Ver {procesadas.length} solicitud{procesadas.length !== 1 ? "es" : ""} procesada{procesadas.length !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-950 border-b border-white/5">
                <tr>
                  {["Nombre", "Email", "Teléfono", "Clase", "Estado", "Fecha", "Acción"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibles.map((ins) => {
                  const procesada = ins.estado === "admitido" || ins.estado === "rechazado";
                  const fecha = ins.createdAt ?? ins.creadoEn;

                  return (
                    <>
                      <tr
                        key={ins.id}
                        className={procesada ? "opacity-50 hover:opacity-70 transition-opacity" : "hover:bg-white/[0.02] transition-colors"}
                      >
                        <td className="px-4 py-3 text-white font-medium">
                          <div className="flex items-center gap-2">
                            {ins.nombre}{ins.apellido ? ` ${ins.apellido}` : ""}
                            {ins.tipo === "kids" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-900/40 text-purple-400 border border-purple-800/40">
                                <Baby className="w-3 h-3" /> Kids
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{ins.email ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{ins.telefono ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {ins.claseInteres ? (CLASE_LABEL[ins.claseInteres] ?? ins.claseInteres) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <EstadoBadge estado={ins.estado} />
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {fecha
                            ? formatFecha(fecha)
                            : ins._ts
                            ? formatFecha(new Date(ins._ts * 1000).toISOString())
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {procesada ? (
                            <span className="text-xs text-gray-600 italic">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => admitir(ins.id)}
                                disabled={admitiendo === ins.id || rechazando === ins.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
                              >
                                {admitiendo === ins.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                                {ins.tipo === "kids" ? "Crear perfil" : "Admitir"}
                              </button>
                              <button
                                onClick={() => rechazar(ins.id)}
                                disabled={admitiendo === ins.id || rechazando === ins.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white text-xs font-semibold transition-colors"
                              >
                                {rechazando === ins.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                Rechazar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {feedback?.id === ins.id && (
                        <tr key={`${ins.id}-feedback`}>
                          <td colSpan={7} className="px-4 py-2">
                            <p className={`text-xs font-medium ${feedback.ok ? "text-green-400" : "text-red-400"}`}>
                              {feedback.msg}
                            </p>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
