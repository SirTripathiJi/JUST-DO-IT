import { storageService } from '../StorageService'
import type { InspirationImage } from '../../../types'

const DB_NAME = 'justdoit_indexed_db'
const DB_VERSION = 1
const STORE_NAME = 'inspiration_images'
const FALLBACK_KEY = 'justdoit_inspiration_images_v1'

class IndexedDBHelper {
  private dbPromise: Promise<IDBDatabase> | null = null

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'))
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'storeKey' })
          store.createIndex('userId', 'userId', { unique: false })
          store.createIndex('order', 'order', { unique: false })
        }
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(request.error)
      }
    })

    return this.dbPromise
  }

  async getAllForUser(userId: string): Promise<InspirationImage[]> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('userId')
        const request = index.getAll(userId)

        request.onsuccess = () => {
          const results = (request.result || []).map((item: any) => {
            const { storeKey, ...image } = item
            return image as InspirationImage
          })
          results.sort((a, b) => a.order - b.order)
          resolve(results)
        }

        request.onerror = () => reject(request.error)
      })
    } catch {
      return await storageService.get<InspirationImage[]>(FALLBACK_KEY, [])
    }
  }

  async saveAllForUser(userId: string, images: InspirationImage[]): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        const index = store.index('userId')
        const getKeysReq = index.getAllKeys(userId)

        getKeysReq.onsuccess = () => {
          const keys = getKeysReq.result || []
          keys.forEach((k) => store.delete(k))

          images.forEach((img, idx) => {
            store.put({
              ...img,
              order: idx,
              userId,
              storeKey: `${userId}_${img.id}`,
            })
          })
        }

        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      await storageService.set<InspirationImage[]>(FALLBACK_KEY, images)
    }
  }

  async putItem(userId: string, image: InspirationImage): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.put({
          ...image,
          userId,
          storeKey: `${userId}_${image.id}`,
        })
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      const current = await storageService.get<InspirationImage[]>(FALLBACK_KEY, [])
      const exists = current.some((i) => i.id === image.id)
      const updated = exists ? current.map((i) => (i.id === image.id ? image : i)) : [image, ...current]
      await storageService.set<InspirationImage[]>(FALLBACK_KEY, updated)
    }
  }

  async deleteItem(userId: string, imageId: string): Promise<void> {
    try {
      const db = await this.getDB()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.delete(`${userId}_${imageId}`)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    } catch {
      const current = await storageService.get<InspirationImage[]>(FALLBACK_KEY, [])
      const updated = current.filter((i) => i.id !== imageId)
      await storageService.set<InspirationImage[]>(FALLBACK_KEY, updated)
    }
  }
}

const idbHelper = new IndexedDBHelper()

export const InspirationRepository = {
  async getAll(userId: string): Promise<InspirationImage[]> {
    if (!userId) return []
    return await idbHelper.getAllForUser(userId)
  },

  async saveAll(userId: string, images: InspirationImage[]): Promise<void> {
    if (!userId) return
    await idbHelper.saveAllForUser(userId, images)
  },

  async addImage(userId: string, image: InspirationImage, current: InspirationImage[]): Promise<InspirationImage[]> {
    const updated = [image, ...current].map((item, idx) => ({ ...item, order: idx }))
    await this.saveAll(userId, updated)
    return updated
  },

  async updateImage(userId: string, image: InspirationImage, current: InspirationImage[]): Promise<InspirationImage[]> {
    const updated = current.map((item) => (item.id === image.id ? image : item))
    await idbHelper.putItem(userId, image)
    return updated
  },

  async deleteImage(userId: string, id: string, current: InspirationImage[]): Promise<InspirationImage[]> {
    const updated = current.filter((item) => item.id !== id).map((item, idx) => ({ ...item, order: idx }))
    await idbHelper.deleteItem(userId, id)
    return updated
  },
}
