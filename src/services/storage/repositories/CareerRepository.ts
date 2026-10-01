import { storageService } from '../StorageService'
import type { CareerCourse, CareerMilestone, CareerProject, CareerResource, CareerRoadmap, CareerSkill } from '../../../types'

const STORAGE_KEY = 'justdoit_career_v2'

export const CareerRepository = {
  async getAll(defaultRoadmaps: CareerRoadmap[] = []): Promise<CareerRoadmap[]> {
    return await storageService.get<CareerRoadmap[]>(STORAGE_KEY, defaultRoadmaps)
  },

  async saveAll(roadmaps: CareerRoadmap[]): Promise<void> {
    await storageService.set<CareerRoadmap[]>(STORAGE_KEY, roadmaps)
  },

  async addRoadmap(roadmap: CareerRoadmap, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = [roadmap, ...current]
    await this.saveAll(updated)
    return updated
  },

  async deleteRoadmap(id: string, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.filter((r) => r.id !== id)
    await this.saveAll(updated)
    return updated
  },

  async addSkill(roadmapId: string, skill: CareerSkill, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) =>
      r.id === roadmapId ? { ...r, skills: [...r.skills, skill] } : r
    )
    await this.saveAll(updated)
    return updated
  },

  async updateSkillProgress(roadmapId: string, skillId: string, progress: number, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) => {
      if (r.id !== roadmapId) return r
      return {
        ...r,
        skills: r.skills.map((s) => (s.id === skillId ? { ...s, progressPercentage: progress } : s)),
      }
    })
    await this.saveAll(updated)
    return updated
  },

  async addCourse(roadmapId: string, course: CareerCourse, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) =>
      r.id === roadmapId ? { ...r, courses: [...r.courses, course] } : r
    )
    await this.saveAll(updated)
    return updated
  },

  async toggleCourse(roadmapId: string, courseId: string, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) => {
      if (r.id !== roadmapId) return r
      return {
        ...r,
        courses: r.courses.map((c) =>
          c.id === courseId
            ? { ...c, completed: !c.completed, progressPercentage: !c.completed ? 100 : c.progressPercentage }
            : c
        ),
      }
    })
    await this.saveAll(updated)
    return updated
  },

  async addProject(roadmapId: string, project: CareerProject, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) =>
      r.id === roadmapId ? { ...r, projects: [...r.projects, project] } : r
    )
    await this.saveAll(updated)
    return updated
  },

  async addMilestone(roadmapId: string, milestone: CareerMilestone, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) =>
      r.id === roadmapId ? { ...r, milestones: [...r.milestones, milestone] } : r
    )
    await this.saveAll(updated)
    return updated
  },

  async toggleMilestone(roadmapId: string, milestoneId: string, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) => {
      if (r.id !== roadmapId) return r
      return {
        ...r,
        milestones: r.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ),
      }
    })
    await this.saveAll(updated)
    return updated
  },

  async addResource(roadmapId: string, resource: CareerResource, current: CareerRoadmap[]): Promise<CareerRoadmap[]> {
    const updated = current.map((r) =>
      r.id === roadmapId ? { ...r, resources: [...r.resources, resource] } : r
    )
    await this.saveAll(updated)
    return updated
  },
}
