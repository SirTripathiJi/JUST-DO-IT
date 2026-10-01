import { ApiError, apiClient } from './ApiClient'

export interface AuthUser {
  id: string
  email: string
  profile: {
    name: string
    title: string
    dailyFocus: string
    semester: string | null
    wakeTime: string | null
    sleepTime: string | null
    avatarInitials: string
    avatarColor: string | null
    waterTargetMl: number
    onboarded: boolean
    onboardingData: unknown
  } | null
}

interface DataResponse<T> {
  data: T
}

export const AuthRepository = {
  async current(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.request<DataResponse<AuthUser>>('/auth/me')
      return response.data
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null
      throw error
    }
  },

  async register(input: { email: string; password: string; name: string; title?: string }): Promise<AuthUser> {
    const response = await apiClient.request<DataResponse<AuthUser>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return response.data
  },

  async login(input: { email: string; password: string }): Promise<AuthUser> {
    const response = await apiClient.request<DataResponse<AuthUser>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return response.data
  },

  logout(): Promise<void> {
    return apiClient.request<void>('/auth/logout', { method: 'POST' })
  },
}
