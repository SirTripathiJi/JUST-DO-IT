import type { IStorageAdapter } from './IStorageAdapter'
import { LocalStorageAdapter } from './LocalStorageAdapter'

export class StorageService {
  private static instance: StorageService
  private adapter: IStorageAdapter

  private constructor(adapter?: IStorageAdapter) {
    this.adapter = adapter || new LocalStorageAdapter()
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  public setAdapter(adapter: IStorageAdapter): void {
    this.adapter = adapter
  }

  public getAdapter(): IStorageAdapter {
    return this.adapter
  }

  private currentUserId: string | null = null

  public setUserScope(userId: string | null): void {
    this.currentUserId = userId
  }

  public getUserScope(): string | null {
    return this.currentUserId
  }

  private resolveKey(key: string): string {
    if (key.startsWith('global_')) {
      return key
    }
    if (this.currentUserId) {
      return `usr_${this.currentUserId}_${key}`
    }
    return key
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    const resolvedKey = this.resolveKey(key)
    const value = await this.adapter.getItem<T>(resolvedKey)
    return value !== null ? value : defaultValue
  }

  async set<T>(key: string, value: T): Promise<void> {
    const resolvedKey = this.resolveKey(key)
    await this.adapter.setItem<T>(resolvedKey, value)
  }

  async remove(key: string): Promise<void> {
    const resolvedKey = this.resolveKey(key)
    await this.adapter.removeItem(resolvedKey)
  }
}

export const storageService = StorageService.getInstance()
