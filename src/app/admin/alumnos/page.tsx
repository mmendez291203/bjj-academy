import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import AlumnosTable, { type UsuarioAdmin } from "@/components/admin/AlumnosTable";
import { auth } from "@/lib/auth";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Alumnos — Admin" };

export default async function AlumnosPage() {
  const session = await auth() as any; // eslint-disable-line
  const rolActual: string = session?.user?.rol ?? "";
  const usuarios = await findAll<UsuarioAdmin>(CONTAINERS.USUARIOS).catch(() => []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Alumnos</h1>
        <p className="text-gray-400 mt-1">
          {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          {" · "}
          <span className="text-gray-500 text-sm">Haz clic en <strong className="text-gray-400">Editar</strong> para actualizar cinturón, grados o asistencia</span>
        </p>
      </div>

      {usuarios.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No hay alumnos registrados todavía.</p>
        </div>
      ) : (
        <AlumnosTable usuarios={usuarios} rolActual={rolActual} />
      )}
    </div>
  );
}
