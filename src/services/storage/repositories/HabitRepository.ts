import type { Habit } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface HabitResponse {
  data: Habit[]
}

interface OneHabitResponse {
  data: Habit
}

function habitInput(habit: Habit) {
  return {
    title: habit.title,
    icon: habit.icon ?? null,
    description: habit.description ?? null,
    frequency: habit.frequency,
    selectedDays: habit.selectedDays ?? [],
    targetPerDay: habit.targetPerDay,
    targetUnit: habit.targetUnit ?? null,
    category: habit.category,
    timeOfDay: habit.timeOfDay ?? null,
    color: habit.color ?? null,
    reminderTime: habit.reminderTime ?? null,
  }
}

function localDateString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export class HabitRepository {
  static async getAll(_fallback: Habit[] = []): Promise<Habit[]> {
    const response = await apiClient.request<HabitResponse>(`/habits?today=${localDateString()}`)
    return response.data
  }

  static async saveAll(habits: Habit[]): Promise<Habit[]> {
    const response = await apiClient.request<HabitResponse>('/habits', {
      method: 'PUT',
      body: JSON.stringify(habits.map((habit) => ({
        ...habitInput(habit),
        completions: habit.completions,
      }))),
    })
    return response.data
  }

  static async add(habit: Habit, currentHabits: Habit[]): Promise<Habit[]> {
    const response = await apiClient.request<OneHabitResponse>('/habits', {
      method: 'POST',
      body: JSON.stringify(habitInput(habit)),
    })
    return [response.data, ...currentHabits]
  }

  static async update(updatedHabit: Habit, currentHabits: Habit[]): Promise<Habit[]> {
    const response = await apiClient.request<OneHabitResponse>(`/habits/${encodeURIComponent(updatedHabit.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(habitInput(updatedHabit)),
    })
    return currentHabits.map((habit) => habit.id === response.data.id ? response.data : habit)
  }

  static async delete(id: string, currentHabits: Habit[]): Promise<Habit[]> {
    await apiClient.request<void>(`/habits/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return currentHabits.filter((habit) => habit.id !== id)
  }

  static async toggleArchive(id: string, currentHabits: Habit[]): Promise<Habit[]> {
    const habit = currentHabits.find((item) => item.id === id)
    if (!habit) return currentHabits
    const response = await apiClient.request<OneHabitResponse>(`/habits/${encodeURIComponent(id)}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ archived: !habit.isArchived }),
    })
    return currentHabits.map((item) => item.id === id ? response.data : item)
  }

  static async toggleCompletion(
    id: string,
    dateStr: string,
    currentHabits: Habit[]
  ): Promise<Habit[]> {
    const habit = currentHabits.find((item) => item.id === id)
    if (!habit) return currentHabits
    const response = await apiClient.request<OneHabitResponse>(`/habits/${encodeURIComponent(id)}/completions/${dateStr}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !habit.completions[dateStr] }),
    })
    return currentHabits.map((item) => item.id === id ? response.data : item)
  }
}
