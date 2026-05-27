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

// ─── Datos de clases ──────────────────────────────────────────────────────────
const clases = [
  { id:"cls-001", nombre:"BJJ Fundamentals", tipo:"gi", nivel:"principiante", dia:"lunes", horaInicio:"07:00", horaFin:"08:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:20, activa:true },
  { id:"cls-002", nombre:"BJJ Avanzado", tipo:"gi", nivel:"avanzado", dia:"lunes", horaInicio:"19:00", horaFin:"20:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:15, activa:true },
  { id:"cls-003", nombre:"No-Gi Grappling", tipo:"no-gi", nivel:"todos", dia:"lunes", horaInicio:"20:30", horaFin:"22:00", instructor:"Coach Ana Torres", capacidadMaxima:18, activa:true },
  { id:"cls-004", nombre:"Kids BJJ (6-12 años)", tipo:"kids", nivel:"kids", dia:"martes", horaInicio:"16:00", horaFin:"17:00", instructor:"Coach Sofía Ramírez", capacidadMaxima:12, activa:true },
  { id:"cls-005", nombre:"Open Mat — Sparring", tipo:"gi", nivel:"intermedio", dia:"martes", horaInicio:"19:00", horaFin:"20:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:25, activa:true },
  { id:"cls-006", nombre:"Wrestling & Takedowns", tipo:"wrestling", nivel:"todos", dia:"miercoles", horaInicio:"07:00", horaFin:"08:30", instructor:"Coach Ana Torres", capacidadMaxima:20, activa:true },
  { id:"cls-007", nombre:"BJJ Fundamentals", tipo:"gi", nivel:"principiante", dia:"miercoles", horaInicio:"19:00", horaFin:"20:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:20, activa:true },
  { id:"cls-008", nombre:"No-Gi Avanzado", tipo:"no-gi", nivel:"avanzado", dia:"jueves", horaInicio:"19:00", horaFin:"20:30", instructor:"Coach Ana Torres", capacidadMaxima:15, activa:true },
  { id:"cls-009", nombre:"Kids BJJ (6-12 años)", tipo:"kids", nivel:"kids", dia:"jueves", horaInicio:"16:00", horaFin:"17:00", instructor:"Coach Sofía Ramírez", capacidadMaxima:12, activa:true },
  { id:"cls-010", nombre:"BJJ Avanzado", tipo:"gi", nivel:"avanzado", dia:"viernes", horaInicio:"07:00", horaFin:"08:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:15, activa:true },
  { id:"cls-011", nombre:"Fitness & Conditioning", tipo:"fitness", nivel:"todos", dia:"viernes", horaInicio:"19:00", horaFin:"20:00", instructor:"Coach Sofía Ramírez", capacidadMaxima:25, activa:true },
  { id:"cls-012", nombre:"Open Mat", tipo:"gi", nivel:"todos", dia:"viernes", horaInicio:"20:00", horaFin:"21:30", instructor:"Prof. Carlos Mendoza", capacidadMaxima:30, activa:true },
  { id:"cls-013", nombre:"BJJ Todo Nivel", tipo:"gi", nivel:"todos", dia:"sabado", horaInicio:"09:00", horaFin:"11:00", instructor:"Prof. Carlos Mendoza", capacidadMaxima:30, activa:true },
  { id:"cls-014", nombre:"Kids Open Mat", tipo:"kids", nivel:"kids", dia:"sabado", horaInicio:"11:00", horaFin:"12:00", instructor:"Coach Sofía Ramírez", capacidadMaxima:15, activa:true },
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
