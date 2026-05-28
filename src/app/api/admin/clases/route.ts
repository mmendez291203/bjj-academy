import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { findAll, createItem, CONTAINERS } from "@/lib/azure/cosmos";

const schema = z.object({
  nombre:          z.string().min(2),
  tipo:            z.enum(["gi", "no-gi", "kids"]),
  nivel:           z.enum(["principiante", "intermedio", "avanzado", "todos", "kids"]).default("todos"),
  dia:             z.enum(["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]),
  horaInicio:      z.string().regex(/^\d{2}:\d{2}$/),
  horaFin:         z.string().regex(/^\d{2}:\d{2}$/),
  instructor:      z.string().min(2),
  capacidadMaxima: z.number().int().min(1).max(100),
  descripcion:     z.string().optional().default(""),
  activa:          z.boolean().default(true),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkAdmin(session: any) {
  const rol = session?.user?.rol ?? "";
  return !!session?.user && ["admin", "instructor"].includes(rol);
}

export async function GET() {
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const clases = await findAll(CONTAINERS.CLASES).catch(() => []);
  return NextResponse.json({ success: true, data: clases });
}

export async function POST(req: NextRequest) {
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: "Datos inválidos", detail: result.error.message }, { status: 400 });

  const clase = { id: `cls-${crypto.randomUUID()}`, ...result.data };
  await createItem(CONTAINERS.CLASES, clase);
  return NextResponse.json({ success: true, data: clase }, { status: 201 });
}
