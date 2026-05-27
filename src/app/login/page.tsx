"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

// ─── Mensajes de error por código ────────────────────────────────────────────
const ERRORES: Record<string, { titulo: string; detalle: string }> = {
  inactivo: {
    titulo:  "Cuenta no activada",
    detalle: "Tu cuenta aún no ha sido activada. Si ya te inscribiste, contacta al instructor para que la habilite.",
  },
  OAuthAccountNotLinked: {
    titulo:  "Cuenta ya registrada",
    detalle: "Este email ya está vinculado con otro método de login.",
  },
  default: {
    titulo:  "Error al iniciar sesión",
    detalle: "Ocurrió un error inesperado. Intenta nuevamente.",
  },
};

// ─── Componente interno que usa useSearchParams ───────────────────────────────
function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/dashboard";
  const errorCode    = searchParams.get("error") ?? "";
  const [loading, setLoading] = useState(false);

  const error = errorCode
    ? (ERRORES[errorCode] ?? ERRORES.default)
    : null;

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-2">RUNAJERABJJ</h1>
          <p className="text-gray-400 text-sm">Portal del Alumno</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-gray-950 p-8 shadow-xl">
          <h2 className="text-white font-bold text-xl mb-2 text-center">Iniciar sesión</h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Accede con tu cuenta de Google para ver tu progreso, pagos y más.
          </p>

          {/* Aviso de error (cuenta inactiva u otro) */}
          {error && (
            <div className="mb-6 flex gap-3 rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-300">{error.titulo}</p>
                <p className="text-xs text-red-400/80 mt-0.5">{error.detalle}</p>
              </div>
            </div>
          )}

          {/* Botón Google — solo si no está inactivo */}
          {errorCode !== "inactivo" && (
            <Button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? "Redirigiendo..." : "Continuar con Google"}
            </Button>
          )}

          {/* Si está inactivo: solo opción de contactar */}
          {errorCode === "inactivo" && (
            <a
              href="https://wa.me/50660864646"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar al instructor por WhatsApp
            </a>
          )}

          <p className="text-xs text-gray-600 text-center mt-6">
            ¿Aún no eres alumno?{" "}
            <a href="/inscripciones" className="text-gray-500 hover:text-gray-400 underline underline-offset-2">
              Solicita tu clase gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Page con Suspense (requerido por useSearchParams) ────────────────────────
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
