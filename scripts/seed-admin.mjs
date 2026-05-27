/**
 * Registra al usuario admin en Cosmos DB con datos reales.
 * Uso: node scripts/seed-admin.mjs
 */

import { CosmosClient } from "@azure/cosmos";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const lines = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    }
  } catch {
    console.log("⚠️  Usando variables del sistema");
  }
}

loadEnv();

const client   = new CosmosClient({ endpoint: process.env.COSMOS_DB_ENDPOINT, key: process.env.COSMOS_DB_KEY });
const database = client.database(process.env.COSMOS_DB_DATABASE ?? "bjj-academy");

const adminUser = {
  id:                "usr-admin-001",
  email:             "mariomendezzu87@gmail.com",
  nombre:            "Mario Méndez",
  rol:               "admin",
  cinturon:          "blanco",
  grados:            2,           // rayas en el cinturón (0–4)
  clasesCompletadas: 120,         // ~Oct 2025 – May 2026, promedio 4x/semana
  clasesEsteMes:     0,           // se calcula automáticamente con el módulo de asistencia
  proximoPago:       "2026-05-30T12:00:00.000Z", // 30 de cada mes
  fechaInicio:       "2025-10-01",
  activo:            true,
  creadoEn:          new Date().toISOString(),
};

async function main() {
  console.log("🚀 Actualizando usuario admin en Cosmos DB...");

  const { container } = await database.containers.createIfNotExists({
    id: "usuarios",
    partitionKey: { paths: ["/id"] },
  });

  await container.items.upsert(adminUser);
  console.log(`✅ Admin actualizado: ${adminUser.email}`);
  console.log(`   Cinturón: ${adminUser.cinturon} · ${adminUser.grados} grados`);
  console.log(`   Clases: ${adminUser.clasesCompletadas} totales`);
}

main().catch(console.error);
