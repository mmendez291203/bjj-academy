/**
 * Registra al instructor en Cosmos DB.
 * Uso: node scripts/seed-instructor.mjs <email> <nombre>
 *
 * Ejemplo:
 *   node scripts/seed-instructor.mjs carlos@gmail.com "Carlos Alberto Donado"
 *
 * Luego el instructor inicia sesión con Google y ya tendrá rol=instructor.
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

const email  = process.argv[2];
const nombre = process.argv[3] ?? "Instructor";

if (!email) {
  console.error("❌  Uso: node scripts/seed-instructor.mjs <email> <nombre>");
  process.exit(1);
}

const client   = new CosmosClient({ endpoint: process.env.COSMOS_DB_ENDPOINT, key: process.env.COSMOS_DB_KEY });
const database = client.database(process.env.COSMOS_DB_DATABASE ?? "bjj-academy");

const instructor = {
  id:       `usr-instructor-${Date.now()}`,
  email,
  nombre,
  rol:      "instructor",
  cinturon: "cafe",   // Carlos es café
  grados:   0,
  activo:   true,
  creadoEn: new Date().toISOString(),
};

async function main() {
  console.log(`🥋 Registrando instructor: ${nombre} <${email}>`);

  const { container } = await database.containers.createIfNotExists({
    id: "usuarios",
    partitionKey: { paths: ["/id"] },
  });

  // Verificar si ya existe
  const { resources } = await container.items
    .query({ query: "SELECT * FROM c WHERE c.email = @email", parameters: [{ name: "@email", value: email }] })
    .fetchAll();

  if (resources.length > 0) {
    // Actualizar rol si ya existe
    const existing = resources[0];
    await container.items.upsert({ ...existing, rol: "instructor", nombre });
    console.log(`✅ Instructor actualizado (ya existía): ${email}`);
  } else {
    await container.items.upsert(instructor);
    console.log(`✅ Instructor creado: ${email} (rol: instructor)`);
  }

  console.log("\n📌 Cuando Carlos inicie sesión con Google, ya tendrá:");
  console.log("   - Acceso a /admin/asistencia");
  console.log("   - Botón 📋 Asistencia en el navbar");
  console.log("   - Sin acceso a edición de alumnos ni inscripciones");
}

main().catch(console.error);
