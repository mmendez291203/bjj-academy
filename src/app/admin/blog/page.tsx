"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

type Post = {
  id:               string;
  slug:             string;
  titulo:           string;
  categoria:        string;
  autor:            string;
  publicado:        boolean;
  fechaPublicacion: string;
};

const CATEGORIA_LABEL: Record<string, string> = {
  tecnicas:     "Técnicas",
  competencias: "Competencias",
  noticias:     "Noticias",
  nutricion:    "Nutrición",
  consejos:     "Consejos",
};

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts,      setPosts]      = useState<Post[]>([]);
  const [cargando,   setCargando]   = useState(true);
  const [eliminando, setEliminando] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const res  = await fetch("/api/admin/posts");
      const data = await res.json();
      if (res.ok) {
        const sorted = (data.data as Post[]).sort(
          (a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion)
        );
        setPosts(sorted);
      }
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function togglePublicado(post: Post) {
    await fetch(`/api/admin/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicado: !post.publicado }),
    });
    cargar();
  }

  async function eliminar(post: Post) {
    if (!confirm(`¿Eliminar "${post.titulo}"?`)) return;
    setEliminando(post.id);
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    setEliminando(null);
    cargar();
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-white">Artículos del blog</h1>
        <Link
          href="/admin/blog/nuevo"
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Cargando */}
      {cargando ? (
        <div className="text-center py-20 text-gray-600 text-sm">Cargando…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 mb-6">No hay artículos todavía.</p>
          <Link
            href="/admin/blog/nuevo"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear el primer artículo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-white/8 bg-gray-950 p-5"
            >
              {/* Título + categoría */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-base leading-snug mb-1">{post.titulo}</p>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                    <span>{post.fechaPublicacion}</span>
                    <span>·</span>
                    <span>{CATEGORIA_LABEL[post.categoria] ?? post.categoria}</span>
                    <span>·</span>
                    <span>{post.autor}</span>
                  </div>
                </div>

                {/* Badge estado */}
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
                  post.publicado
                    ? "bg-green-950/60 text-green-400 border border-green-900/40"
                    : "bg-gray-900 text-gray-500 border border-white/5"
                }`}>
                  {post.publicado ? "Publicado" : "Borrador"}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">

                {/* Publicar / Despublicar */}
                <button
                  onClick={() => togglePublicado(post)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    post.publicado
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-green-700 text-white hover:bg-green-600"
                  }`}
                >
                  {post.publicado ? "Despublicar" : "Publicar"}
                </button>

                {/* Editar */}
                <button
                  onClick={() => router.push(`/admin/blog/${post.id}`)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </button>

                {/* Ver en blog (solo si publicado) */}
                {post.publicado && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver en blog
                  </a>
                )}

                {/* Eliminar */}
                <button
                  onClick={() => eliminar(post)}
                  disabled={eliminando === post.id}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-950/40 text-red-400 hover:bg-red-900/50 transition-colors disabled:opacity-40 ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {eliminando === post.id ? "Eliminando…" : "Eliminar"}
                </button>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {!cargando && posts.length > 0 && (
        <p className="text-xs text-gray-700 mt-6">
          {posts.filter((p) => p.publicado).length} publicados · {posts.filter((p) => !p.publicado).length} borradores
        </p>
      )}
    </div>
  );
}
