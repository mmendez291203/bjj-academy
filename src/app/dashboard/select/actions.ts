"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function seleccionarPerfil(perfilId: string) {
  const jar = await cookies();
  jar.set("bjj_perfil_id", perfilId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   8 * 60 * 60, // 8 horas (igual que la sesión)
    path:     "/",
    sameSite: "lax",
  });
  redirect("/dashboard");
}
