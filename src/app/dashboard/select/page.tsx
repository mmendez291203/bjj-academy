export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { findByQuery, CONTAINERS } from "@/lib/azure/cosmos";
import { colorCinturon } from "@/lib/utils";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import type { PerfilHijo } from "@/types";
import { seleccionarPerfil } from "./actions";

type PadreDoc = {
  id: string;
  email: string;
  rol: string;
  perfiles?: PerfilHijo[];
};

const CINTURON_LABEL: Record<string, string> = {
  blanco: "Blanco", "gris-blanco": "Gris/Blanco", gris: "Gris", "gris-negro": "Gris/Negro",
  "amarillo-blanco": "Amarillo/Blanco", amarillo: "Amarillo", "amarillo-negro": "Amarillo/Negro",
  "naranja-blanco": "Naranja/Blanco", naranja: "Naranja", "naranja-negro": "Naranja/Negro",
  "verde-blanco": "Verde/Blanco", verde: "Verde", "verde-negro": "Verde/Negro",
  azul: "Azul", morado: "Morado", cafe: "Café", negro: "Negro",
};

export default async function SelectPerfilPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const email = session.user.email;

  const usuarios = await findByQuery<PadreDoc>(
    CONTAINERS.USUARIOS,
    "SELECT * FROM c WHERE c.email = @email",
    [{ name: "@email", value: email }]
  );
  const padre = usuarios[0];

  if (!padre || padre.rol !== "padre" || !padre.perfiles?.length) {
    redirect("/dashboard");
  }

  // Si solo hay un perfil, seleccionarlo automáticamente
  if (padre.perfiles.length === 1) {
    await seleccionarPerfil(padre.perfiles[0].id);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">👨‍👧‍👦</p>
          <h1 className="text-2xl font-bold text-white">¿Para quién es esta sesión?</h1>
          <p className="text-gray-500 mt-2 text-sm">Selecciona el perfil que quieres ver</p>
        </div>

        <div className="space-y-3">
          {padre.perfiles.map((perfil) => (
            <form key={perfil.id} action={seleccionarPerfil.bind(null, perfil.id)}>
              <button
                type="submit"
                className="w-full rounded-xl border border-white/10 bg-gray-950 hover:border-red-800/60 hover:bg-gray-900 transition-all p-5 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center text-2xl shrink-0 group-hover:bg-red-900/50 transition-colors">
                    🥋
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-lg truncate">{perfil.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", colorCinturon(perfil.cinturon))}>
                        {CINTURON_LABEL[perfil.cinturon] ?? perfil.cinturon}
                      </span>
                      <span className="text-yellow-400 text-sm font-mono">
                        {"●".repeat(perfil.grados)}{"○".repeat(4 - perfil.grados)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{perfil.clasesCompletadas} clases completadas</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-red-400 transition-colors text-xl">→</span>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
