import { signOut } from "@/lib/auth";

/**
 * GET /api/signout
 * Usa el signOut de NextAuth v5 para invalidar la sesión correctamente.
 * Solo NextAuth sabe exactamente qué cookies borrar y con qué atributos.
 */
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
