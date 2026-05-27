import type { Metadata } from "next";
import InscripcionForm from "@/components/inscripciones/InscripcionForm";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Inscripciones — Primera clase gratis",
  description: "Regístrate para tu primera clase de prueba completamente gratis. Sin compromiso.",
};

const beneficios = [
  "Primera clase 100% gratis, sin tarjeta de crédito",
  "Kimono prestado para tu primera visita",
  "Evaluación gratuita de tu nivel",
  "Conoce el equipo y la academia sin presión",
  "Respuesta en menos de 24 horas",
];

export default function InscripcionesPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ─── Columna izquierda: info ─────────────────────────────── */}
          <div className="lg:sticky lg:top-28">
            <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
              Tu primera clase{" "}
              <span className="text-red-400">es gratis</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Completa el formulario y uno de nuestros instructores te contactará
              para agendar tu clase de prueba.
            </p>

            <ul className="space-y-3 mb-10">
              {beneficios.map((b) => (
                <li key={b} className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            {/* Horarios highlight */}
            <div className="rounded-xl border border-white/5 bg-gray-950 p-5">
              <h3 className="text-white font-semibold mb-3">⏰ Horarios disponibles</h3>
              <div className="text-sm text-gray-400 space-y-1.5">
                <p>🌅 <strong className="text-gray-300">Mañana:</strong> 7:00 – 8:30 am (Lun/Mié/Vie)</p>
                <p>🌆 <strong className="text-gray-300">Noche:</strong> 7:00 – 10:00 pm (Lun–Vie)</p>
                <p>☀️ <strong className="text-gray-300">Sábado:</strong> 9:00 am – 12:00 pm</p>
              </div>
            </div>
          </div>

          {/* ─── Columna derecha: formulario ──────────────────────────── */}
          <div className="rounded-2xl border border-white/5 bg-gray-950 p-6 sm:p-8">
            <InscripcionForm />
          </div>
        </div>
      </div>
    </div>
  );
}
