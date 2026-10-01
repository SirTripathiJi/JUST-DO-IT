import { storageService } from '../StorageService'
import type { WorkoutSession } from '../../../types'

const STORAGE_KEY = 'justdoit_fitness_v2'
const PR_KEY = 'justdoit_fitness_prs_v1'

export interface PersonalRecord {
  exerciseName: string
  weightKg: number
  reps: number
  volume: number // weightKg * reps
  date: string // YYYY-MM-DD
  sessionId: string
}

export type PersonalRecords = Record<string, PersonalRecord> // key: lowercase exercise name

export const FitnessRepository = {
  async getAll(defaultSessions: WorkoutSession[] = []): Promise<WorkoutSession[]> {
    return await storageService.get<WorkoutSession[]>(STORAGE_KEY, defaultSessions)
  },

  async saveAll(sessions: WorkoutSession[]): Promise<void> {
    await storageService.set<WorkoutSession[]>(STORAGE_KEY, sessions)
  },

  async addSession(session: WorkoutSession, current: WorkoutSession[]): Promise<WorkoutSession[]> {
    const updated = [session, ...current]
    await this.saveAll(updated)
    return updated
  },

  async updateSession(session: WorkoutSession, current: WorkoutSession[]): Promise<WorkoutSession[]> {
    const updated = current.map((s) => (s.id === session.id ? session : s))
    await this.saveAll(updated)
    return updated
  },

  async deleteSession(id: string, current: WorkoutSession[]): Promise<WorkoutSession[]> {
    const updated = current.filter((s) => s.id !== id)
    await this.saveAll(updated)
    return updated
  },

  async toggleExerciseSet(
    sessionId: string,
    exerciseId: string,
    setId: string,
    current: WorkoutSession[]
  ): Promise<WorkoutSession[]> {
    const updated = current.map((session) => {
      if (session.id !== sessionId) return session
      const updatedExercises = session.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise
        const updatedSets = exercise.sets.map((set) =>
          set.id === setId ? { ...set, completed: !set.completed } : set
        )
        return { ...exercise, sets: updatedSets }
      })
      const allSetsDone = updatedExercises.every((ex) => ex.sets.every((s) => s.completed))
      return { ...session, exercises: updatedExercises, completed: allSetsDone }
    })
    await this.saveAll(updated)
    return updated
  },

  // ── Personal Records ──────────────────────────────────────────────────────
  async getPersonalRecords(): Promise<PersonalRecords> {
    return await storageService.get<PersonalRecords>(PR_KEY, {})
  },

  async savePersonalRecords(prs: PersonalRecords): Promise<void> {
    await storageService.set<PersonalRecords>(PR_KEY, prs)
  },

  /**
   * Compares completed sets in a session against existing PRs.
   * Updates PRs if a new best (by volume = weight × reps) is found.
   * Returns { updated: PersonalRecords, newPRs: string[] } for UI feedback.
   */
  async updatePersonalRecords(
    session: WorkoutSession,
    currentPRs: PersonalRecords
  ): Promise<{ updated: PersonalRecords; newPRs: string[] }> {
    const updated = { ...currentPRs }
    const newPRs: string[] = []

    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (!set.completed || set.weightKg === 0 || set.reps === 0) continue
        const key = exercise.name.toLowerCase().trim()
        const volume = set.weightKg * set.reps
        const existing = updated[key]
        if (!existing || volume > existing.volume) {
          updated[key] = {
            exerciseName: exercise.name,
            weightKg: set.weightKg,
            reps: set.reps,
            volume,
            date: session.date,
            sessionId: session.id,
          }
          newPRs.push(exercise.name)
        }
      }
    }

    if (newPRs.length > 0) {
      await this.savePersonalRecords(updated)
    }

    return { updated, newPRs }
  },
}
