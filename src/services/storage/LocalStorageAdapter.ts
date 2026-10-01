import type { IStorageAdapter } from './IStorageAdapter'

export class LocalStorageAdapter implements IStorageAdapter {
  private prefix: string

  constructor(prefix: string = 'jid_v1_') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      if (typeof window === 'undefined') return null
      const item = window.localStorage.getItem(this.getKey(key))
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.warn(`[LocalStorageAdapter] Corrupted item "${key}", purging corrupted entry:`, error)
      try {
        window.localStorage.removeItem(this.getKey(key))
      } catch {}
      return null
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(this.getKey(key), JSON.stringify(value))
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to set item "${key}":`, error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error(`[LocalStorageAdapter] Failed to remove item "${key}":`, error)
    }
  }

  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') return
      const keysToRemove: string[] = []
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }
      for (const k of keysToRemove) {
        window.localStorage.removeItem(k)
      }
    } catch (error) {
      console.error('[LocalStorageAdapter] Failed to clear items:', error)
    }
  }
}
