"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GaleriaPage() {
  const [imagenes, setImagenes]     = useState<string[]>([]);
  const [subiendo, setSubiendo]     = useState(false);
  const [mensaje, setMensaje]       = useState<{ texto: string; tipo: "ok" | "error" } | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar imágenes existentes al abrir la página
  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => { if (d.success) setImagenes(d.data); })
      .catch(() => {});
  }, []);

  // ─── Subir imagen ──────────────────────────────────────────────────────────
  async function subirImagen(file: File) {
    setSubiendo(true);
    setMensaje(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res  = await fetch("/api/media", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setImagenes((prev) => [data.data.url, ...prev]);
        setMensaje({ texto: "✅ Imagen subida exitosamente", tipo: "ok" });
      } else {
        setMensaje({ texto: `❌ ${data.error}`, tipo: "error" });
      }
    } catch {
      setMensaje({ texto: "❌ Error de conexión", tipo: "error" });
    } finally {
      setSubiendo(false);
      setTimeout(() => setMensaje(null), 4000);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) subirImagen(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) subirImagen(file);
  }

  // ─── Copiar URL al clipboard ───────────────────────────────────────────────
  function copiarUrl(url: string) {
    navigator.clipboard.writeText(url);
    setMensaje({ texto: "📋 URL copiada al portapapeles", tipo: "ok" });
    setTimeout(() => setMensaje(null), 2000);
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">🖼️ Galería de Imágenes</h1>
          <p className="text-gray-400">
            Sube las fotos de la academia, instructores y torneos. Las imágenes se guardan en{" "}
            <span className="text-blue-400 font-mono text-sm">Azure Blob Storage</span>.
          </p>
        </div>

        {/* Zona de subida */}
        <div
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-8",
            arrastrando
              ? "border-red-500 bg-red-950/20"
              : "border-white/10 hover:border-white/30 hover:bg-white/5"
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
              <Loader2 className="w-10 h-10 text-red-400 animate-spin" />
              <p className="text-gray-300">Subiendo a Azure Blob Storage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-gray-500" />
              <p className="text-white font-medium">
                Arrastra una imagen aquí o <span className="text-red-400">haz click para seleccionar</span>
              </p>
              <p className="text-xs text-gray-500">JPG, PNG, WebP, GIF — máximo 5MB</p>
            </div>
          )}
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={cn(
            "mb-6 px-4 py-3 rounded-lg text-sm",
            mensaje.tipo === "ok"
              ? "bg-green-950/40 border border-green-800 text-green-300"
              : "bg-red-950/40 border border-red-800 text-red-300"
          )}>
            {mensaje.texto}
          </div>
        )}

        {/* Grid de imágenes */}
        {imagenes.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay imágenes todavía. ¡Sube la primera!</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">{imagenes.length} imagen{imagenes.length !== 1 ? "es" : ""} en Azure Blob Storage</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

                  {/* Overlay con URL */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
                    <p className="text-xs text-gray-300 text-center break-all line-clamp-3">
                      {url.split("/").pop()}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copiarUrl(url)}
                      className="text-xs"
                    >
                      📋 Copiar URL
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Nota explicativa */}
        <div className="mt-10 rounded-lg border border-blue-900/30 bg-blue-950/20 px-4 py-3">
          <p className="text-xs text-blue-400">
            <strong>💡 ¿Cómo usar las imágenes?</strong> Sube una foto, copia su URL y úsala en el contenido de instructores, blog, o donde necesites. La URL pública funciona desde cualquier navegador.
          </p>
        </div>
      </div>
    </div>
  );
}
