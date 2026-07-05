// ─────────────────────────────────────────────────────────────────────────────
// Tipos globales del proyecto BJJ Academy
// ─────────────────────────────────────────────────────────────────────────────

// ─── Alumno ──────────────────────────────────────────────────────────────────
export type Cinturon =
  | "blanco"
  | "gris-blanco" | "gris" | "gris-negro"
  | "amarillo-blanco" | "amarillo" | "amarillo-negro"
  | "naranja-blanco" | "naranja" | "naranja-negro"
  | "verde-blanco" | "verde" | "verde-negro"
  | "azul"
  | "morado"
  | "cafe"
  | "negro";

export type PerfilHijo = {
  id: string;
  nombre: string;
  cinturon: string;
  grados: number;
  clasesCompletadas: number;
  fechaInicio?: string;
  proximoPago?: string | null;
  cumpleanos?: string;
  foto?: string;
};

export type Galón = 0 | 1 | 2 | 3 | 4;

export interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;        // ISO 8601
  cinturon: Cinturon;
  galones: Galón;
  fechaInicio: string;             // ISO 8601
  activo: boolean;
  foto?: string;                   // URL de Azure Blob
  rol: "alumno" | "instructor" | "admin" | "padre";
  createdAt: string;
  updatedAt: string;
}

// ─── Clases ──────────────────────────────────────────────────────────────────
export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type NivelClase = "principiante" | "intermedio" | "avanzado" | "todos" | "kids";
export type TipoClase = "gi" | "no-gi" | "kids";

export interface Clase {
  id: string;
  nombre: string;
  tipo: TipoClase;
  nivel: NivelClase;
  dia: DiaSemana;
  horaInicio: string;              // "HH:MM" formato 24h
  horaFin: string;
  instructor: string;
  capacidadMaxima: number;
  descripcion?: string;
  activa: boolean;
}

// ─── Membresías ───────────────────────────────────────────────────────────────
export type TipoMembresia = "mensual" | "trimestral" | "anual";
export type EstadoMembresia = "activa" | "vencida" | "suspendida" | "trial";

export interface Membresia {
  id: string;
  alumnoId: string;
  tipo: TipoMembresia;
  estado: EstadoMembresia;
  fechaInicio: string;
  fechaVencimiento: string;
  precio: number;
  moneda: "MXN" | "USD";
}

// ─── Inscripciones ────────────────────────────────────────────────────────────
export interface FormInscripcion {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  edad: number;
  experienciaPrevia: boolean;
  claseInteres: TipoClase;
  mensaje?: string;
  comoNosEncontraste?: string;
  tipo?: "adulto" | "kids";
}

export interface FormInscripcionKids {
  tipo: "kids";
  nombreHijo: string;
  apellido: string;
  emailPapa: string;
  telefono: string;
  edadHijo: number;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────
export type CategoriaPost =
  | "tecnicas"
  | "competencias"
  | "noticias"
  | "nutricion"
  | "consejos";

export interface Post {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;              // Markdown o HTML
  categoria: CategoriaPost;
  autor: string;
  imagen?: string;               // URL de Azure Blob
  publicado: boolean;
  fechaPublicacion: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Asistencia ───────────────────────────────────────────────────────────────
export interface RegistroAsistencia {
  id: string;
  alumnoId: string;
  claseId: string;
  fecha: string;                 // ISO 8601
  presente: boolean;
}

// ─── API Responses ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Navegación ───────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
