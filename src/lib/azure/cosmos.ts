/**
 * Cliente de Azure Cosmos DB
 *
 * Patrón singleton para reutilizar la conexión entre funciones serverless.
 * Azure Cosmos DB usa el SDK @azure/cosmos con el modelo de documentos NoSQL.
 *
 * Documentación: https://docs.microsoft.com/azure/cosmos-db/
 */

import { CosmosClient, Container, Database } from "@azure/cosmos";

// ─── Configuración ────────────────────────────────────────────────────────────
const endpoint = process.env.COSMOS_DB_ENDPOINT!;
const key      = process.env.COSMOS_DB_KEY!;
const dbName   = process.env.COSMOS_DB_DATABASE ?? "bjj-academy";

// ─── Singleton ────────────────────────────────────────────────────────────────
let client: CosmosClient | null = null;
let database: Database | null   = null;

function getClient(): CosmosClient {
  if (!client) {
    if (!endpoint || !key) {
      throw new Error(
        "Faltan variables de entorno: COSMOS_DB_ENDPOINT y COSMOS_DB_KEY"
      );
    }
    client = new CosmosClient({ endpoint, key });
  }
  return client;
}

async function getDatabase(): Promise<Database> {
  if (!database) {
    const { database: db } = await getClient()
      .databases.createIfNotExists({ id: dbName });
    database = db;
  }
  return database;
}

// ─── Helpers por colección ────────────────────────────────────────────────────

/**
 * Obtiene (o crea) un container de Cosmos DB con partition key /id.
 * Cada "entidad" del dominio tiene su propio container.
 */
export async function getContainer(containerId: string): Promise<Container> {
  const db = await getDatabase();
  const { container } = await db.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ["/id"] },
  });
  return container;
}

// ─── CRUD genérico ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findAll<T = any>(containerId: string): Promise<T[]> {
  const container = await getContainer(containerId);
  const { resources } = await container.items
    .query<T>("SELECT * FROM c ORDER BY c._ts DESC")
    .fetchAll();
  return resources;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findByQuery<T = any>(
  containerId: string,
  query: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: { name: string; value: any }[] = []
): Promise<T[]> {
  const container = await getContainer(containerId);
  const { resources } = await container.items
    .query<T>({ query, parameters })
    .fetchAll();
  return resources;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function findById<T = any>(
  containerId: string,
  id: string
): Promise<T | null> {
  const container = await getContainer(containerId);
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { resource } = await container.item(id, id).read<any>();
    return resource ?? null;
  } catch {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createItem<T extends { id: string } = any>(
  containerId: string,
  item: T
): Promise<T> {
  const container = await getContainer(containerId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { resource } = await container.items.create<any>(item);
  return resource!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateItem<T extends { id: string } = any>(
  containerId: string,
  id: string,
  item: Partial<T>
): Promise<T> {
  const container = await getContainer(containerId);
  const existing = await findById<T>(containerId, id);
  if (!existing) throw new Error(`Item ${id} no encontrado en ${containerId}`);
  const updated = { ...existing, ...item, updatedAt: new Date().toISOString() } as T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { resource } = await container.items.upsert<any>(updated);
  return resource!;
}

export async function deleteItem(
  containerId: string,
  id: string
): Promise<void> {
  const container = await getContainer(containerId);
  await container.item(id, id).delete();
}

// ─── Containers específicos del dominio ──────────────────────────────────────
export const CONTAINERS = {
  ALUMNOS:       "alumnos",
  CLASES:        "clases",
  MEMBRESIAS:    "membresias",
  ASISTENCIA:    "asistencia",
  POSTS:         "posts",
  INSCRIPCIONES: "inscripciones",
  USUARIOS:      "usuarios",
} as const;
