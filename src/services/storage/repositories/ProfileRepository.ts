import type { OnboardingData, UserProfile } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface ProfileResponse {
  data: {
    userId: string
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
  }
}

function mapProfile(data: ProfileResponse['data'], fallback: UserProfile): UserProfile {
  return {
    ...fallback,
    id: data.userId,
    name: data.name,
    title: data.title,
    dailyFocus: data.dailyFocus,
    semester: data.semester ?? '',
    wakeTime: data.wakeTime ?? '07:00',
    sleepTime: data.sleepTime ?? '23:00',
    avatarInitials: data.avatarInitials,
    avatarColor: data.avatarColor ?? undefined,
    waterTargetMl: data.waterTargetMl,
    onboarded: data.onboarded,
    onboardingData: data.onboardingData ? data.onboardingData as OnboardingData : undefined,
  }
}

export class ProfileRepository {
  static async get(_fallback: UserProfile): Promise<UserProfile> {
    const response = await apiClient.request<ProfileResponse>('/profile')
    return mapProfile(response.data, _fallback)
  }

  static async save(profile: UserProfile): Promise<void> {
    await apiClient.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: profile.name,
        title: profile.title,
        dailyFocus: profile.dailyFocus,
        semester: profile.semester,
        wakeTime: profile.wakeTime,
        sleepTime: profile.sleepTime,
        avatarInitials: profile.avatarInitials,
        avatarColor: profile.avatarColor,
        waterTargetMl: profile.waterTargetMl,
        onboarded: profile.onboarded,
        onboardingData: profile.onboardingData ?? null,
      }),
    })
  }

  static async updateFocus(focus: string, currentProfile: UserProfile): Promise<UserProfile> {
    const response = await apiClient.request<ProfileResponse>('/profile', {
      method: 'PATCH',
      body: JSON.stringify({ dailyFocus: focus }),
    })
    return mapProfile(response.data, currentProfile)
  }
}
