"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type Post = {
  id:               string;
  slug:             string;
  titulo:           string;
  categoria:        string;
  autor:            string;
  publicado:        boolean;
  fechaPublicacion: string;
  creadoEn:         string;
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
  const [posts,     setPosts]     = useState<Post[]>([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/posts");
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al cargar"); return; }
      const sorted = (data.data as Post[]).sort(
        (a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion)
      );
      setPosts(sorted);
    } catch {
      setError("Error de conexión.");
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
    if (!confirm(`¿Eliminar "${post.titulo}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(post.id);
    await fetch(`/api/admin/posts/${post.id}`, { method: "DELETE" });
    setEliminando(null);
    cargar();
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los artículos del blog</p>
        </div>
        <Link
          href="/admin/blog/nuevo"
          className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2 mb-6">
          {error}
        </p>
      )}

      {/* Cargando */}
      {cargando ? (
        <div className="text-center py-20 text-gray-600 text-sm">Cargando artículos…</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="mb-4">No hay artículos todavía.</p>
          <Link href="/admin/blog/nuevo" className="text-white underline text-sm">
            Crear el primero →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-xl border border-white/5 bg-gray-950 px-5 py-4 hover:border-white/10 transition-colors"
            >
              {/* Indicador publicado */}
              <span className={`w-2 h-2 rounded-full shrink-0 ${post.publicado ? "bg-green-500" : "bg-gray-700"}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{post.titulo}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-600">{post.fechaPublicacion}</span>
                  <span className="text-xs text-gray-600">{CATEGORIA_LABEL[post.categoria] ?? post.categoria}</span>
                  <span className="text-xs text-gray-600">{post.autor}</span>
                  {!post.publicado && (
                    <span className="text-xs text-yellow-600 font-medium">Borrador</span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Ver en blog */}
                {post.publicado && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                    title="Ver en blog"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}

                {/* Toggle publicado */}
                <button
                  onClick={() => togglePublicado(post)}
                  className="p-2 text-gray-600 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title={post.publicado ? "Despublicar" : "Publicar"}
                >
                  {post.publicado ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Editar */}
                <button
                  onClick={() => router.push(`/admin/blog/${post.id}`)}
                  className="p-2 text-gray-600 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                {/* Eliminar */}
                <button
                  onClick={() => eliminar(post)}
                  disabled={eliminando === post.id}
                  className="p-2 text-gray-600 hover:text-red-400 rounded-lg hover:bg-red-900/10 transition-colors disabled:opacity-40"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer info */}
      {!cargando && posts.length > 0 && (
        <p className="text-xs text-gray-700 mt-6">
          {posts.filter((p) => p.publicado).length} publicados · {posts.filter((p) => !p.publicado).length} borradores
        </p>
      )}
    </div>
  );
}
