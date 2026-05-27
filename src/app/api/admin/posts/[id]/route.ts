import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateItem, deleteItem, CONTAINERS } from "@/lib/azure/cosmos";

const schema = z.object({
  titulo:           z.string().min(3).optional(),
  resumen:          z.string().min(10).optional(),
  contenido:        z.string().optional(),
  categoria:        z.enum(["tecnicas", "competencias", "noticias", "nutricion", "consejos"]).optional(),
  autor:            z.string().optional(),
  imagen:           z.string().optional(),
  publicado:        z.boolean().optional(),
  fechaPublicacion: z.string().optional(),
  tags:             z.array(z.string()).optional(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkAdmin(session: any) {
  const rol = session?.user?.rol ?? "";
  return !!session?.user && ["admin", "instructor"].includes(rol);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await updateItem(CONTAINERS.POSTS, id, result.data as any);
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await deleteItem(CONTAINERS.POSTS, id);
  return NextResponse.json({ success: true });
}
