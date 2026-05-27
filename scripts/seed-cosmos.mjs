/**
 * Script para cargar datos iniciales en Cosmos DB
 * Uso: node scripts/seed-cosmos.mjs
 *
 * Lee las credenciales del archivo .env.local (nunca las pongas directo en el código)
 */

import { CosmosClient } from "@azure/cosmos";
import { readFileSync } from "fs";
import { resolve } from "path";

// ─── Leer .env.local manualmente ─────────────────────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) {
        process.env[key.trim()] = rest.join("=").trim();
      }
    }
  } catch {
    console.log("⚠️  No se encontró .env.local, usando variables del sistema");
  }
}

loadEnv();

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key      = process.env.COSMOS_DB_KEY;
const dbName   = process.env.COSMOS_DB_DATABASE ?? "bjj-academy";

if (!endpoint || !key) {
  console.error("❌ Faltan variables COSMOS_DB_ENDPOINT y COSMOS_DB_KEY en .env.local");
  process.exit(1);
}

const client   = new CosmosClient({ endpoint, key });
const database = client.database(dbName);

// ─── Datos de clases RUNAJERABJJ ─────────────────────────────────────────────
const INSTRUCTOR = "Carlos Alberto Donado Nadales";

const clases = [
  { id:"cls-001", nombre:"BJJ Gi",             tipo:"gi",    nivel:"todos", dia:"lunes",    horaInicio:"19:30", horaFin:"21:00", instructor:INSTRUCTOR, capacidadMaxima:20, descripcion:"Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.", activa:true },
  { id:"cls-002", nombre:"BJJ No-Gi",           tipo:"no-gi", nivel:"todos", dia:"martes",   horaInicio:"19:30", horaFin:"21:00", instructor:INSTRUCTOR, capacidadMaxima:20, descripcion:"Clase sin kimono. Énfasis en control, submissions y wrestling.",              activa:true },
  { id:"cls-003", nombre:"BJJ Gi",             tipo:"gi",    nivel:"todos", dia:"miercoles", horaInicio:"19:30", horaFin:"21:00", instructor:INSTRUCTOR, capacidadMaxima:20, descripcion:"Clase de Brazilian Jiu-Jitsu con kimono. Técnica, posiciones y sparring.", activa:true },
  { id:"cls-004", nombre:"BJJ No-Gi",           tipo:"no-gi", nivel:"todos", dia:"jueves",   horaInicio:"19:30", horaFin:"21:00", instructor:INSTRUCTOR, capacidadMaxima:20, descripcion:"Clase sin kimono. Énfasis en control, submissions y wrestling.",              activa:true },
  { id:"cls-005", nombre:"Open Mat — Gi / No-Gi", tipo:"gi", nivel:"todos", dia:"viernes",  horaInicio:"19:30", horaFin:"21:00", instructor:INSTRUCTOR, capacidadMaxima:30, descripcion:"Mat abierto. Gi y No-Gi bienvenidos. Sparring libre y técnica.",              activa:true },
];

// ─── Función para insertar datos ──────────────────────────────────────────────
async function seedContainer(containerName, items) {
  const container = database.container(containerName);
  console.log(`\n📦 Cargando ${items.length} items en '${containerName}'...`);
  for (const item of items) {
    try {
      await container.items.upsert(item);
      console.log(`  ✅ ${item.nombre ?? item.id}`);
    } catch (err) {
      console.log(`  ❌ Error en ${item.id}:`, err.message);
    }
  }
}

async function main() {
  console.log("🚀 Iniciando carga de datos en Cosmos DB...");
  await seedContainer("clases", clases);
  console.log("\n✅ ¡Datos cargados exitosamente!");
}

main().catch(console.error);
