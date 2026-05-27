"use client";

import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Calendar,
  Shield,
  Zap,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    titulo: "Ambiente seguro",
    desc:   "Entrenamiento controlado con instructores certificados. Normas de higiene y respeto estrictas.",
  },
  {
    icon: Trophy,
    titulo: "Equipo de competencia",
    desc:   "Prepárate para torneos IBJJF, ADCC y locales con nuestro programa especializado.",
  },
  {
    icon: Calendar,
    titulo: "Horarios flexibles",
    desc:   "Clases mañana y noche de lunes a sábado. Encuentra el horario que se adapte a tu vida.",
  },
  {
    icon: Users,
    titulo: "Comunidad real",
    desc:   "Más de 200 alumnos de todos los niveles. Un lugar donde hacerás amigos de por vida.",
  },
  {
    icon: Zap,
    titulo: "Resultados rápidos",
    desc:   "Método estructurado que maximiza tu progreso. De blanco a azul en tiempo récord.",
  },
  {
    icon: Heart,
    titulo: "Programa Kids",
    desc:   "Clases para niños de 6 a 12 años. Disciplina, confianza y diversión en el tatami.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white mb-4"
          >
            ¿Por qué entrenar con nosotros?
          </motion.h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            No somos solo un gimnasio. Somos una familia dedicada a hacer crecer
            tu juego y tu carácter.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.titulo}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative rounded-xl border border-white/5 bg-black/40 p-6 hover:border-red-800/40 transition-all"
            >
              {/* Glow on hover */}
              <div className="absolute inset-0 rounded-xl bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-red-900/30 border border-red-800/30 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.titulo}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
