import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma segura, resolviendo conflictos.
 * Patrón estándar con shadcn/ui
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha ISO 8601 a formato legible en español
 */
export function formatFecha(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Convierte un tiempo en formato "HH:MM" a formato 12h con AM/PM
 */
export function formatHora(hora24: string): string {
  const [hStr, mStr] = hora24.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr;
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${periodo}`;
}

/**
 * Devuelve el color de Tailwind según el cinturón de BJJ
 */
export function colorCinturon(cinturon: string): string {
  const colores: Record<string, string> = {
    // Adultos
    blanco:          "bg-white text-gray-900 border border-gray-300",
    azul:            "bg-blue-600 text-white",
    morado:          "bg-purple-600 text-white",
    cafe:            "bg-amber-800 text-white",
    negro:           "bg-gray-900 text-white border border-gray-700",
    // Niños — gris
    "gris-blanco":   "bg-gray-300 text-gray-900",
    gris:            "bg-gray-400 text-gray-900",
    "gris-negro":    "bg-gray-500 text-white",
    // Niños — amarillo
    "amarillo-blanco": "bg-yellow-300 text-gray-900",
    amarillo:          "bg-yellow-400 text-gray-900",
    "amarillo-negro":  "bg-yellow-500 text-gray-900",
    // Niños — naranja
    "naranja-blanco":  "bg-orange-300 text-gray-900",
    naranja:           "bg-orange-500 text-white",
    "naranja-negro":   "bg-orange-600 text-white",
    // Niños — verde
    "verde-blanco":    "bg-green-300 text-gray-900",
    verde:             "bg-green-500 text-white",
    "verde-negro":     "bg-green-700 text-white",
  };
  return colores[cinturon] ?? "bg-gray-200 text-gray-700";
}

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalizar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Genera un slug a partir de un título
 */
export function toSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}
