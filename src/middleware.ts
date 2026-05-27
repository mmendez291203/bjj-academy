import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Rutas que requieren autenticación
const RUTAS_PROTEGIDAS = ["/dashboard", "/progreso", "/pagos", "/galeria", "/admin"];

// Rutas solo para admin
const RUTAS_ADMIN = ["/admin"];

// Rutas solo para usuarios sin sesión
const RUTAS_PUBLICAS_SOLO = ["/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Sin sesión en ruta protegida → login
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));
  if (esProtegida && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Con sesión pero sin rol admin en ruta de admin → dashboard
  const esAdmin = RUTAS_ADMIN.some((r) => pathname.startsWith(r));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (esAdmin && (session as any)?.user?.rol !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Con sesión en /login → dashboard
  const esSoloPublica = RUTAS_PUBLICAS_SOLO.some((r) => pathname.startsWith(r));
  if (esSoloPublica && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

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
    "/admin",
    "/admin/:path*",
    "/login",
  ],
};
