"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, Trash2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminGaleriaPage() {
  const [imagenes,    setImagenes]    = useState<string[]>([]);
  const [subiendo,    setSubiendo]    = useState(false);
  const [eliminando,  setEliminando]  = useState<string | null>(null);
  const [copiada,     setCopiada]     = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [mensaje,     setMensaje]     = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function cargar() {
    const res  = await fetch("/api/media");
    const data = await res.json();
    if (data.success) setImagenes(data.data);
  }

  useEffect(() => { cargar(); }, []);

  // ─── Subir ─────────────────────────────────────────────────────────────────
  async function subirImagen(file: File) {
    setSubiendo(true);
    setMensaje(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res  = await fetch("/api/media", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setMensaje({ texto: "Imagen subida correctamente", tipo: "ok" });
        cargar();
      } else {
        setMensaje({ texto: data.error ?? "Error al subir", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    } finally {
      setSubiendo(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) subirImagen(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) subirImagen(file);
  }

  // ─── Copiar URL ────────────────────────────────────────────────────────────
  function copiarUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiada(url);
    setTimeout(() => setCopiada(null), 2000);
  }

  // ─── Eliminar ──────────────────────────────────────────────────────────────
  async function eliminar(url: string) {
    if (!confirm("¿Eliminar esta imagen de Azure Blob Storage? No se puede deshacer.")) return;
    setEliminando(url);
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) {
        setImagenes((prev) => prev.filter((u) => u !== url));
        setMensaje({ texto: "Imagen eliminada", tipo: "ok" });
        setTimeout(() => setMensaje(null), 2000);
      } else {
        setMensaje({ texto: data.error ?? "Error al eliminar", tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "Error de conexión", tipo: "error" });
    } finally {
      setEliminando(null);
    }
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Galería de imágenes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sube y gestiona las imágenes del sitio. Las URLs se pueden usar en el blog y otros contenidos.
        </p>
      </div>

      {/* Zona de subida */}
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6",
          arrastrando
            ? "border-red-500 bg-red-950/20"
            : "border-white/10 hover:border-white/25 hover:bg-white/3"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileSelect}
        />
        {subiendo ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
            <p className="text-gray-400 text-sm">Subiendo imagen…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-600" />
            <p className="text-white text-sm font-medium">
              Arrastra una imagen o <span className="text-red-400">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-gray-600">JPG, PNG, WebP, GIF — máx. 5 MB</p>
          </div>
        )}
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={cn(
          "mb-5 px-4 py-2.5 rounded-lg text-sm",
          mensaje.tipo === "ok"
            ? "bg-green-950/40 border border-green-800/50 text-green-300"
            : "bg-red-950/40 border border-red-800/50 text-red-300"
        )}>
          {mensaje.texto}
        </div>
      )}

      {/* Grid de imágenes */}
      {imagenes.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay imágenes todavía.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-600 mb-4">{imagenes.length} imagen{imagenes.length !== 1 ? "es" : ""}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {imagenes.map((url) => (
              <div
                key={url}
                className="group relative rounded-xl overflow-hidden bg-gray-900 aspect-square border border-white/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Imagen de la academia"
                  className="w-full h-full object-cover"
                />

                {/* Overlay de acciones */}
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {/* Nombre del archivo */}
                  <p className="text-[10px] text-gray-300 text-center break-all line-clamp-2 px-1">
                    {url.split("/").pop()}
                  </p>

                  {/* Botón copiar URL */}
                  <button
                    onClick={() => copiarUrl(url)}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                  >
                    {copiada === url ? (
                      <><Check className="w-3 h-3 text-green-400" /> Copiada</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copiar URL</>
                    )}
                  </button>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => eliminar(url)}
                    disabled={eliminando === url}
                    className="inline-flex items-center gap-1.5 bg-red-700/80 hover:bg-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors w-full justify-center disabled:opacity-50"
                  >
                    {eliminando === url ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Eliminando…</>
                    ) : (
                      <><Trash2 className="w-3 h-3" /> Eliminar</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
