/**
 * Configuración de NextAuth v5 (Auth.js)
 *
 * Google OAuth para login social.
 * El rol del usuario se lee de Cosmos DB y se guarda en el JWT.
 * Si el usuario inicia sesión por primera vez, se crea su documento
 * automáticamente con rol "alumno".
 */

import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { Alumno } from "@/types";
import { findAll, findByQuery, createItem } from "@/lib/azure/cosmos";

// ─── Extender tipos de NextAuth ───────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id:     string;
      rol:    Alumno["rol"];
      activo: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    rol?:    Alumno["rol"];
    activo?: boolean;
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

    // ─── Email + Password (demo) ─────────────────────────────────────────────
    Credentials({
      name: "Email y Contraseña",
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        if (account?.provider === "google") {
          try {
            const usuarios = await findAll<{
              id: string;
              email: string;
              rol: string;
              activo?: boolean;
            }>("usuarios");

            const dbUser = usuarios.find((u) => u.email === user.email);

            if (dbUser) {
              // Usuario existente → usar su rol y estado
              token.rol    = dbUser.rol    ?? "alumno";
              token.activo = dbUser.activo !== false; // false solo si explícitamente inactivo
            } else {
              // Primera vez → verificar si fue pre-aprobado vía inscripción
              let preAprobado = false;
              try {
                const inscrips = await findByQuery<{ id: string; estado?: string }>(
                  "inscripciones",
                  "SELECT * FROM c WHERE c.email = @email AND c.estado = @estado",
                  [
                    { name: "@email",  value: user.email ?? "" },
                    { name: "@estado", value: "admitido" },
                  ]
                );
                preAprobado = inscrips.length > 0;
              } catch {
                // Si falla la consulta, continúa con activo: false
              }

              await createItem("usuarios", {
                id:                `usr-${crypto.randomUUID()}`,
                email:             user.email ?? "",
                nombre:            user.name  ?? "",
                rol:               "alumno",
                cinturon:          "blanco",
                grados:            0,
                clasesCompletadas: 0,
                clasesEsteMes:     0,
                activo:            preAprobado, // true si el admin ya lo admitió
                creadoEn:          new Date().toISOString(),
              });
              token.rol    = "alumno";
              token.activo = preAprobado;
            }
          } catch {
            token.rol = "alumno";
          }
        } else {
          token.rol = user.rol ?? "alumno";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id     = token.id     as string;
      session.user.rol    = token.rol    as Alumno["rol"];
      session.user.activo = token.activo !== false; // default true
      return session;
    },
  },

  pages: {
    signIn:  "/login",
    signOut: "/",
    error:   "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas — si se desactiva un alumno, aplica en máximo 8h
  },

  // ⚠️  Necesario en Azure App Service
  trustHost: true,
});
