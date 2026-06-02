import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findByQuery, CONTAINERS } from "@/lib/azure/cosmos";

export async function GET(req: NextRequest) {
  const session = await auth() as any; // eslint-disable-line
  const rol = session?.user?.rol ?? "";
  if (!session || !["admin", "instructor"].includes(rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const alumnoId = req.nextUrl.searchParams.get("alumnoId");
  if (!alumnoId) {
    return NextResponse.json({ error: "alumnoId requerido" }, { status: 400 });
  }

  const registros = await findByQuery(
    CONTAINERS.ASISTENCIA,
    "SELECT * FROM c WHERE c.alumnoId = @id ORDER BY c.fecha DESC",
    [{ name: "@id", value: alumnoId }]
  ).catch(() => []);

  return NextResponse.json({ success: true, data: registros });
}
