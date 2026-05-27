import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación
const RUTAS_PROTEGIDAS = ["/dashboard", "/progreso", "/pagos", "/galeria"];

// Rutas solo para usuarios sin sesión
const RUTAS_PUBLICAS_SOLO = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth guarda la sesión en una de estas cookies
  const sessionCookie =
    request.cookies.get("next-auth.session-token") ??
    request.cookies.get("__Secure-next-auth.session-token");

  const tieneSesion = !!sessionCookie;

  // Sin sesión en ruta protegida → login
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));
  if (esProtegida && !tieneSesion) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión en /login → dashboard
  const esSoloPublica = RUTAS_PUBLICAS_SOLO.some((r) => pathname.startsWith(r));
  if (esSoloPublica && tieneSesion) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

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
