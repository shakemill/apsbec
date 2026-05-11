import fs from "fs/promises"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const IS_DEV = !process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN === "your_blob_token_here"

// ─── Interface commune ────────────────────────────────────────────────────────

export async function storageGet(key: string): Promise<unknown | null> {
  if (IS_DEV) return localGet(key)
  return blobGet(key)
}

export async function storagePut(key: string, data: unknown): Promise<void> {
  if (IS_DEV) return localPut(key, data)
  return blobPut(key, data)
}

export async function storageDelete(key: string): Promise<void> {
  if (IS_DEV) return localDelete(key)
  return blobDelete(key)
}

export async function storageList(prefix: string): Promise<string[]> {
  if (IS_DEV) return localList(prefix)
  return blobList(prefix)
}

// ─── Adaptateur local (filesystem) ───────────────────────────────────────────

function localPath(key: string): string {
  const safe = key.replace(/\//g, "__")
  return path.join(DATA_DIR, safe)
}

async function localGet(key: string): Promise<unknown | null> {
  try {
    const content = await fs.readFile(localPath(key), "utf-8")
    return JSON.parse(content)
  } catch {
    return null
  }
}

async function localPut(key: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(localPath(key), JSON.stringify(data, null, 2), "utf-8")
}

async function localDelete(key: string): Promise<void> {
  try {
    await fs.unlink(localPath(key))
  } catch {
    // fichier déjà absent
  }
}

async function localList(prefix: string): Promise<string[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const files = await fs.readdir(DATA_DIR)
    const safePrefix = prefix.replace(/\//g, "__")
    return files
      .filter((f) => f.startsWith(safePrefix))
      .map((f) => f.replace(/__/g, "/").replace(/\.json$/, "") + ".json")
  } catch {
    return []
  }
}

// ─── Adaptateur Vercel Blob ───────────────────────────────────────────────────

async function blobGet(key: string): Promise<unknown | null> {
  const { list } = await import("@vercel/blob")
  const { blobs } = await list({ prefix: key })
  const found = blobs.find((b) => b.pathname === key)
  if (!found) return null
  try {
    const res = await fetch(found.url, { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function blobPut(key: string, data: unknown): Promise<void> {
  const { put } = await import("@vercel/blob")
  try {
    await put(key, JSON.stringify(data), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes("private store")) {
      throw new Error(
        "Votre Blob store est configuré en mode Private. " +
        "Veuillez le recréer en mode Public dans le dashboard Vercel (Storage → Create Store → Blob → Public)."
      )
    }
    throw err
  }
}

async function blobDelete(key: string): Promise<void> {
  const { list, del } = await import("@vercel/blob")
  const { blobs } = await list({ prefix: key })
  const found = blobs.find((b) => b.pathname === key)
  if (found) await del(found.url)
}

async function blobList(prefix: string): Promise<string[]> {
  const { list } = await import("@vercel/blob")
  const { blobs } = await list({ prefix })
  return blobs.map((b) => b.pathname)
}
