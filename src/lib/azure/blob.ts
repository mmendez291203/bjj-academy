/**
 * Cliente de Azure Blob Storage
 *
 * Usado para subir/obtener imágenes de la academia:
 * - Fotos de instructores y alumnos
 * - Imágenes del blog
 * - Material multimedia
 *
 * Documentación: https://docs.microsoft.com/azure/storage/blobs/
 */

import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName    = process.env.AZURE_STORAGE_CONTAINER ?? "media";

// ─── Singleton ────────────────────────────────────────────────────────────────
let blobServiceClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient {
  if (!blobServiceClient) {
    if (!connectionString) {
      throw new Error(
        "Falta variable de entorno: AZURE_STORAGE_CONNECTION_STRING"
      );
    }
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  }
  return blobServiceClient;
}

async function getContainerClient(): Promise<ContainerClient> {
  const client = getBlobServiceClient();
  const container = client.getContainerClient(containerName);
  // Crea el container si no existe, con acceso público para imágenes
  await container.createIfNotExists({ access: "blob" });
  return container;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Sube un archivo a Azure Blob Storage y retorna su URL pública.
 *
 * @param buffer      - Contenido del archivo como Buffer
 * @param filename    - Nombre único del archivo (usa crypto.randomUUID() + ext)
 * @param contentType - MIME type (e.g. "image/jpeg", "image/png")
 * @returns URL pública del blob
 */
export async function uploadBlob(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const container = await getContainerClient();
  const blockBlobClient = container.getBlockBlobClient(filename);

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blockBlobClient.url;
}

/**
 * Elimina un blob por su nombre o URL completa.
 */
export async function deleteBlob(filenameOrUrl: string): Promise<void> {
  const container = await getContainerClient();

  // Extrae solo el nombre si se pasó URL completa
  const filename = filenameOrUrl.includes("/")
    ? filenameOrUrl.split("/").pop()!
    : filenameOrUrl;

  const blobClient = container.getBlobClient(filename);
  await blobClient.deleteIfExists();
}

/**
 * Lista todos los blobs en el container (útil para la galería).
 */
export async function listBlobs(): Promise<string[]> {
  const container = await getContainerClient();
  const urls: string[] = [];

  for await (const blob of container.listBlobsFlat()) {
    const blobClient = container.getBlobClient(blob.name);
    urls.push(blobClient.url);
  }

  return urls;
}

/**
 * Genera una URL con SAS token para acceso temporal a blobs privados.
 * Útil para documentos sensibles que no deben ser públicos.
 *
 * @param filename  - Nombre del blob
 * @param expiresInMinutes - Tiempo de expiración (default: 60 min)
 */
export async function generateSasUrl(
  filename: string,
  expiresInMinutes = 60
): Promise<string> {
  const container = await getContainerClient();
  const blobClient = container.getBlobClient(filename);

  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);

  const sasUrl = await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn,
  });

  return sasUrl;
}
