import type { SelfCareRoutine } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface ApiResponse<T> { data: T }

function localDateString() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function routineInput(routine: SelfCareRoutine) {
  return {
    title: routine.title,
    category: routine.category,
    frequency: routine.frequency,
    selectedDays: routine.selectedDays ?? [],
    timeOfDay: routine.timeOfDay,
    description: routine.description,
  }
}

export const SelfCareRepository = {
  async getAll(_defaultRoutines: SelfCareRoutine[] = []): Promise<SelfCareRoutine[]> {
    const response = await apiClient.request<ApiResponse<SelfCareRoutine[]>>(`/self-care?today=${localDateString()}`)
    return response.data
  },

  async saveAll(routines: SelfCareRoutine[]): Promise<SelfCareRoutine[]> {
    const response = await apiClient.request<ApiResponse<SelfCareRoutine[]>>('/self-care', {
      method: 'PUT', body: JSON.stringify(routines.map(routineInput)),
    })
    return response.data
  },

  async addRoutine(routine: SelfCareRoutine, current: SelfCareRoutine[]): Promise<SelfCareRoutine[]> {
    const response = await apiClient.request<ApiResponse<SelfCareRoutine>>('/self-care', {
      method: 'POST', body: JSON.stringify(routineInput(routine)),
    })
    return [response.data, ...current]
  },

  async updateRoutine(routine: SelfCareRoutine, current: SelfCareRoutine[]): Promise<SelfCareRoutine[]> {
    const response = await apiClient.request<ApiResponse<SelfCareRoutine>>(`/self-care/${routine.id}`, {
      method: 'PATCH', body: JSON.stringify(routineInput(routine)),
    })
    return current.map((item) => item.id === routine.id ? response.data : item)
  },

  async deleteRoutine(id: string, current: SelfCareRoutine[]): Promise<SelfCareRoutine[]> {
    await apiClient.request<void>(`/self-care/${id}`, { method: 'DELETE' })
    return current.filter((item) => item.id !== id)
  },

  async toggleRoutine(id: string, dateStr: string, current: SelfCareRoutine[]): Promise<SelfCareRoutine[]> {
    const routine = current.find((item) => item.id === id)
    if (!routine) return current
    const response = await apiClient.request<ApiResponse<SelfCareRoutine>>(`/self-care/${id}/completions/${dateStr}`, {
      method: 'PUT', body: JSON.stringify({ completed: !routine.history[dateStr] }),
    })
    return current.map((item) => item.id === id ? response.data : item)
  },
}
