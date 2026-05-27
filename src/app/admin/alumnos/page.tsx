import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { colorCinturon, capitalizar } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Alumnos — Admin" };

type Usuario = {
  id: string;
  nombre?: string;
  email: string;
  rol: string;
  cinturon?: string;
  activo?: boolean;
  creadoEn?: string;
};

export default async function AlumnosPage() {
  const usuarios = await findAll<Usuario>(CONTAINERS.USUARIOS).catch(() => []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Alumnos</h1>
        <p className="text-gray-400 mt-1">{usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}</p>
      </div>

      {usuarios.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p>No hay alumnos registrados todavía.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-950 border-b border-white/5">
              <tr>
                {["Nombre", "Email", "Rol", "Cinturón", "Estado"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{u.nombre ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      u.rol === "admin" ? "bg-red-900/40 text-red-400" : "bg-gray-800 text-gray-400"
                    )}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.cinturon ? (
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorCinturon(u.cinturon))}>
                        {capitalizar(u.cinturon)}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full",
                      u.activo !== false ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-500"
                    )}>
                      {u.activo !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
