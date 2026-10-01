import type { Supplement } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface ApiResponse<T> { data: T }
type SupplementInput = Omit<Supplement, 'id' | 'takenToday' | 'history' | 'currentStreak' | 'lastTakenDate'>

function today() {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
function inputFor(supplement: Supplement): SupplementInput {
  const { id: _id, takenToday: _takenToday, history: _history, currentStreak: _currentStreak, lastTakenDate: _lastTakenDate, ...input } = supplement
  return input
}

export class SupplementRepository {
  static async getAll(_fallback: Supplement[] = []): Promise<Supplement[]> {
    const response = await apiClient.request<ApiResponse<Supplement[]>>(`/supplements?today=${today()}`)
    return response.data
  }

  static async saveAll(supplements: Supplement[]): Promise<Supplement[]> {
    const response = await apiClient.request<ApiResponse<Supplement[]>>('/supplements', {
      method: 'PUT',
      body: JSON.stringify(supplements.map(inputFor)),
    })
    return response.data
  }

  static async add(supplement: Supplement, currentList: Supplement[]): Promise<Supplement[]> {
    const response = await apiClient.request<ApiResponse<Supplement>>('/supplements', {
      method: 'POST',
      body: JSON.stringify(inputFor(supplement)),
    })
    return [...currentList, response.data]
  }

  static async update(supplement: Supplement, currentList: Supplement[]): Promise<Supplement[]> {
    const response = await apiClient.request<ApiResponse<Supplement>>(`/supplements/${supplement.id}`, {
      method: 'PATCH',
      body: JSON.stringify(inputFor(supplement)),
    })
    return currentList.map((item) => item.id === supplement.id ? response.data : item)
  }

  static async delete(id: string, currentList: Supplement[]): Promise<Supplement[]> {
    await apiClient.request<void>(`/supplements/${id}`, { method: 'DELETE' })
    return currentList.filter((item) => item.id !== id)
  }

  static async toggle(id: string, dateStr: string, currentList: Supplement[]): Promise<Supplement[]> {
    const current = currentList.find((item) => item.id === id)
    if (!current) return currentList
    const response = await apiClient.request<ApiResponse<Supplement>>(`/supplements/${id}/completions/${dateStr}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !current.history[dateStr] }),
    })
    return currentList.map((item) => item.id === id ? response.data : item)
  }
}
