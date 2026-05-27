"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";

// ─── Validación con Zod ───────────────────────────────────────────────────────
const schema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z
    .string()
    .email("Ingresa un email válido"),
  telefono: z
    .string()
    .min(10, "El teléfono debe tener al menos 10 dígitos")
    .regex(/^\+?[\d\s\-()]+$/, "Formato de teléfono inválido"),
  // React Hook Form envía el valor de <input type="number"> como string,
  // transformamos a número antes de validar.
  edad: z
    .string()
    .min(1, "La edad es obligatoria")
    .refine((v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 4 && n <= 99;
    }, "La edad debe estar entre 4 y 99 años"),
  experienciaPrevia: z.boolean(),
  claseInteres: z.enum(["gi", "no-gi", "wrestling", "fitness", "kids"]),
  mensaje: z.string().optional(),
  comoNosEncontraste: z.string().optional(),
});

// Tipo que usa el formulario (antes de transformar edad a number)
type FormData = z.infer<typeof schema>;

// Tipo final para el API (con edad como number)
type FormDataFinal = Omit<FormData, "edad"> & { edad: number };

// ─── Componente de campo reutilizable ─────────────────────────────────────────
function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
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

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all";

// ─── Formulario principal ─────────────────────────────────────────────────────
export default function InscripcionForm() {
  const [enviado, setEnviado] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experienciaPrevia: false, claseInteres: "gi" },
  });

  const onSubmit = async (data: FormData) => {
    // Convertir edad a número para el API
    const payload: FormDataFinal = { ...data, edad: Number(data.edad) };

    /**
     * INTEGRACIÓN REAL:
     * const res = await fetch("/api/inscripciones", {
     *   method: "POST",
     *   headers: { "Content-Type": "application/json" },
     *   body: JSON.stringify(payload),
     * });
     * if (!res.ok) throw new Error("Error al enviar");
     */

    // Demo: simulación de delay
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Inscripción enviada:", payload);
    setEnviado(true);
  };

  // ─── Estado de éxito ───────────────────────────────────────────────────────
  if (enviado) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          ¡Inscripción recibida! 🥋
        </h2>
        <p className="text-gray-400">
          Te contactaremos en las próximas 24 horas para agendar tu clase.
          ¡Bienvenido a la familia!
        </p>
      </div>
    );
  }

  // ─── Formulario ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="text-xl font-bold text-white mb-1">
        Formulario de inscripción
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Todos los campos marcados con * son obligatorios.
      </p>

      {/* Nombre y apellido */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre" required error={errors.nombre?.message}>
          <input
            {...register("nombre")}
            placeholder="Juan"
            className={cn(inputClass, errors.nombre && "border-red-700 focus:ring-red-700")}
          />
        </Field>
        <Field label="Apellido" required error={errors.apellido?.message}>
          <input
            {...register("apellido")}
            placeholder="Pérez"
            className={cn(inputClass, errors.apellido && "border-red-700 focus:ring-red-700")}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email" required error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="juan@email.com"
          className={cn(inputClass, errors.email && "border-red-700 focus:ring-red-700")}
        />
      </Field>

      {/* Teléfono y edad */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono" required error={errors.telefono?.message}>
          <input
            {...register("telefono")}
            type="tel"
            placeholder="+52 555 000 0000"
            className={cn(inputClass, errors.telefono && "border-red-700 focus:ring-red-700")}
          />
        </Field>
        <Field label="Edad" required error={errors.edad?.message}>
          <input
            {...register("edad")}
            type="number"
            min={4}
            max={99}
            placeholder="25"
            className={cn(inputClass, errors.edad && "border-red-700 focus:ring-red-700")}
          />
        </Field>
      </div>

      {/* Clase de interés */}
      <Field label="Clase de interés" required error={errors.claseInteres?.message}>
        <select
          {...register("claseInteres")}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="gi">BJJ Gi (con kimono)</option>
          <option value="no-gi">No-Gi (sin kimono)</option>
          <option value="wrestling">Wrestling & Takedowns</option>
          <option value="fitness">Fitness & Acondicionamiento</option>
          <option value="kids">Kids (6-12 años)</option>
        </select>
      </Field>

      {/* Experiencia previa */}
      <div className="flex items-center gap-3">
        <input
          {...register("experienciaPrevia")}
          type="checkbox"
          id="experiencia"
          className="w-4 h-4 rounded border-white/20 bg-black text-red-600 focus:ring-red-600"
        />
        <label htmlFor="experiencia" className="text-sm text-gray-300 cursor-pointer">
          Tengo experiencia previa en artes marciales
        </label>
      </div>

      {/* Cómo nos encontraste */}
      <Field label="¿Cómo nos encontraste?" error={errors.comoNosEncontraste?.message}>
        <select
          {...register("comoNosEncontraste")}
          className={cn(inputClass, "cursor-pointer")}
        >
          <option value="">Selecciona una opción...</option>
          <option value="instagram">Instagram</option>
          <option value="google">Google</option>
          <option value="recomendacion">Recomendación de amigo</option>
          <option value="facebook">Facebook</option>
          <option value="youtube">YouTube</option>
          <option value="otro">Otro</option>
        </select>
      </Field>

      {/* Mensaje adicional */}
      <Field label="Mensaje adicional" error={errors.mensaje?.message}>
        <textarea
          {...register("mensaje")}
          rows={3}
          placeholder="¿Alguna pregunta o comentario especial?"
          className={cn(inputClass, "resize-none")}
        />
      </Field>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          "Reservar mi clase gratis →"
        )}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Al enviar este formulario aceptas nuestra{" "}
        <a href="/privacidad" className="text-gray-400 hover:text-white underline">
          política de privacidad
        </a>.
      </p>
    </form>
  );
}
