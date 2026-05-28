"use client";

import { motion } from "framer-motion";
import { Users, Trophy, Calendar, Shield, Brain, Heart } from "lucide-react";

const features = [
  {
    icon: Brain,
    titulo: "Superación personal",
    desc:   "El BJJ entrena la mente tanto como el cuerpo. Cada clase te enseña a resolver problemas bajo presión y a mantener la calma en momentos difíciles.",
  },
  {
    icon: Shield,
    titulo: "Ambiente seguro y respetuoso",
    desc:   "Entrenamiento controlado con normas claras de higiene y respeto. Un lugar donde cualquier persona, sin importar su nivel, se siente bienvenida.",
  },
  {
    icon: Trophy,
    titulo: "Competencia y desarrollo",
    desc:   "Preparamos a quienes quieren competir en torneos IBJJF y locales, pero también a quienes solo buscan crecer personal y físicamente.",
  },
  {
    icon: Calendar,
    titulo: "Horario consistente",
    desc:   "Clases de lunes a viernes a las 7:30 PM. Gi, No-Gi y Open Mat. Un horario que te permite comprometerte con tu entrenamiento.",
  },
  {
    icon: Heart,
    titulo: "Para todos los niveles",
    desc:   "Desde el primer día hasta cinturón negro. No importa si nunca has entrenado — aquí todos comenzamos desde cero.",
  },
  {
    icon: Users,
    titulo: "Comunidad que te impulsa",
    desc:   "Entrenar BJJ crea vínculos reales. La academia es también una comunidad de personas que se apoyan dentro y fuera del tatami.",
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
            El jiu-jitsu que enseñamos va más allá de las técnicas. Es una herramienta
            de construcción personal.
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
