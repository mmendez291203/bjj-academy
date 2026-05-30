import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/types";
import { createItem, CONTAINERS } from "@/lib/azure/cosmos";
import { enviarNotificacionInscripcion, enviarConfirmacionAlumno } from "@/lib/email";

const schemaAdulto = z.object({
  tipo:               z.literal("adulto").optional(),
  nombre:             z.string().min(2),
  apellido:           z.string().min(2),
  email:              z.string().email(),
  telefono:           z.string().min(8),
  edad:               z.number().min(4).max(99),
  experienciaPrevia:  z.boolean(),
  claseInteres:       z.enum(["gi", "no-gi", "open-mat", "kids"]),
  mensaje:            z.string().optional(),
  comoNosEncontraste: z.string().optional(),
});

const schemaKids = z.object({
  tipo:       z.literal("kids"),
  nombreHijo: z.string().min(2),
  apellido:   z.string().min(2),
  emailPapa:  z.string().email(),
  telefono:   z.string().min(8),
  edadHijo:   z.number().min(3).max(15),
});

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await req.json();

    if (body.tipo === "kids") {
      const result = schemaKids.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: "Datos inválidos", message: result.error.message },
          { status: 400 }
        );
      }
      const data = result.data;
      const inscripcion = {
        id:        crypto.randomUUID(),
        tipo:      "kids" as const,
        nombre:    data.nombreHijo,
        apellido:  data.apellido,
        email:     data.emailPapa,
        telefono:  data.telefono,
        edadHijo:  data.edadHijo,
        estado:    "pendiente" as const,
        createdAt: new Date().toISOString(),
      };
      await createItem(CONTAINERS.INSCRIPCIONES, inscripcion);
      return NextResponse.json({ success: true, data: { id: inscripcion.id }, message: "Solicitud registrada" }, { status: 201 });
    }

    // Adulto (default)
    const result = schemaAdulto.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", message: result.error.message },
        { status: 400 }
      );
    }
    const data = result.data;
    const inscripcion = {
      id:        crypto.randomUUID(),
      tipo:      "adulto" as const,
      ...data,
      estado:    "pendiente" as const,
      createdAt: new Date().toISOString(),
    };
    await createItem(CONTAINERS.INSCRIPCIONES, inscripcion);

    enviarNotificacionInscripcion(data).catch((err) => console.error("[Email admin]", err));
    enviarConfirmacionAlumno(data).catch((err) => console.error("[Email alumno]", err));

    return NextResponse.json({ success: true, data: { id: inscripcion.id }, message: "Inscripción registrada" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/inscripciones]", error);
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse<ApiResponse<[]>>> {
  return NextResponse.json({ success: true, data: [] });
}
