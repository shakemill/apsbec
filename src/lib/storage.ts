import fs from "fs/promises"
import path from "path"
import { list, put, del } from "@vercel/blob"
import { unstable_noStore as noStore } from "next/cache"

const DATA_DIR = path.join(process.cwd(), "data")
const IS_DEV = !process.env.BLOB_READ_WRITE_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN.startsWith("your_blob")

// Cache des URLs blob (warm instances) pour éviter list() redondants
const urlCache = new Map<string, string>()

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
  return path.join(DATA_DIR, key.replace(/\//g, "__"))
}

async function localGet(key: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(localPath(key), "utf-8"))
  } catch {
    return null
  }
}

async function localPut(key: string, data: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(localPath(key), JSON.stringify(data, null, 2), "utf-8")
}

async function localDelete(key: string): Promise<void> {
  try { await fs.unlink(localPath(key)) } catch { /* absent */ }
}

async function localList(prefix: string): Promise<string[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    const safePrefix = prefix.replace(/\//g, "__")
    return (await fs.readdir(DATA_DIR))
      .filter((f) => f.startsWith(safePrefix))
      .map((f) => f.replace(/__/g, "/").replace(/\.json$/, "") + ".json")
  } catch {
    return []
  }
}

// ─── Adaptateur Vercel Blob ───────────────────────────────────────────────────

/** Fetch avec timeout (ms) pour éviter que les appels pendent indéfiniment */
async function fetchWithTimeout(url: string, ms = 8000): Promise<Response> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { cache: "no-store", signal: ctrl.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function blobGet(key: string): Promise<unknown | null> {
  noStore() // Empêche Next.js de cacher les fetch internes
  // 1. Chercher l'URL dans le cache local (warm instance)
  let blobUrl = urlCache.get(key)

  // 2. Si pas en cache, faire un list() avec limit:1 pour trouver l'URL
  if (!blobUrl) {
    const { blobs } = await list({ prefix: key, limit: 5 })
    const found = blobs.find((b) => b.pathname === key)
    if (!found) return null
    blobUrl = found.url
    urlCache.set(key, blobUrl)
  }

  try {
    // Cache-busting pour bypasser le CDN de Vercel Blob (TTL ~60s)
    const res = await fetchWithTimeout(`${blobUrl}?_=${Date.now()}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    // En cas d'échec (ex: URL expirée), vider le cache et réessayer une fois
    urlCache.delete(key)
    const { blobs } = await list({ prefix: key, limit: 5 })
    const found = blobs.find((b) => b.pathname === key)
    if (!found) return null
    try {
      const res = await fetchWithTimeout(`${found.url}?_=${Date.now()}`)
      if (!res.ok) return null
      urlCache.set(key, found.url)
      return res.json()
    } catch {
      return null
    }
  }
}

async function blobPut(key: string, data: unknown): Promise<void> {
  const result = await put(key, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  // Mettre à jour le cache avec la nouvelle URL
  urlCache.set(key, result.url)
}

async function blobDelete(key: string): Promise<void> {
  const { blobs } = await list({ prefix: key, limit: 5 })
  const found = blobs.find((b) => b.pathname === key)
  if (found) {
    await del(found.url)
    urlCache.delete(key)
  }
}

async function blobList(prefix: string): Promise<string[]> {
  noStore() // Empêche Next.js de cacher la liste des blobs
  const { blobs } = await list({ prefix })
  return blobs.map((b) => b.pathname)
}
