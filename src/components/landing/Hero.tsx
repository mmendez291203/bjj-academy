"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">

      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/15 via-black to-black" />

      {/* Patrón sutil */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Contenido */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 text-center">

        {/* Ubicación */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium text-red-400 tracking-widest uppercase mb-6"
        >
          Escazú, Costa Rica
        </motion.p>

        {/* Nombre de la academia — blanco sólido, limpio */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl sm:text-7xl lg:text-9xl font-extrabold tracking-tight text-white mb-6 leading-none"
        >
          RUNAJERA
          <span className="text-red-600">BJJ</span>
        </motion.h1>

        {/* Tagline de la misión */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Más allá del tatami. Brazilian Jiu-Jitsu para moldear individuos
          mental y físicamente más fuertes.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/inscripciones">
            <Button size="lg" className="group w-full sm:w-auto">
              Empieza hoy — es gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/clases">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver horario de clases
            </Button>
          </Link>
        </motion.div>

        {/* Horario rápido */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-10"
        >
          {[
            { valor: "Gi",       label: "Lunes y Miércoles" },
            { valor: "No-Gi",    label: "Martes y Jueves"   },
            { valor: "Open Mat", label: "Viernes"           },
            { valor: "7:30 PM",  label: "Lun — Vie"         },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.valor}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
