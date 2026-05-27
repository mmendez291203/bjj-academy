"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { testimoniosMock } from "@/lib/data/clases-mock";
import { colorCinturon, capitalizar, cn } from "@/lib/utils";

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimoniosMock.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-white/5 bg-black/60 p-6 relative"
            >
              <Quote className="w-8 h-8 text-red-900/60 mb-4" />
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                "{t.texto}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg">
                  🥷
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{t.nombre}</p>
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      colorCinturon(t.cinturon)
                    )}
                  >
                    Cinturón {capitalizar(t.cinturon)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
