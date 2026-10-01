import type { Task } from '../../../types'
import { apiClient } from '../../api/ApiClient'

interface TaskListResponse {
  data: Task[]
  page: { limit: number; offset: number; total: number }
}

interface TaskResponse {
  data: Task
}

function taskInput(task: Task) {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    dueTime: task.dueTime ?? null,
    endTime: task.endTime ?? null,
    completed: task.completed,
    category: task.category,
    tags: task.tags ?? [],
    notes: task.notes ?? null,
    recurring: task.recurring ?? null,
    reminder: task.reminder ?? false,
    subtasks: (task.subtasks ?? []).map(({ title, completed }) => ({ title, completed })),
  }
}

export class TaskRepository {
  static async getAll(_fallback: Task[] = []): Promise<Task[]> {
    const all: Task[] = []
    let offset = 0
    while (true) {
      const response = await apiClient.request<TaskListResponse>(`/tasks?limit=100&offset=${offset}`)
      all.push(...response.data)
      offset += response.data.length
      if (offset >= response.page.total || response.data.length === 0) return all
    }
  }

  static async saveAll(_tasks: Task[]): Promise<void> {
    // Bulk replacing a user's task collection is reserved for the explicit legacy import flow.
    throw new Error('Bulk task replacement is not available through this repository.')
  }

  static async add(task: Task, currentTasks: Task[]): Promise<Task[]> {
    const response = await apiClient.request<TaskResponse>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskInput(task)),
    })
    return [response.data, ...currentTasks]
  }

  static async update(updatedTask: Task, currentTasks: Task[]): Promise<Task[]> {
    const response = await apiClient.request<TaskResponse>(`/tasks/${encodeURIComponent(updatedTask.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(taskInput(updatedTask)),
    })
    return currentTasks.map((task) => task.id === response.data.id ? response.data : task)
  }

  static async delete(id: string, currentTasks: Task[]): Promise<Task[]> {
    await apiClient.request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
    return currentTasks.filter((task) => task.id !== id)
  }

  static async toggleComplete(id: string, currentTasks: Task[]): Promise<Task[]> {
    const current = currentTasks.find((task) => task.id === id)
    if (!current) return currentTasks
    const response = await apiClient.request<TaskResponse>(`/tasks/${encodeURIComponent(id)}/completion`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !current.completed }),
    })
    return currentTasks.map((task) => task.id === id ? response.data : task)
  }
}
