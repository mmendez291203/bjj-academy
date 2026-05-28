import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findAll, CONTAINERS } from "@/lib/azure/cosmos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkAdmin(session: any) {
  const rol = session?.user?.rol ?? "";
  return !!session?.user && ["admin", "instructor"].includes(rol);
}

export async function GET() {
  const session = await auth() as any; // eslint-disable-line
  if (!checkAdmin(session))
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });

  const inscripciones = await findAll(CONTAINERS.INSCRIPCIONES).catch(() => []);
  return NextResponse.json({ success: true, data: inscripciones });
}
