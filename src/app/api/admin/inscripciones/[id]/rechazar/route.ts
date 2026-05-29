import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findAll, updateItem, CONTAINERS } from "@/lib/azure/cosmos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkAdmin(session: any) {
  const rol = session?.user?.rol ?? "";
  return !!session?.user && ["admin", "instructor"].includes(rol);
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const inscripciones = await findAll<{ id: string; nombre: string; estado?: string }>(
    CONTAINERS.INSCRIPCIONES
  );
  const inscripcion = inscripciones.find((i) => i.id === id);
  if (!inscripcion)
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });

  await updateItem(CONTAINERS.INSCRIPCIONES, id, { estado: "rechazado" } as any); // eslint-disable-line

  return NextResponse.json({
    success: true,
    mensaje: `❌ Solicitud de ${inscripcion.nombre} marcada como rechazada.`,
  });
}
