"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonios = [
  {
    id: 1,
    texto: "Empecé sin ninguna experiencia y desde la primera clase me sentí en un lugar seguro. El instructor tiene mucha paciencia y el grupo te recibe muy bien.",
    nombre: "Mario M.",
    cinturon: "Cinturón Blanco · 2 grados",
  },
  {
    id: 2,
    texto: "Lo que más me gusta es que no importa tu nivel. Siempre hay algo nuevo que aprender y el ambiente hace que quieras volver cada día.",
    nombre: "Alumno de la academia",
    cinturon: "Cinturón Blanco",
  },
  {
    id: 3,
    texto: "El BJJ me cambió más allá del físico. Aprendí a mantener la calma en momentos difíciles, y eso lo aplico en todo. RUNAJERABJJ es mucho más que un gimnasio.",
    nombre: "Alumno de la academia",
    cinturon: "Cinturón Blanco",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Lo que dicen nuestros alumnos
          </motion.h2>
          <p className="text-gray-400">Experiencias reales de quienes ya entrenan con nosotros.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-black/60 p-6 relative flex flex-col"
            >
              <Quote className="w-7 h-7 text-red-900/50 mb-4 shrink-0" />
              <p className="text-gray-300 text-sm leading-relaxed mb-6 flex-1">
                "{t.texto}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-base shrink-0">
                  🥋
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.nombre}</p>
                  <p className="text-xs text-gray-600">{t.cinturon}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
