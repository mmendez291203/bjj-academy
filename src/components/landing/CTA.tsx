"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-red-900/30 bg-gradient-to-b from-red-950/20 to-transparent p-12"
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            Tu primera clase es gratis
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Sin compromiso. Ven, entrena y siente la energía del tatami.
            Te esperamos con los brazos abiertos (y las guardias cerradas 😄).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscripciones">
              <Button size="lg" className="group">
                Reservar clase gratis
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a
              href={`https://wa.me/${(process.env.NEXT_PUBLIC_ACADEMY_PHONE ?? "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline">
                📱 WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
