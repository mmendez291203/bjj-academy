"use client";

import { motion } from "framer-motion";
import { InstagramIcon } from "@/components/ui/social-icons";

const FOTO_CARLOS = "https://bjjacademymedia.blob.core.windows.net/media/81a26d94-d95e-41b1-9459-8ca0c7c5f730.jpeg";

export default function Instructors() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            Nuestro Instructor
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Formado para enseñar, comprometido con tu progreso.
          </p>
        </div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/5 bg-gray-950 overflow-hidden max-w-sm w-full hover:border-red-800/30 transition-all"
          >
            {/* Foto */}
            <div className="relative h-72 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FOTO_CARLOS}
                alt="Carlos Alberto Donado Nadales"
                className="w-full h-full object-cover object-top"
              />
              {/* Badge cinturón */}
              <div className="absolute top-4 right-4 bg-yellow-700 text-yellow-100 text-xs font-bold px-3 py-1 rounded-full">
                Cinturón Café
              </div>
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="font-bold text-white text-xl mb-1">
                Carlos Alberto Donado Nadales
              </h3>
              <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-4">
                Instructor Principal · BJJ Gi & No-Gi
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                Cinturón café con sólida formación en Gi y No-Gi. Su enfoque de enseñanza
                combina la técnica del alto rendimiento con la paciencia necesaria para
                guiar a cada alumno en su proceso personal.
              </p>

              <a
                href="https://instagram.com/runajerabjj"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-pink-400 transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                @runajerabjj
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
