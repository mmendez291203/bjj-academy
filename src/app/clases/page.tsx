export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { clasesMock } from "@/lib/data/clases-mock";
import type { Clase } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ClasesGrid from "@/components/clases/ClasesGrid";

export const metadata: Metadata = {
  title: "Horario de Clases",
  description: "Consulta el horario completo de clases de BJJ Gi, No-Gi y Kids.",
};

export default async function ClasesPage() {
  let clases: Clase[] = [];
  try {
    clases = await findAll<Clase>(CONTAINERS.CLASES);
    if (clases.length === 0) clases = clasesMock;
  } catch {
    clases = clasesMock;
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-4">Horario de Clases</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Entrena a tu ritmo. Tenemos clases para todos los niveles, de lunes a viernes.
          </p>
        </div>

        {/* Grid con filtros (componente cliente) */}
        <ClasesGrid clases={clases} />

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">¿Listo para comenzar?</p>
          <Link href="/inscripciones">
            <Button size="lg">Reservar clase gratis →</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
