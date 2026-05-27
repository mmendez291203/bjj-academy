import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { findAll, createItem, CONTAINERS } from "@/lib/azure/cosmos";
import { toSlug } from "@/lib/utils";

const schema = z.object({
  titulo:           z.string().min(3),
  resumen:          z.string().min(10),
  contenido:        z.string().min(1),
  categoria:        z.enum(["tecnicas", "competencias", "noticias", "nutricion", "consejos"]),
  autor:            z.string().min(2),
  imagen:           z.string().url().optional().or(z.literal("")),
  publicado:        z.boolean().default(false),
  fechaPublicacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tags:             z.array(z.string()).default([]),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkAdmin(session: any) {
  const rol = session?.user?.rol ?? "";
  return !!session?.user && ["admin", "instructor"].includes(rol);
}

export async function GET() {
  const session = await auth();
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const posts = await findAll(CONTAINERS.POSTS).catch(() => []);
  return NextResponse.json({ success: true, data: posts });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!checkAdmin(session))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success)
    return NextResponse.json({ error: "Datos inválidos", detail: result.error.message }, { status: 400 });

  const data = result.data;
  const slug = toSlug(data.titulo) + "-" + Date.now().toString(36);

  const post = {
    id:       `post-${crypto.randomUUID()}`,
    slug,
    ...data,
    imagen:   data.imagen || undefined,
    creadoEn: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await createItem(CONTAINERS.POSTS, post);
  return NextResponse.json({ success: true, data: post }, { status: 201 });
}
