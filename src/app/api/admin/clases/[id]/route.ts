import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { updateItem, deleteItem, CONTAINERS } from "@/lib/azure/cosmos";

const schema = z.object({
  nombre:          z.string().min(2).optional(),
  tipo:            z.enum(["gi", "no-gi", "kids"]).optional(),
  nivel:           z.enum(["principiante", "intermedio", "avanzado", "todos", "kids"]).optional(),
  dia:             z.enum(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]).optional(),
  horaInicio:      z.string().regex(/^\d{2}:\d{2}$/).optional(),
  horaFin:         z.string().regex(/^\d{2}:\d{2}$/).optional(),
  instructor:      z.string().min(2).optional(),
  capacidadMaxima: z.number().int().min(1).max(100).optional(),
  descripcion:     z.string().optional(),
  activa:          z.boolean().optional(),
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
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const updated = await updateItem(CONTAINERS.CLASES, id, result.data as any); // eslint-disable-line
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await deleteItem(CONTAINERS.CLASES, id);
  return NextResponse.json({ success: true });
}
