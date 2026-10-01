import type { Hobby, HobbySession } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface ApiResponse<T> { data: T }
function hobbyInput(hobby: Hobby) {
  return {
    name: hobby.name,
    category: hobby.category,
    icon: hobby.icon,
    targetFrequency: hobby.targetFrequency,
    targetMinutesPerWeek: hobby.targetMinutesPerWeek,
    notes: hobby.notes,
  }
}

export const HobbiesRepository = {
  async getAll(_defaultHobbies: Hobby[] = []): Promise<Hobby[]> {
    const response = await apiClient.request<ApiResponse<Hobby[]>>('/hobbies')
    return response.data
  },

  async saveAll(hobbies: Hobby[]): Promise<Hobby[]> {
    const response = await apiClient.request<ApiResponse<Hobby[]>>('/hobbies', {
      method: 'PUT', body: JSON.stringify(hobbies.map((hobby) => ({ ...hobbyInput(hobby), sessions: hobby.sessions }))),
    })
    return response.data
  },

  async addHobby(hobby: Hobby, current: Hobby[]): Promise<Hobby[]> {
    const response = await apiClient.request<ApiResponse<Hobby>>('/hobbies', {
      method: 'POST', body: JSON.stringify(hobbyInput(hobby)),
    })
    return [response.data, ...current]
  },

  async updateHobby(hobby: Hobby, current: Hobby[]): Promise<Hobby[]> {
    const response = await apiClient.request<ApiResponse<Hobby>>(`/hobbies/${hobby.id}`, {
      method: 'PATCH', body: JSON.stringify(hobbyInput(hobby)),
    })
    return current.map((item) => item.id === hobby.id ? response.data : item)
  },

  async deleteHobby(id: string, current: Hobby[]): Promise<Hobby[]> {
    await apiClient.request<void>(`/hobbies/${id}`, { method: 'DELETE' })
    return current.filter((item) => item.id !== id)
  },

  async logSession(hobbyId: string, session: HobbySession, current: Hobby[]): Promise<Hobby[]> {
    const response = await apiClient.request<ApiResponse<Hobby>>(`/hobbies/${hobbyId}/sessions`, {
      method: 'POST', body: JSON.stringify({
        date: session.date,
        durationMinutes: session.durationMinutes,
        rating: session.rating,
        notes: session.notes,
      }),
    })
    return current.map((hobby) => hobby.id === hobbyId ? response.data : hobby)
  },
}
