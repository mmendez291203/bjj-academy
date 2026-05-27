/**
 * Datos de clases de RUNAJERABJJ — fallback cuando Cosmos DB no está disponible.
 * Horario real: Lunes a Viernes, 7:30 PM – 9:00 PM
 */

import type { Clase } from "@/types";

const INSTRUCTOR = "Carlos Alberto Donado Nadales";

export const clasesMock: Clase[] = [
  // ─── Lunes — Gi ─────────────────────────────────────────────────────────────
  {
    id: "cls-001",
    nombre: "BJJ Gi",
    tipo: "gi",
    nivel: "todos",
    dia: "lunes",
    horaInicio: "19:30",
    horaFin: "21:00",
    instructor: INSTRUCTOR,
    capacidadMaxima: 20,
    descripcion: "Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.",
    activa: true,
  },

  // ─── Martes — No-Gi ─────────────────────────────────────────────────────────
  {
    id: "cls-002",
    nombre: "BJJ No-Gi",
    tipo: "no-gi",
    nivel: "todos",
    dia: "martes",
    horaInicio: "19:30",
    horaFin: "21:00",
    instructor: INSTRUCTOR,
    capacidadMaxima: 20,
    descripcion: "Clase sin kimono. Énfasis en control, submissions y wrestling.",
    activa: true,
  },

  // ─── Miércoles — Gi ─────────────────────────────────────────────────────────
  {
    id: "cls-003",
    nombre: "BJJ Gi",
    tipo: "gi",
    nivel: "todos",
    dia: "miercoles",
    horaInicio: "19:30",
    horaFin: "21:00",
    instructor: INSTRUCTOR,
    capacidadMaxima: 20,
    descripcion: "Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.",
    activa: true,
  },

  // ─── Jueves — No-Gi ─────────────────────────────────────────────────────────
  {
    id: "cls-004",
    nombre: "BJJ No-Gi",
    tipo: "no-gi",
    nivel: "todos",
    dia: "jueves",
    horaInicio: "19:30",
    horaFin: "21:00",
    instructor: INSTRUCTOR,
    capacidadMaxima: 20,
    descripcion: "Clase sin kimono. Énfasis en control, submissions y wrestling.",
    activa: true,
  },

  // ─── Viernes — Open Mat ──────────────────────────────────────────────────────
  {
    id: "cls-005",
    nombre: "Open Mat — Gi / No-Gi",
    tipo: "gi",
    nivel: "todos",
    dia: "viernes",
    horaInicio: "19:30",
    horaFin: "21:00",
    instructor: INSTRUCTOR,
    capacidadMaxima: 30,
    descripcion: "Mat abierto. Gi y No-Gi bienvenidos. Sparring libre y técnica.",
    activa: true,
  },
];

export const instructoresMock = [
  {
    id: "inst-001",
    nombre: "Carlos Alberto Donado Nadales",
    cinturon: "cafe",
    galones: 0,
    especialidad: "BJJ Gi · No-Gi",
    bio: "Instructor principal de RUNAJERABJJ. Cinturón café con sólida formación en Gi y No-Gi.",
    foto: "",
    instagram: "",
  },
];

export const testimoniosMock = [
  {
    id: "test-001",
    nombre: "Alumno A.",
    cinturon: "blanco",
    texto: "Empecé sin experiencia y desde el primer día me sentí bienvenido. El instructor explica muy bien y el ambiente es increíble.",
    foto: "",
  },
  {
    id: "test-002",
    nombre: "Alumno B.",
    cinturon: "azul",
    texto: "Las clases de No-Gi son muy completas. Se aprende mucho de wrestling y submissions. Totalmente recomendado.",
    foto: "",
  },
  {
    id: "test-003",
    nombre: "Alumno C.",
    cinturon: "blanco",
    texto: "Llevaba tiempo buscando una academia seria en Escazú. RUNAJERABJJ superó mis expectativas desde la primera clase gratis.",
    foto: "",
  },
];
