import { storageService } from '../StorageService'
import type { AcademicSubject, Assignment, LabSheet, LectureSheet } from '../../../types'

const STORAGE_KEY = 'justdoit_academics_v2'

export const AcademicsRepository = {
  async getAll(defaultSubjects: AcademicSubject[] = []): Promise<AcademicSubject[]> {
    return await storageService.get<AcademicSubject[]>(STORAGE_KEY, defaultSubjects)
  },

  async saveAll(subjects: AcademicSubject[]): Promise<void> {
    await storageService.set<AcademicSubject[]>(STORAGE_KEY, subjects)
  },

  async addSubject(subject: AcademicSubject, current: AcademicSubject[]): Promise<AcademicSubject[]> {
    const updated = [subject, ...current]
    await this.saveAll(updated)
    return updated
  },

  async updateSubject(subject: AcademicSubject, current: AcademicSubject[]): Promise<AcademicSubject[]> {
    const updated = current.map((s) => (s.id === subject.id ? subject : s))
    await this.saveAll(updated)
    return updated
  },

  async deleteSubject(id: string, current: AcademicSubject[]): Promise<AcademicSubject[]> {
    const updated = current.filter((s) => s.id !== id)
    await this.saveAll(updated)
    return updated
  },

  async toggleLectureSheet(
    subjectId: string,
    sheetId: string,
    current: AcademicSubject[],
    dateStr: string
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      const updatedSheets = s.lectureSheets.map((ls) =>
        ls.id === sheetId
          ? {
              ...ls,
              completed: !ls.completed,
              completedDate: !ls.completed ? dateStr : undefined,
            }
          : ls
      )
      return { ...s, lectureSheets: updatedSheets }
    })
    await this.saveAll(updated)
    return updated
  },

  async addLectureSheet(
    subjectId: string,
    sheet: LectureSheet,
    current: AcademicSubject[]
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectureSheets: [...s.lectureSheets, sheet] }
    })
    await this.saveAll(updated)
    return updated
  },

  async toggleLabSheet(
    subjectId: string,
    sheetId: string,
    current: AcademicSubject[],
    dateStr: string
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      const updatedSheets = s.labSheets.map((ls) =>
        ls.id === sheetId
          ? {
              ...ls,
              completed: !ls.completed,
              completedDate: !ls.completed ? dateStr : undefined,
            }
          : ls
      )
      return { ...s, labSheets: updatedSheets }
    })
    await this.saveAll(updated)
    return updated
  },

  async addLabSheet(
    subjectId: string,
    sheet: LabSheet,
    current: AcademicSubject[]
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, labSheets: [...s.labSheets, sheet] }
    })
    await this.saveAll(updated)
    return updated
  },

  async toggleAssignment(
    subjectId: string,
    assignmentId: string,
    current: AcademicSubject[]
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      const updatedAssignments = s.assignments.map((a) =>
        a.id === assignmentId ? { ...a, completed: !a.completed } : a
      )
      return { ...s, assignments: updatedAssignments }
    })
    await this.saveAll(updated)
    return updated
  },

  async addAssignment(
    subjectId: string,
    assignment: Assignment,
    current: AcademicSubject[]
  ): Promise<AcademicSubject[]> {
    const updated = current.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, assignments: [...s.assignments, assignment] }
    })
    await this.saveAll(updated)
    return updated
  },
}
