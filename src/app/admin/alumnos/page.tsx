import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import AlumnosTable, { type UsuarioAdmin } from "@/components/admin/AlumnosTable";
import { auth } from "@/lib/auth";
import type { PerfilHijo } from "@/types";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Alumnos — Admin" };

type PadreDoc = UsuarioAdmin & { perfiles?: PerfilHijo[] };

export default async function AlumnosPage() {
  const session  = await auth() as any; // eslint-disable-line
  const rolActual: string = session?.user?.rol ?? "";
  const docs = await findAll<PadreDoc>(CONTAINERS.USUARIOS).catch(() => []);

  // Expandir hijos de padres como filas separadas
  const filas: UsuarioAdmin[] = [];
  for (const u of docs) {
    if (u.rol === "padre" && u.perfiles?.length) {
      for (const p of u.perfiles) {
        filas.push({
          id:                p.id,
          nombre:            p.nombre,
          email:             u.email,
          rol:               "alumno",
          cinturon:          p.cinturon,
          grados:            p.grados,
          clasesCompletadas: p.clasesCompletadas,
          proximoPago:       p.proximoPago,
          activo:            true,
          _tipo:             "perfil",
          _padreId:          u.id,
          _perfilId:         p.id,
        } as UsuarioAdmin);
      }
    } else {
      filas.push(u);
    }
  }

  const totalAlumnos = filas.filter((f) => (f as any)._tipo !== "perfil" || true).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Alumnos</h1>
        <p className="text-gray-400 mt-1">
          {totalAlumnos} alumno{totalAlumnos !== 1 ? "s" : ""}
          {" · "}
          <span className="text-gray-500 text-sm">
            Haz clic en <strong className="text-gray-400">Editar</strong> para actualizar cinturón, grados o asistencia
          </span>
        </p>
      </div>

      {filas.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No hay alumnos registrados todavía.</p>
        </div>
      ) : (
        <AlumnosTable usuarios={filas} rolActual={rolActual} />
      )}
    </div>
  );
}
