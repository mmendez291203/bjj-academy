import { readFileSync } from "fs";
import { CosmosClient } from "@azure/cosmos";

const env = readFileSync(".env.local", "utf-8");
const vars = {};
for (const line of env.split("\n")) {
  const [k, ...v] = line.split("=");
  if (k && !k.startsWith("#")) vars[k.trim()] = v.join("=").trim().replace(/^"|"$/g, "");
}

const client    = new CosmosClient({ endpoint: vars.COSMOS_DB_ENDPOINT, key: vars.COSMOS_DB_KEY });
const database  = client.database(vars.COSMOS_DB_DATABASE);
const container = database.container("clases");

// 1. Borrar todo lo que haya
const { resources: todas } = await container.items.readAll().fetchAll();
console.log(`Eliminando ${todas.length} clases existentes...`);
for (const c of todas) {
  await container.item(c.id, c.id).delete();
  console.log(`  ✗ eliminada: ${c.id} — ${c.nombre ?? ""} ${c.dia ?? ""}`);
}

// 2. Insertar las 5 correctas
const INSTRUCTOR = "Carlos Alberto Donado Nadales";
const clases = [
  { id: "cls-001", nombre: "BJJ Gi",    tipo: "gi",    nivel: "todos", dia: "lunes",     horaInicio: "19:30", horaFin: "21:00", instructor: INSTRUCTOR, capacidadMaxima: 20, descripcion: "Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.", activa: true },
  { id: "cls-002", nombre: "BJJ No-Gi", tipo: "no-gi", nivel: "todos", dia: "martes",    horaInicio: "19:30", horaFin: "21:00", instructor: INSTRUCTOR, capacidadMaxima: 20, descripcion: "Clase sin kimono. Énfasis en control, submissions y wrestling.",             activa: true },
  { id: "cls-003", nombre: "BJJ Gi",    tipo: "gi",    nivel: "todos", dia: "miercoles", horaInicio: "19:30", horaFin: "21:00", instructor: INSTRUCTOR, capacidadMaxima: 20, descripcion: "Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.", activa: true },
  { id: "cls-004", nombre: "BJJ No-Gi", tipo: "no-gi", nivel: "todos", dia: "jueves",    horaInicio: "19:30", horaFin: "21:00", instructor: INSTRUCTOR, capacidadMaxima: 20, descripcion: "Clase sin kimono. Énfasis en control, submissions y wrestling.",             activa: true },
  { id: "cls-005", nombre: "Open Mat",  tipo: "no-gi", nivel: "todos", dia: "viernes",   horaInicio: "19:00", horaFin: "21:00", instructor: INSTRUCTOR, capacidadMaxima: 30, descripcion: "Mat abierto para todos. Gi y No-Gi bienvenidos. Sparring libre.",          activa: true },
];

console.log("\nInsertando horario correcto...");
for (const clase of clases) {
  await container.items.create(clase);
  console.log(`  ✓ ${clase.dia.padEnd(10)} — ${clase.nombre} (${clase.horaInicio}–${clase.horaFin})`);
}

console.log("\n✅ Listo. 5 clases en Cosmos DB.");
