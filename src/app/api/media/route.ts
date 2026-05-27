/**
 * API Route: POST /api/media — Subir imagen a Azure Blob Storage
 *            GET  /api/media — Listar todas las imágenes
 *
 * Recibe un archivo (multipart/form-data), lo sube a Azure Blob Storage
 * y devuelve la URL pública de la imagen.
 */

import { NextRequest, NextResponse } from "next/server";
import { uploadBlob, listBlobs, deleteBlob } from "@/lib/azure/blob";
import { auth } from "@/lib/auth";
import type { ApiResponse } from "@/types";

// ─── DELETE /api/media ────────────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await auth() as any;
  const rol = session?.user?.rol ?? "";
  if (!session?.user || !["admin", "instructor"].includes(rol)) {
    return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
  }

  try {
    const { url } = await req.json() as { url: string };
    if (!url) return NextResponse.json({ success: false, error: "URL requerida" }, { status: 400 });
    await deleteBlob(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/media]", error);
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}

// ─── POST /api/media ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Solo se permiten imágenes (JPG, PNG, WebP, GIF)" },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "La imagen no puede pesar más de 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const extension = file.name.split(".").pop() ?? "jpg";
    const filename  = `${crypto.randomUUID()}.${extension}`;

    // Convertir File a Buffer y subir a Azure Blob Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);
    const url         = await uploadBlob(buffer, filename, file.type);

    return NextResponse.json(
      { success: true, data: { url, filename }, message: "Imagen subida exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/media]", error);
    return NextResponse.json(
      { success: false, error: "Error al subir la imagen" },
      { status: 500 }
    );
  }
}

// ─── GET /api/media ───────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<string[]>>> {
  try {
    const urls = await listBlobs();
    return NextResponse.json({ success: true, data: urls });
  } catch (error) {
    console.error("[GET /api/media]", error);
    return NextResponse.json(
      { success: false, error: "Error al listar imágenes" },
      { status: 500 }
    );
  }
}
