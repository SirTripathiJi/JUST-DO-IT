import { storageService } from '../StorageService'
import type { Goal, GoalChecklistItem, GoalMilestone } from '../../../types'

const STORAGE_KEY = 'justdoit_goals_v2'

export const GoalsRepository = {
  async getAll(defaultGoals: Goal[] = []): Promise<Goal[]> {
    return await storageService.get<Goal[]>(STORAGE_KEY, defaultGoals)
  },

  async saveAll(goals: Goal[]): Promise<void> {
    await storageService.set<Goal[]>(STORAGE_KEY, goals)
  },

  async addGoal(goal: Goal, current: Goal[]): Promise<Goal[]> {
    const updated = [goal, ...current]
    await this.saveAll(updated)
    return updated
  },

  async updateGoal(goal: Goal, current: Goal[]): Promise<Goal[]> {
    const updated = current.map((g) => (g.id === goal.id ? goal : g))
    await this.saveAll(updated)
    return updated
  },

  async deleteGoal(id: string, current: Goal[]): Promise<Goal[]> {
    const updated = current.filter((g) => g.id !== id)
    await this.saveAll(updated)
    return updated
  },

  async toggleMilestone(goalId: string, milestoneId: string, current: Goal[]): Promise<Goal[]> {
    const updated = current.map((goal) => {
      if (goal.id !== goalId) return goal
      const updatedMilestones = goal.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m
      )
      const completedCount = updatedMilestones.filter((m) => m.completed).length
      const progress = updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : goal.progressPercentage
      return {
        ...goal,
        milestones: updatedMilestones,
        progressPercentage: progress,
        status: (progress === 100 ? 'completed' : goal.status === 'not_started' ? 'in_progress' : goal.status) as any,
      }
    })
    await this.saveAll(updated)
    return updated
  },

  async toggleChecklist(goalId: string, itemId: string, current: Goal[]): Promise<Goal[]> {
    const updated = current.map((goal) => {
      if (goal.id !== goalId) return goal
      const updatedChecklist = goal.checklist.map((c) =>
        c.id === itemId ? { ...c, completed: !c.completed } : c
      )
      return { ...goal, checklist: updatedChecklist }
    })
    await this.saveAll(updated)
    return updated
  },

  async addMilestone(goalId: string, milestone: GoalMilestone, current: Goal[]): Promise<Goal[]> {
    const updated = current.map((goal) => {
      if (goal.id !== goalId) return goal
      return { ...goal, milestones: [...goal.milestones, milestone] }
    })
    await this.saveAll(updated)
    return updated
  },

  async addChecklistItem(goalId: string, item: GoalChecklistItem, current: Goal[]): Promise<Goal[]> {
    const updated = current.map((goal) => {
      if (goal.id !== goalId) return goal
      return { ...goal, checklist: [...goal.checklist, item] }
    })
    await this.saveAll(updated)
    return updated
  },
}
