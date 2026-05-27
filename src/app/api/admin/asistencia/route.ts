/**
 * POST /api/admin/asistencia
 *
 * Registra la asistencia de uno o varios alumnos a una clase.
 * - Crea un documento en `asistencia` por cada alumno presente.
 * - Incrementa `clasesCompletadas` en el documento del alumno.
 * - Evita duplicados: mismo alumno + misma fecha + mismo tipo.
 * Solo accesible por admins.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createItem,
  updateItem,
  findByQuery,
  CONTAINERS,
} from "@/lib/azure/cosmos";

const schema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  tipo:  z.enum(["gi", "no-gi", "open-mat", "kids"]),
  alumnos: z.array(
    z.object({
      id:     z.string(),
      email:  z.string().email(),
      nombre: z.string(),
    })
  ).min(1, "Selecciona al menos un alumno"),
});

type AsistenciaDoc = {
  id: string;
  fecha: string;
  tipo: string;
  alumnoId: string;
  alumnoEmail: string;
  alumnoNombre: string;
  registradoPor: string;
  creadoEn: string;
};

type UsuarioDoc = {
  id: string;
  email: string;
  clasesCompletadas?: number;
};

export async function POST(req: NextRequest) {
  // Solo admin o instructor
  const session = await auth();
  const rol = session?.user?.rol ?? "";
  if (!session || !["admin", "instructor"].includes(rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detail: result.error.message },
      { status: 400 }
    );
  }

  const { fecha, tipo, alumnos } = result.data;
  const registradoPor = session.user?.email ?? "admin";
  let registrados = 0;
  let duplicados  = 0;

  for (const alumno of alumnos) {
    // Verificar si ya existe registro para este alumno en esta fecha y tipo
    const existentes = await findByQuery<{ id: string }>(
      CONTAINERS.ASISTENCIA,
      "SELECT c.id FROM c WHERE c.alumnoEmail = @email AND c.fecha = @fecha AND c.tipo = @tipo",
      [
        { name: "@email", value: alumno.email },
        { name: "@fecha", value: fecha },
        { name: "@tipo",  value: tipo },
      ]
    );

    if (existentes.length > 0) {
      duplicados++;
      continue;
    }

    // Crear registro de asistencia
    const doc: AsistenciaDoc = {
      id:            crypto.randomUUID(),
      fecha,
      tipo,
      alumnoId:      alumno.id,
      alumnoEmail:   alumno.email,
      alumnoNombre:  alumno.nombre,
      registradoPor,
      creadoEn:      new Date().toISOString(),
    };
    await createItem(CONTAINERS.ASISTENCIA, doc);

    // Incrementar clasesCompletadas en el documento del usuario
    try {
      const usuarios = await findByQuery<UsuarioDoc>(
        CONTAINERS.USUARIOS,
        "SELECT * FROM c WHERE c.email = @email",
        [{ name: "@email", value: alumno.email }]
      );
      if (usuarios.length > 0) {
        const u = usuarios[0];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await updateItem(CONTAINERS.USUARIOS, u.id, { clasesCompletadas: (u.clasesCompletadas ?? 0) + 1 } as any);
      }
    } catch (e) {
      console.error("[asistencia] Error actualizando clasesCompletadas:", e);
    }

    registrados++;
  }

  return NextResponse.json({
    success: true,
    registrados,
    duplicados,
    message: duplicados > 0
      ? `${registrados} registrado(s). ${duplicados} ya tenía(n) asistencia para esta clase.`
      : `${registrados} asistencia(s) registrada(s).`,
  });
}

// GET — historial de asistencia (últimas 100 entradas)
export async function GET() {
  const session = await auth();
  const rol = session?.user?.rol ?? "";
  if (!session || !["admin", "instructor"].includes(rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const registros = await findByQuery<AsistenciaDoc>(
    CONTAINERS.ASISTENCIA,
    "SELECT TOP 100 * FROM c ORDER BY c.creadoEn DESC"
  ).catch(() => []);

  return NextResponse.json({ success: true, data: registros });
}
