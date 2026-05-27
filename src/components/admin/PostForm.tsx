"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type PostData = {
  titulo:           string;
  resumen:          string;
  contenido:        string;
  categoria:        string;
  autor:            string;
  imagen:           string;
  publicado:        boolean;
  fechaPublicacion: string;
  tags:             string; // comma-separated en el form
};

type Props = {
  postId?: string;         // si existe → modo edición
  initial?: Partial<PostData>;
};

const CATEGORIAS = [
  { value: "noticias",     label: "Noticias"     },
  { value: "tecnicas",     label: "Técnicas"     },
  { value: "consejos",     label: "Consejos"     },
  { value: "competencias", label: "Competencias" },
  { value: "nutricion",    label: "Nutrición"    },
];

const HOY = new Date().toISOString().slice(0, 10);

export default function PostForm({ postId, initial }: Props) {
  const router  = useRouter();
  const esEdicion = !!postId;

  const [form, setForm] = useState<PostData>({
    titulo:           initial?.titulo           ?? "",
    resumen:          initial?.resumen          ?? "",
    contenido:        initial?.contenido        ?? "",
    categoria:        initial?.categoria        ?? "noticias",
    autor:            initial?.autor            ?? "Carlos Alberto Donado",
    imagen:           initial?.imagen           ?? "",
    publicado:        initial?.publicado        ?? false,
    fechaPublicacion: initial?.fechaPublicacion ?? HOY,
    tags:             Array.isArray(initial?.tags)
      ? (initial.tags as unknown as string[]).join(", ")
      : (initial?.tags ?? ""),
  });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState("");

  function set(field: keyof PostData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function guardar() {
    setGuardando(true);
    setError("");

    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const url    = esEdicion ? `/api/admin/posts/${postId}` : "/api/admin/posts";
    const method = esEdicion ? "PATCH" : "POST";

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  const field = "w-full bg-gray-950 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-gray-700";
  const label = "block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Título */}
      <div>
        <label className={label}>Título</label>
        <input
          type="text"
          value={form.titulo}
          onChange={(e) => set("titulo", e.target.value)}
          placeholder="Ej: Nuestros kids en competencia"
          className={field}
        />
      </div>

      {/* Resumen */}
      <div>
        <label className={label}>Resumen <span className="text-gray-600 normal-case">(aparece en la lista del blog)</span></label>
        <textarea
          rows={3}
          value={form.resumen}
          onChange={(e) => set("resumen", e.target.value)}
          placeholder="Una o dos oraciones que describan el artículo..."
          className={cn(field, "resize-none")}
        />
      </div>

      {/* Categoría + Autor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Categoría</label>
          <select
            value={form.categoria}
            onChange={(e) => set("categoria", e.target.value)}
            className={field}
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Autor</label>
          <input
            type="text"
            value={form.autor}
            onChange={(e) => set("autor", e.target.value)}
            className={field}
          />
        </div>
      </div>

      {/* Imagen de portada */}
      <div>
        <label className={label}>URL de imagen de portada</label>
        <input
          type="url"
          value={form.imagen}
          onChange={(e) => set("imagen", e.target.value)}
          placeholder="https://bjjacademymedia.blob.core.windows.net/media/..."
          className={field}
        />
        {form.imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imagen} alt="" className="mt-2 h-32 w-full object-cover rounded-lg border border-white/5" />
        )}
      </div>

      {/* Contenido (HTML) */}
      <div>
        <label className={label}>
          Contenido <span className="text-gray-600 normal-case">(HTML — usa &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;img src="..."&gt;)</span>
        </label>
        <textarea
          rows={16}
          value={form.contenido}
          onChange={(e) => set("contenido", e.target.value)}
          placeholder="<p>Escribe el contenido del artículo aquí...</p>"
          className={cn(field, "resize-y font-mono text-xs leading-relaxed")}
        />
      </div>

      {/* Tags */}
      <div>
        <label className={label}>Tags <span className="text-gray-600 normal-case">(separados por coma)</span></label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="bjj, competencia, kids"
          className={field}
        />
      </div>

      {/* Fecha + Publicado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className={label}>Fecha de publicación</label>
          <input
            type="date"
            value={form.fechaPublicacion}
            onChange={(e) => set("fechaPublicacion", e.target.value)}
            className={cn(field, "[color-scheme:dark]")}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-950 px-4 py-3">
          <span className="text-sm text-gray-400">Publicar artículo</span>
          <button
            type="button"
            onClick={() => set("publicado", !form.publicado)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              form.publicado ? "bg-green-600" : "bg-gray-700"
            )}
          >
            <span className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              form.publicado ? "translate-x-6" : "translate-x-1"
            )} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.push("/admin/blog")}
          className="px-5 py-2.5 rounded-lg border border-white/10 text-gray-400 text-sm hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={guardar}
          disabled={guardando || !form.titulo || !form.contenido}
          className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Publicar artículo"}
        </button>
      </div>
    </div>
  );
}
