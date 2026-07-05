import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findAll, findByQuery, createItem, updateItem, CONTAINERS } from "@/lib/azure/cosmos";
import type { PerfilHijo } from "@/types";

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

  const inscripciones = await findAll<{
    id: string; tipo?: string; nombre: string; apellido?: string;
    email: string; estado?: string;
  }>(CONTAINERS.INSCRIPCIONES);

  const inscripcion = inscripciones.find((i) => i.id === id);
  if (!inscripcion)
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });

  await updateItem(CONTAINERS.INSCRIPCIONES, id, { estado: "admitido" } as any); // eslint-disable-line

  // ── Kids: crear/actualizar perfil en cuenta del padre ─────────────────────
  if (inscripcion.tipo === "kids") {
    const emailPapa = inscripcion.email;
    const nombreHijo = `${inscripcion.nombre}${inscripcion.apellido ? " " + inscripcion.apellido : ""}`;

    const nuevoPerfil: PerfilHijo = {
      id:                `perfil-${crypto.randomUUID()}`,
      nombre:            nombreHijo,
      cinturon:          "blanco",
      grados:            0,
      clasesCompletadas: 0,
      fechaInicio:       new Date().toISOString().slice(0, 10),
      proximoPago:       null,
    };

    const usuarios = await findByQuery<{ id: string; email: string; rol?: string; perfiles?: PerfilHijo[] }>(
      CONTAINERS.USUARIOS,
      "SELECT * FROM c WHERE c.email = @email",
      [{ name: "@email", value: emailPapa }]
    );
    const padre = usuarios[0];

    if (padre) {
      const perfilesActuales = padre.perfiles ?? [];
      await updateItem(CONTAINERS.USUARIOS, padre.id, {
        rol:      "padre",
        activo:   true,
        perfiles: [...perfilesActuales, nuevoPerfil],
      } as any); // eslint-disable-line
      return NextResponse.json({
        success: true,
        mensaje: `✅ Perfil de ${inscripcion.nombre} agregado a la cuenta de ${emailPapa}.`,
      });
    }

    // No tiene cuenta aún → crearla como padre
    await createItem(CONTAINERS.USUARIOS, {
      id:       `usr-${crypto.randomUUID()}`,
      email:    emailPapa,
      nombre:   emailPapa,
      rol:      "padre",
      activo:   true,
      perfiles: [nuevoPerfil],
      creadoEn: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      mensaje: `✅ Perfil de ${inscripcion.nombre} creado. El padre podrá verlo al iniciar sesión con ${emailPapa}.`,
    });
  }

  // ── Adulto: activar o crear cuenta ───────────────────────────────────────
  const emailNorm = inscripcion.email.toLowerCase().trim();
  const usuarios  = await findAll<{ id: string; email: string; activo?: boolean }>(CONTAINERS.USUARIOS);
  const usuario   = usuarios.find((u) => u.email.toLowerCase().trim() === emailNorm);

  if (usuario) {
    // Ya tiene cuenta → activar; si es padre que también entrena, marcarlo
    const extra = (usuario as any).rol === "padre" ? { esAlumno: true } : {};
    await updateItem(CONTAINERS.USUARIOS, usuario.id, { activo: true, ...extra } as any); // eslint-disable-line
    return NextResponse.json({
      success: true,
      mensaje: `✅ Usuario activado. ${inscripcion.nombre} ya puede entrar al portal.`,
    });
  }

  // No tiene cuenta → crearla ahora para que aparezca en el listado
  const nombreCompleto = `${inscripcion.nombre}${inscripcion.apellido ? " " + inscripcion.apellido : ""}`.trim();
  await createItem(CONTAINERS.USUARIOS, {
    id:                `usr-${crypto.randomUUID()}`,
    email:             emailNorm,
    nombre:            nombreCompleto,
    rol:               "alumno",
    cinturon:          "blanco",
    grados:            0,
    clasesCompletadas: 0,
    activo:            true,
    creadoEn:          new Date().toISOString(),
  });
  return NextResponse.json({
    success: true,
    mensaje: `✅ Usuario creado. ${inscripcion.nombre} ya aparece en el listado y podrá entrar al portal.`,
  });
}
