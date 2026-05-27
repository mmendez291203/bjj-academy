/**
 * API Route: POST /api/inscripciones
 *
 * Recibe el formulario de inscripción, valida con Zod,
 * guarda en Cosmos DB y envía email de confirmación.
 *
 * Next.js App Router: cada export es un método HTTP.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse, FormInscripcion } from "@/types";
import { createItem, CONTAINERS } from "@/lib/azure/cosmos";

// ─── Schema de validación (igual que el frontend) ─────────────────────────────
const inscripcionSchema = z.object({
  nombre:             z.string().min(2),
  apellido:           z.string().min(2),
  email:              z.string().email(),
  telefono:           z.string().min(10),
  edad:               z.number().min(4).max(99),
  experienciaPrevia:  z.boolean(),
  claseInteres:       z.enum(["gi", "no-gi", "open-mat", "kids"]),
  mensaje:            z.string().optional(),
  comoNosEncontraste: z.string().optional(),
});

// ─── POST /api/inscripciones ──────────────────────────────────────────────────
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await req.json();

    // 1. Validar con Zod
    const result = inscripcionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", message: result.error.message },
        { status: 400 }
      );
    }

    const data = result.data;

    // 2. Crear documento en Cosmos DB
    const inscripcion = {
      id:        crypto.randomUUID(),
      ...data,
      estado:    "pendiente" as const,
      createdAt: new Date().toISOString(),
    };

    await createItem(CONTAINERS.INSCRIPCIONES, inscripcion);

    // 3. Enviar email de confirmación (Azure Communication Services o Resend)
    /**
     * await sendConfirmationEmail({
     *   to: data.email,
     *   nombre: data.nombre,
     * });
     */

    return NextResponse.json(
      { success: true, data: { id: inscripcion.id }, message: "Inscripción registrada" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/inscripciones]", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ─── GET /api/inscripciones — solo para admins ────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<FormInscripcion[]>>> {
  /**
   * PRODUCCIÓN:
   * const session = await auth();
   * if (!session || session.user.rol !== "admin") {
   *   return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
   * }
   * const inscripciones = await findAll<FormInscripcion>(CONTAINERS.INSCRIPCIONES);
   * return NextResponse.json({ success: true, data: inscripciones });
   */

  return NextResponse.json({ success: true, data: [] });
}
