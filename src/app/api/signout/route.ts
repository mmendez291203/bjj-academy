import { NextResponse } from "next/server";

/**
 * GET /api/signout
 * Borra las cookies de sesión de NextAuth y redirige al login.
 * Más confiable que server actions en producción standalone.
 */
export async function GET(request: Request) {
  const loginUrl = new URL("/login", request.url);

  const response = NextResponse.redirect(loginUrl);

  // Borrar ambas variantes de la cookie de sesión (http y https)
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token");

  return response;
}
