"use client";

import { motion } from "framer-motion";

export default function Mission() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl border border-red-900/20 bg-red-950/10 p-8 sm:p-12 text-center"
        >
          {/* Comilla decorativa */}
          <div className="text-7xl text-red-800/30 font-serif leading-none mb-4 select-none">"</div>

          <p className="text-xl sm:text-2xl text-white font-light leading-relaxed mb-6">
            Nuestra misión a través del jiu-jitsu brasileño va más allá del tatami y los torneos.
            Buscamos moldear individuos{" "}
            <span className="text-red-400 font-semibold">mental y físicamente saludables</span>,
            guiándolos en su viaje de superación personal, donde cada técnica aprendida es un pilar
            para construir una{" "}
            <span className="text-red-400 font-semibold">vida más fuerte y equilibrada</span>.
          </p>

          <p className="text-sm text-gray-500 font-medium tracking-wider uppercase">
            — RUNAJERABJJ · Escazú, Costa Rica
          </p>
        </motion.div>
      </div>
    </section>
  );
}
