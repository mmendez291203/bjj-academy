import type { Metadata } from "next";
import Link from "next/link";
import { findAll, CONTAINERS } from "@/lib/azure/cosmos";
import { formatFecha, cn } from "@/lib/utils";
import type { Post } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — RUNAJERABJJ",
  description: "Técnicas, competencias, noticias y todo lo que necesitas saber sobre BJJ.",
};

const CATEGORIA_LABEL: Record<string, string> = {
  tecnicas:     "Técnicas",
  competencias: "Competencias",
  noticias:     "Noticias",
  nutricion:    "Nutrición",
  consejos:     "Consejos",
};

const CATEGORIA_COLOR: Record<string, string> = {
  tecnicas:     "bg-blue-950/40 text-blue-400",
  competencias: "bg-yellow-950/40 text-yellow-400",
  noticias:     "bg-red-950/40 text-red-400",
  nutricion:    "bg-green-950/40 text-green-400",
  consejos:     "bg-purple-950/40 text-purple-400",
};

export default async function BlogPage() {
  let posts: Post[] = [];
  try {
    const todos = await findAll<Post>(CONTAINERS.POSTS);
    posts = todos
      .filter((p) => p.publicado)
      .sort((a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion));
  } catch {
    // Si falla Cosmos DB, muestra lista vacía
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">Blog</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Técnicas, competencias, noticias y todo lo que necesitas saber para mejorar en el tatami.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p>No hay artículos publicados todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-white/5 bg-gray-950 overflow-hidden hover:border-red-800/30 transition-all"
              >
                {/* Imagen de portada */}
                {post.imagen ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imagen}
                    alt={post.titulo}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center text-5xl">
                    📖
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      CATEGORIA_COLOR[post.categoria] ?? "bg-gray-800 text-gray-400"
                    )}>
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
        )}
      </div>
    </div>
  );
}
