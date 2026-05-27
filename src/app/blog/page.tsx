import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatFecha } from "@/lib/utils";
import type { Post } from "@/types";

export const metadata: Metadata = {
  title: "Blog de BJJ",
  description: "Artículos sobre técnicas, competencias y consejos de Jiu-Jitsu Brasileño.",
};

// ─── Posts demo ───────────────────────────────────────────────────────────────
const postsMock: Post[] = [
  {
    id: "post-001",
    slug: "guard-retention-principiantes",
    titulo: "Guard Retention para principiantes: los 3 conceptos clave",
    resumen:
      "Mantener tu guard es una de las habilidades más importantes en BJJ. Aquí te explicamos los principios fundamentales para que nunca pierdas tu guard.",
    contenido: "",
    categoria: "tecnicas",
    autor: "Prof. Carlos Mendoza",
    publicado: true,
    fechaPublicacion: "2026-05-20",
    tags: ["guard", "principiantes", "técnica"],
    createdAt: "2026-05-20",
    updatedAt: "2026-05-20",
  },
  {
    id: "post-002",
    slug: "competir-primer-torneo",
    titulo: "Cómo prepararte para tu primer torneo de BJJ",
    resumen:
      "El primer torneo es siempre nervioso. Te compartimos una guía paso a paso para llegar al día del torneo con confianza y bien preparado.",
    contenido: "",
    categoria: "competencias",
    autor: "Coach Ana Torres",
    publicado: true,
    fechaPublicacion: "2026-05-10",
    tags: ["torneo", "competencia", "preparación"],
    createdAt: "2026-05-10",
    updatedAt: "2026-05-10",
  },
  {
    id: "post-003",
    slug: "nutricion-bjj",
    titulo: "Nutrición para BJJ: qué comer antes y después de entrenar",
    resumen:
      "La alimentación correcta puede marcar la diferencia en tu rendimiento en el tatami. Guía práctica de nutrición específica para grappling.",
    contenido: "",
    categoria: "nutricion",
    autor: "Coach Sofía Ramírez",
    publicado: true,
    fechaPublicacion: "2026-04-28",
    tags: ["nutrición", "dieta", "rendimiento"],
    createdAt: "2026-04-28",
    updatedAt: "2026-04-28",
  },
  {
    id: "post-004",
    slug: "heel-hook-introduccion",
    titulo: "Introducción a los Heel Hooks: historia y aplicación segura",
    resumen:
      "Los heel hooks son técnicas poderosas y controvertidas en BJJ. Entendemos su origen, cuándo son legales y cómo practicarlas de forma segura.",
    contenido: "",
    categoria: "tecnicas",
    autor: "Prof. Carlos Mendoza",
    publicado: true,
    fechaPublicacion: "2026-04-15",
    tags: ["leg locks", "heel hook", "avanzado"],
    createdAt: "2026-04-15",
    updatedAt: "2026-04-15",
  },
];

const CATEGORIA_LABEL: Record<string, string> = {
  tecnicas:    "Técnicas",
  competencias: "Competencias",
  noticias:    "Noticias",
  nutricion:   "Nutrición",
  consejos:    "Consejos",
};

export default function BlogPage() {
  /**
   * En producción:
   * const posts = await findAll<Post>(CONTAINERS.POSTS)
   *   .then(p => p.filter(p => p.publicado))
   */
  const posts = postsMock;

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">Blog de BJJ</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Técnicas, competencias, nutrición y todo lo que necesitas saber
            para mejorar tu juego en el tatami.
          </p>
        </div>

        {/* Grid de posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl border border-white/5 bg-gray-950 overflow-hidden hover:border-red-800/30 transition-all"
            >
              {/* Imagen placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-5xl">
                {post.categoria === "tecnicas"     ? "🥋" :
                 post.categoria === "competencias" ? "🏆" :
                 post.categoria === "nutricion"    ? "🥗" : "📖"}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-red-400 bg-red-950/40 px-2 py-0.5 rounded-full">
                    {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatFecha(post.fechaPublicacion)}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-red-300 transition-colors line-clamp-2">
                  {post.titulo}
                </h2>

                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                  {post.resumen}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{post.autor}</span>
                  <span className="text-xs text-red-400 group-hover:translate-x-1 transition-transform inline-block">
                    Leer más →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
