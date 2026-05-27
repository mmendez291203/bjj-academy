"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* ─── Fondo con gradiente ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 via-black to-black" />

      {/* Patrón de rejilla sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ─── Contenido ───────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-red-800/50 bg-red-950/30 px-4 py-1.5 text-sm text-red-300 mb-8"
        >
          <Star className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          Primera clase completamente gratis
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight text-white mb-6"
        >
          Domina el arte del{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">
            Jiu-Jitsu
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          Entrena con instructores de clase mundial. Gi, No-Gi, Wrestling y Kids.
          Construye confianza, disciplina y habilidad real en el tatami.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/inscripciones">
            <Button size="lg" className="group">
              Empieza Hoy Gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/clases">
            <Button size="lg" variant="outline">
              <Play className="w-4 h-4" />
              Ver Horarios
            </Button>
          </Link>
        </motion.div>

        {/* ─── Stats ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-10"
        >
          {[
            { valor: "200+",  label: "Alumnos activos"     },
            { valor: "15+",   label: "Años de experiencia" },
            { valor: "50+",   label: "Medallas en torneos" },
            { valor: "3",     label: "Instructores black belt" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{stat.valor}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
