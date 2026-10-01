import type { WaterLog } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface ApiResponse<T> { data: T }

export class WaterRepository {
  static async getLogForDate(dateStr: string, _defaultTarget = 2500): Promise<WaterLog> {
    const response = await apiClient.request<ApiResponse<WaterLog>>(`/water/${dateStr}`)
    return response.data
  }

  static async addIntake(amountMl: number, _currentLog: WaterLog, containerName?: string): Promise<WaterLog> {
    const response = await apiClient.request<ApiResponse<WaterLog>>(`/water/${_currentLog.date}/entries`, {
      method: 'POST',
      body: JSON.stringify({ amountMl, ...(containerName ? { containerName } : {}) }),
    })
    return response.data
  }

  static async resetLog(dateStr: string, _targetMl = 2500): Promise<WaterLog> {
    const response = await apiClient.request<ApiResponse<WaterLog>>(`/water/${dateStr}/entries`, { method: 'DELETE' })
    return response.data
  }

  static async updateTarget(newTargetMl: number, currentLog: WaterLog): Promise<WaterLog> {
    const response = await apiClient.request<ApiResponse<WaterLog>>(`/water/${currentLog.date}/target`, {
      method: 'PATCH',
      body: JSON.stringify({ targetMl: newTargetMl }),
    })
    return response.data
  }
}
