import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findByQuery, updateItem, deleteItem, CONTAINERS } from "@/lib/azure/cosmos";
import { z } from "zod";
import type { PerfilHijo } from "@/types";

const graduacionSchema = z.object({
  fecha:            z.string(),
  cinturonAnterior: z.string(),
  gradosAnterior:   z.number(),
  cinturonNuevo:    z.string(),
  gradosNuevo:      z.number(),
});

const schema = z.object({
  cinturon:               z.string().optional(),
  grados:                 z.number().min(0).max(4).optional(),
  clasesCompletadas:      z.number().min(0).optional(),
  clasesEsteMes:          z.number().min(0).optional(),
  proximoPago:            z.string().nullable().optional(),
  activo:                 z.boolean().optional(),
  nombre:                 z.string().optional(),
  rol:                    z.enum(["alumno", "instructor", "admin"]).optional(),
  historialGraduaciones:  z.array(graduacionSchema).optional(),
  // Para editar un perfil de hijo dentro de un padre
  perfilId:               z.string().optional(),
  // Para eliminar un perfil de hijo
  eliminarPerfilId:       z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any; // eslint-disable-line
  const rolSesion = session?.user?.rol ?? "";
  if (!session?.user || !["admin", "instructor"].includes(rolSesion)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body   = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos", detail: result.error.message }, { status: 400 });
  }

  const { perfilId, eliminarPerfilId, ...campos } = result.data;

  try {
    // ── Eliminar perfil de hijo ────────────────────────────────────────────
    if (eliminarPerfilId) {
      const padres = await findByQuery<{ id: string; perfiles?: PerfilHijo[] }>(
        CONTAINERS.USUARIOS,
        "SELECT * FROM c WHERE c.id = @id",
        [{ name: "@id", value: id }]
      );
      const padre = padres[0];
      if (!padre) return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 });

      const perfiles = (padre.perfiles ?? []).filter((p) => p.id !== eliminarPerfilId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updateItem(CONTAINERS.USUARIOS, id, { perfiles } as any);
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Editar perfil de hijo (dentro de un documento padre) ───────────────
    if (perfilId) {
      const padres = await findByQuery<{ id: string; perfiles?: PerfilHijo[] }>(
        CONTAINERS.USUARIOS,
        "SELECT * FROM c WHERE c.id = @id",
        [{ name: "@id", value: id }]
      );
      const padre = padres[0];
      if (!padre) return NextResponse.json({ error: "Padre no encontrado" }, { status: 404 });

      const perfiles = (padre.perfiles ?? []).map((p) =>
        p.id === perfilId ? { ...p, ...campos } : p
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updated = await updateItem(CONTAINERS.USUARIOS, id, { perfiles } as any);
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Editar usuario normal ───────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await updateItem(CONTAINERS.USUARIOS, id, campos as any);
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error("[PATCH /api/admin/usuarios]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any; // eslint-disable-line
  if (session?.user?.rol !== "admin")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteItem(CONTAINERS.USUARIOS, id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
