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

  // 1. Buscar la inscripción
  const inscripciones = await findAll<{
    id: string; email: string; nombre: string; apellido?: string; estado?: string;
  }>(CONTAINERS.INSCRIPCIONES);

  const inscripcion = inscripciones.find((i) => i.id === id);
  if (!inscripcion)
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });

  // 2. Marcar inscripción como admitida
  await updateItem(CONTAINERS.INSCRIPCIONES, id, { estado: "admitido" } as any); // eslint-disable-line

  // 3. Buscar si el usuario ya existe en Cosmos DB (ya hizo login con Google)
  const usuarios = await findAll<{ id: string; email: string; activo?: boolean }>(
    CONTAINERS.USUARIOS
  );
  const usuario = usuarios.find((u) => u.email === inscripcion.email);

  if (usuario) {
    // Ya tiene cuenta → activarlo directamente
    await updateItem(CONTAINERS.USUARIOS, usuario.id, { activo: true } as any); // eslint-disable-line
    return NextResponse.json({
      success: true,
      activado: true,
      mensaje: `✅ Usuario activado. ${inscripcion.nombre} ya puede entrar al portal.`,
    });
  }

  // 4. No tiene cuenta aún → la inscripción queda como "admitido"
  //    Cuando haga login por primera vez, auth.ts lo detecta y lo activa solo
  return NextResponse.json({
    success: true,
    activado: false,
    mensaje: `✅ Pre-aprobado. Cuando ${inscripcion.nombre} inicie sesión con Google, entrará activo automáticamente.`,
  });
}
