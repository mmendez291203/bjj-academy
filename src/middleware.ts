import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const RUTAS_PROTEGIDAS   = ["/dashboard", "/progreso", "/pagos", "/galeria", "/admin"];
const RUTAS_PUBLICAS_SOLO = ["/login"];

// Roles con acceso al panel de administración
const ROLES_ADMIN = ["admin", "instructor"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = req.auth as any;
  const rol: string = session?.user?.rol ?? "";

  // Sin sesión en ruta protegida → login
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => pathname.startsWith(r));
  if (esProtegida && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Ruta de admin: solo admin e instructor
  if (pathname.startsWith("/admin")) {
    if (!ROLES_ADMIN.includes(rol)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
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
