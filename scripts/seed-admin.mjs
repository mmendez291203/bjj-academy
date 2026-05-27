/**
 * Registra al usuario admin en Cosmos DB.
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
  id:       "usr-admin-001",
  email:    "mariomendezzu87@gmail.com",
  nombre:   "Mario Méndez",
  rol:      "admin",
  cinturon: "blanco",
  galones:  0,
  activo:   true,
  creadoEn: new Date().toISOString(),
};

async function main() {
  console.log("🚀 Registrando usuario admin en Cosmos DB...");

  // Crear container si no existe
  const { container } = await database.containers.createIfNotExists({
    id: "usuarios",
    partitionKey: { paths: ["/id"] },
  });

  await container.items.upsert(adminUser);
  console.log(`✅ Admin registrado: ${adminUser.email} (rol: ${adminUser.rol})`);
}

main().catch(console.error);
