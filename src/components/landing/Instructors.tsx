"use client";

import { motion } from "framer-motion";
import { InstagramIcon } from "@/components/ui/social-icons";
import { instructoresMock } from "@/lib/data/clases-mock";
import { colorCinturon, capitalizar } from "@/lib/utils";
import { cn } from "@/lib/utils";

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
            Nuestros Instructores
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Aprende de los mejores. Cada instructor tiene años de competencia
            y enseñanza en BJJ de alto nivel.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 gap-8 w-full max-w-sm">
          {instructoresMock.map((instructor, i) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl border border-white/5 bg-gray-950 overflow-hidden hover:border-red-800/30 transition-all"
            >
              {/* Foto del instructor */}
              <div className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  🥋
                </div>
                {/* Cinturón badge */}
                <div className="absolute top-4 right-4">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-full",
                      colorCinturon(instructor.cinturon)
                    )}
                  >
                    {capitalizar(instructor.cinturon)}
                    {instructor.galones > 0 && ` ·${"〡".repeat(instructor.galones)}`}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <h3 className="font-bold text-white text-lg mb-1">{instructor.nombre}</h3>
                <p className="text-xs text-red-400 font-medium mb-3">{instructor.especialidad}</p>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">{instructor.bio}</p>

                {/* Instagram — solo si tiene */}
                {instructor.instagram && (
                  <a
                    href={`https://instagram.com/${instructor.instagram.replace("@","")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-400 transition-colors"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    {instructor.instagram}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
