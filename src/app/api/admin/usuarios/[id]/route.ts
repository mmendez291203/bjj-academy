/**
 * PATCH /api/admin/usuarios/[id]
 * Actualiza los datos de un alumno (cinturón, grados, clases, pago, estado).
 * Solo accesible por admins — validado con la sesión de NextAuth.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateItem, CONTAINERS } from "@/lib/azure/cosmos";
import { z } from "zod";

const schema = z.object({
  cinturon:          z.string().optional(),
  grados:            z.number().min(0).max(4).optional(),
  clasesCompletadas: z.number().min(0).optional(),
  clasesEsteMes:     z.number().min(0).optional(),
  proximoPago:       z.string().nullable().optional(),
  activo:            z.boolean().optional(),
  nombre:            z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar que el usuario es admin
  const session = await auth();
  if (!session || session.user?.rol !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detail: result.error.message },
      { status: 400 }
    );
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await updateItem(CONTAINERS.USUARIOS, id, result.data as any);
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/usuarios]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
