// C1P Studio - IndexedDB Media Cache for Local Uploads
// Keeps imported video and audio files persistent across browser reloads

const DB_NAME = "c1p_studio_media_db"
const STORE_NAME = "media_blobs"
const DB_VERSION = 1

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB not supported in this environment"))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Store a File or Blob in IndexedDB by clipId or media key
 */
export async function saveMediaToDB(key: string, file: Blob | File): Promise<void> {
  try {
    const db = await openMediaDB()
    const tx = db.transaction(STORE_NAME, "readwrite")
    const store = tx.objectStore(STORE_NAME)
    store.put(file, key)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn("[C1P Media DB] Could not cache file locally:", err)
  }
}

/**
 * Retrieve a stored Blob from IndexedDB by key
 */
export async function getMediaFromDB(key: string): Promise<Blob | null> {
  try {
    const db = await openMediaDB()
    const tx = db.transaction(STORE_NAME, "readonly")
    const store = tx.objectStore(STORE_NAME)
    const request = store.get(key)
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
    })
  } catch (err) {
    console.warn("[C1P Media DB] Could not retrieve cached file:", err)
    return null
  }
}

/**
 * Check if a URL is an active, valid blob or media URL
 */
export async function testMediaUrlPlayable(url: string): Promise<boolean> {
  if (!url) return false
  if (url.startsWith("http://") || url.startsWith("https://")) return true
  if (url.startsWith("data:")) return true

  // For blob: URLs, verify if the blob is still allocated
  if (url.startsWith("blob:")) {
    try {
      const res = await fetch(url, { method: "HEAD" })
      return res.ok || res.type === "basic"
    } catch {
      return false
    }
  }

  return true
}
