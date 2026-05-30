"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, User, Users } from "lucide-react";

// ─── Schemas ──────────────────────────────────────────────────────────────────
const schemaAdulto = z.object({
  nombre:             z.string().min(2, "Mínimo 2 caracteres"),
  apellido:           z.string().min(2, "Mínimo 2 caracteres"),
  email:              z.string().email("Email inválido"),
  telefono:           z.string().min(8, "Mínimo 8 dígitos").regex(/^[\d\s\-()]+$/, "Solo números"),
  edad:               z.string().min(1, "Obligatorio").refine((v) => { const n = Number(v); return !isNaN(n) && n >= 4 && n <= 99; }, "Entre 4 y 99 años"),
  experienciaPrevia:  z.boolean(),
  claseInteres:       z.enum(["gi", "no-gi", "open-mat", "kids"]),
  mensaje:            z.string().optional(),
  comoNosEncontraste: z.string().optional(),
});

const schemaKids = z.object({
  nombreHijo: z.string().min(2, "Mínimo 2 caracteres"),
  apellido:   z.string().min(2, "Mínimo 2 caracteres"),
  emailPapa:  z.string().email("Email inválido"),
  telefono:   z.string().min(8, "Mínimo 8 dígitos").regex(/^[\d\s\-()]+$/, "Solo números"),
  edadHijo:   z.string().min(1, "Obligatorio").refine((v) => { const n = Number(v); return !isNaN(n) && n >= 3 && n <= 15; }, "Entre 3 y 15 años"),
});

