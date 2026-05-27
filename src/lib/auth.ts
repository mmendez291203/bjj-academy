/**
 * Configuración de NextAuth v5 (Auth.js)
 *
 * Soporta:
 * - Google OAuth para login social
 * - Credentials (email + password) para login manual
 *
 * El rol del usuario se guarda en el JWT token y se propaga a la sesión.
 * Documentación: https://authjs.dev/
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Alumno } from "@/types";
import { findAll } from "@/lib/azure/cosmos";

// ─── Extender tipos de NextAuth ───────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: Alumno["rol"];
    } & DefaultSession["user"];
  }
  interface User {
    rol?: Alumno["rol"];
  }
}

// ─── Configuración ────────────────────────────────────────────────────────────
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ─── Google OAuth ───────────────────────────────────────────────────────
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // ─── Email + Password ────────────────────────────────────────────────────
    Credentials({
      name: "Email y Contraseña",
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        /**
         * INTEGRACIÓN CON COSMOS DB:
         * Aquí buscarías al alumno en Cosmos DB y verificarías la contraseña con bcrypt.
         *
         * import { findAll, CONTAINERS } from "@/lib/azure/cosmos"
         * import bcrypt from "bcryptjs"
         *
         * const alumnos = await findAll<Alumno & { passwordHash: string }>(CONTAINERS.ALUMNOS)
         * const alumno = alumnos.find(a => a.email === credentials.email)
         * if (!alumno) return null
         * const valido = await bcrypt.compare(credentials.password as string, alumno.passwordHash)
         * if (!valido) return null
         * return { id: alumno.id, name: alumno.nombre, email: alumno.email, rol: alumno.rol }
         */

        // Demo: acepta cualquier email con contraseña "bjj123"
        if (credentials?.password === "bjj123") {
          return {
            id: "demo-user-1",
            name: "Alumno Demo",
            email: credentials.email as string,
            rol: "alumno" as const,
          };
        }
        return null;
      },
    }),
  ],

  callbacks: {
    // Agrega el ID y rol al JWT token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        // Para login con Google: buscar el rol en Cosmos DB
        if (account?.provider === "google") {
          try {
            const usuarios = await findAll<{ email: string; rol: string }>("usuarios");
            const dbUser   = usuarios.find((u) => u.email === user.email);
            token.rol      = dbUser?.rol ?? "alumno";
          } catch {
            token.rol = "alumno";
          }
        } else {
          token.rol = user.rol ?? "alumno";
        }
      }
      return token;
    },

    // Propaga el ID y rol a la sesión del cliente
    async session({ session, token }) {
      session.user.id  = token.id as string;
      session.user.rol = token.rol as Alumno["rol"];
      return session;
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },

  session: { strategy: "jwt" },

  // ⚠️  Necesario en Azure App Service: el servidor corre en 0.0.0.0:8080
  // internamente pero el dominio público viene en el header X-Forwarded-Host.
  // trustHost le dice a NextAuth que confíe en ese header para construir
  // las URLs de callback de OAuth.
  trustHost: true,
});
