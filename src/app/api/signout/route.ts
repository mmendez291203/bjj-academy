import { NextResponse } from "next/server";

/**
 * GET /api/signout
 * Borra las cookies de sesión de NextAuth v5 y redirige al login.
 */
export async function GET() {
  // Usar NEXTAUTH_URL para evitar redirigir a la IP interna de Azure (0.0.0.0:8080)
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://bjj-academy-app.azurewebsites.net";
  const loginUrl = `${baseUrl}/login`;

  const response = NextResponse.redirect(loginUrl);

  // Borrar todas las variantes de cookie de sesión (v4 y v5, http y https)
  response.cookies.delete("authjs.session-token");
  response.cookies.delete("__Secure-authjs.session-token");
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.session-token");

  return response;
}