type FormAdulto = z.infer<typeof schemaAdulto>;
type FormKids   = z.infer<typeof schemaKids>;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all";

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Exito({ titulo, desc }: { titulo: string; desc: string }) {
  return (
    <div className="text-center py-10">
      <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">{titulo}</h2>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

// ─── Formulario adulto ────────────────────────────────────────────────────────
function FormAdultoSection() {
  const [enviado, setEnviado]   = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormAdulto>({
    resolver: zodResolver(schemaAdulto),
    defaultValues: { experienciaPrevia: false, claseInteres: "gi" },
  });

  const onSubmit = async (data: FormAdulto) => {
    setErrorApi(null);
    try {
      const res  = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, edad: Number(data.edad), tipo: "adulto" }),
      });
      const json = await res.json();
      if (!res.ok) { setErrorApi(json.error ?? "Error al enviar"); return; }
      setEnviado(true);
    } catch {
      setErrorApi("Error de conexión. Intenta de nuevo.");
    }
  };

  if (enviado) return (
    <Exito
      titulo="¡Inscripción recibida! 🥋"
      desc="Te contactaremos en las próximas 24 horas para agendar tu clase. ¡Bienvenido a la familia!"
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorApi && (
        <div className="rounded-lg bg-red-950/40 border border-red-800 text-red-300 px-4 py-3 text-sm">❌ {errorApi}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre" required error={errors.nombre?.message}>
          <input {...register("nombre")} placeholder="Juan" className={cn(inputClass, errors.nombre && "border-red-700")} />
        </Field>
        <Field label="Apellido" required error={errors.apellido?.message}>
          <input {...register("apellido")} placeholder="Pérez" className={cn(inputClass, errors.apellido && "border-red-700")} />
        </Field>
      </div>

      <Field label="Email" required error={errors.email?.message}>
        <input {...register("email")} type="email" placeholder="juan@email.com" className={cn(inputClass, errors.email && "border-red-700")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono" required error={errors.telefono?.message}>
          <input {...register("telefono")} type="tel" placeholder="+52 555 000 0000" className={cn(inputClass, errors.telefono && "border-red-700")} />
        </Field>
        <Field label="Edad" required error={errors.edad?.message}>
          <input {...register("edad")} type="number" min={4} max={99} placeholder="25" className={cn(inputClass, errors.edad && "border-red-700")} />
        </Field>
      </div>

      <Field label="Clase de interés" required error={errors.claseInteres?.message}>
        <select {...register("claseInteres")} className={cn(inputClass, "cursor-pointer")}>
          <option value="gi">BJJ Gi (con kimono)</option>
          <option value="no-gi">BJJ No-Gi (sin kimono)</option>
          <option value="open-mat">Open Mat</option>
          <option value="kids">Kids BJJ</option>
        </select>
      </Field>

      <div className="flex items-center gap-3">
        <input {...register("experienciaPrevia")} type="checkbox" id="exp" className="w-4 h-4 rounded border-white/20 bg-black text-red-600 focus:ring-red-600" />
        <label htmlFor="exp" className="text-sm text-gray-300 cursor-pointer">Tengo experiencia previa en artes marciales</label>
      </div>

      <Field label="¿Cómo nos encontraste?" error={errors.comoNosEncontraste?.message}>
        <select {...register("comoNosEncontraste")} className={cn(inputClass, "cursor-pointer")}>
          <option value="">Selecciona una opción...</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google</option>
          <option value="recomendacion">Recomendación</option>
          <option value="facebook">Facebook</option>
          <option value="youtube">YouTube</option>
          <option value="otro">Otro</option>
        </select>
      </Field>

      <Field label="Mensaje adicional" error={errors.mensaje?.message}>
        <textarea {...register("mensaje")} rows={3} placeholder="¿Alguna pregunta?" className={cn(inputClass, "resize-none")} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Reservar mi clase gratis →"}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Al enviar aceptas nuestra{" "}
        <a href="/privacidad" className="text-gray-400 hover:text-white underline">política de privacidad</a>.
      </p>
    </form>
  );
}

// ─── Formulario kids ──────────────────────────────────────────────────────────
function FormKidsSection() {
  const [enviado, setEnviado]   = useState(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormKids>({
    resolver: zodResolver(schemaKids),
  });

  const onSubmit = async (data: FormKids) => {
    setErrorApi(null);
    try {
      const res  = await fetch("/api/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, edadHijo: Number(data.edadHijo), tipo: "kids" }),
      });
      const json = await res.json();
      if (!res.ok) { setErrorApi(json.error ?? "Error al enviar"); return; }
      setEnviado(true);
    } catch {
      setErrorApi("Error de conexión. Intenta de nuevo.");
    }
  };

  if (enviado) return (
    <Exito
      titulo="¡Solicitud recibida! 👦🥋"
      desc="El instructor revisará la solicitud y te contactará pronto para registrar a tu hijo/a."
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorApi && (
        <div className="rounded-lg bg-red-950/40 border border-red-800 text-red-300 px-4 py-3 text-sm">❌ {errorApi}</div>
      )}

      <div className="rounded-lg bg-blue-950/30 border border-blue-800/40 px-4 py-3 text-sm text-blue-300">
        📋 Completa los datos de tu hijo/a. El instructor creará su perfil en el sistema.
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Datos del hijo/a</p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre del hijo/a" required error={errors.nombreHijo?.message}>
          <input {...register("nombreHijo")} placeholder="Carlos" className={cn(inputClass, errors.nombreHijo && "border-red-700")} />
        </Field>
        <Field label="Apellido" required error={errors.apellido?.message}>
          <input {...register("apellido")} placeholder="García" className={cn(inputClass, errors.apellido && "border-red-700")} />
        </Field>
      </div>

      <Field label="Edad del hijo/a" required error={errors.edadHijo?.message}>
        <input {...register("edadHijo")} type="number" min={3} max={15} placeholder="8" className={cn(inputClass, errors.edadHijo && "border-red-700")} />
      </Field>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Datos del padre/madre</p>

      <Field label="Tu email (Google)" required error={errors.emailPapa?.message}>
        <input {...register("emailPapa")} type="email" placeholder="tu@gmail.com" className={cn(inputClass, errors.emailPapa && "border-red-700")} />
        <p className="text-xs text-gray-600 mt-1">Usa el mismo email con el que haces login para poder ver el progreso de tu hijo/a.</p>
      </Field>

      <Field label="Teléfono de contacto" required error={errors.telefono?.message}>
        <input {...register("telefono")} type="tel" placeholder="+52 555 000 0000" className={cn(inputClass, errors.telefono && "border-red-700")} />
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Registrar a mi hijo/a →"}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Al enviar aceptas nuestra{" "}
        <a href="/privacidad" className="text-gray-400 hover:text-white underline">política de privacidad</a>.
      </p>
    </form>
  );
}

// ─── Componente principal con tabs ────────────────────────────────────────────
export default function InscripcionForm() {
  const [tab, setTab] = useState<"adulto" | "kids">("adulto");

  return (
    <div>
      {/* Tabs */}
      <div className="flex rounded-xl bg-black/40 border border-white/10 p-1 mb-6 gap-1">
        <button
          onClick={() => setTab("adulto")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
            tab === "adulto" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <User className="w-4 h-4" />
          Primera clase gratis
        </button>
        <button
          onClick={() => setTab("kids")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all",
            tab === "kids" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          Registrar hijo/a
        </button>
      </div>

      {tab === "adulto" ? <FormAdultoSection /> : <FormKidsSection />}
    </div>
  );
}
