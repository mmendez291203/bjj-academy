/**
 * Middleware de Next.js — Protección de rutas
 *
 * Se ejecuta en el Edge Runtime ANTES de que se procese la request.
 * Redirige a /login si el usuario intenta acceder a rutas protegidas sin sesión.
 *
 * Documentación: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const RUTAS_PROTEGIDAS = ["/dashboard", "/progreso", "/pagos", "/galeria"];

// Rutas que NO deben ser accesibles si ya hay sesión (login)
const RUTAS_PUBLICAS_SOLO = ["/login"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Si intenta acceder a ruta protegida sin sesión → redirigir a login
  const esRutaProtegida = RUTAS_PROTEGIDAS.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (esRutaProtegida && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si ya tiene sesión y va al login → redirigir al dashboard
  const esRutaSoloPublica = RUTAS_PUBLICAS_SOLO.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (esRutaSoloPublica && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configura en qué rutas aplica el middleware
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/progreso",
    "/progreso/:path*",
    "/pagos",
    "/pagos/:path*",
    "/galeria",
    "/galeria/:path*",
    "/login",
  ],
};
