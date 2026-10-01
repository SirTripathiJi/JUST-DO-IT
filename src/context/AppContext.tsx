import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import type {
  AcademicSubject,
  Assignment,
  CareerCourse,
  CareerMilestone,
  CareerProject,
  CareerResource,
  CareerRoadmap,
  CareerSkill,
  Goal,
  GoalChecklistItem,
  GoalMilestone,
  Habit,
  Hobby,
  HobbySession,
  InspirationImage,
  LabSheet,
  LectureSheet,
  ModuleId,
  OnboardingData,
  ScheduleItem,
  SelfCareRoutine,
  Supplement,
  Task,
  ToastMessage,
  UserProfile,
  WaterLog,
  WorkoutSession,
} from '../types'
import {
  generatePersonalizedSeed,
  getTodayDateString,
  defaultEmptyProfile,
  initialAcademics,
  initialCareerRoadmaps,
  initialGoals,
  initialHabits,
  initialHobbies,
  initialProfile,
  initialSchedule,
  initialSelfCare,
  initialSupplements,
  initialTasks,
  initialWaterLog,
  initialWorkouts,
} from '../data/seedData'
import { storageService } from '../services/storage/StorageService'
import { TaskRepository } from '../services/storage/repositories/TaskRepository'
import { HabitRepository } from '../services/storage/repositories/HabitRepository'
import { WaterRepository } from '../services/storage/repositories/WaterRepository'
import { SupplementRepository } from '../services/storage/repositories/SupplementRepository'
import { ProfileRepository } from '../services/storage/repositories/ProfileRepository'
import { AcademicsRepository } from '../services/storage/repositories/AcademicsRepository'
import { CareerRepository } from '../services/storage/repositories/CareerRepository'
import { FitnessRepository } from '../services/storage/repositories/FitnessRepository'
import type { PersonalRecords } from '../services/storage/repositories/FitnessRepository'
import { SelfCareRepository } from '../services/storage/repositories/SelfCareRepository'
import { GoalsRepository } from '../services/storage/repositories/GoalsRepository'
import { HobbiesRepository } from '../services/storage/repositories/HobbiesRepository'
import { InspirationRepository } from '../services/storage/repositories/InspirationRepository'
import { AuthRepository, type AuthUser } from '../services/api/AuthRepository'
import { ApiError } from '../services/api/ApiClient'

export type ModalType =
  | 'task'
  | 'habit'
  | 'water'
  | 'supplement'
  | 'workout'
  | 'selfcare'
  | 'subject'
  | 'lecture_sheet'
  | 'lab_sheet'
  | 'assignment'
  | 'career_roadmap'
  | 'career_skill'
  | 'career_project'
  | 'career_milestone'
  | 'goal'
  | 'hobby'
  | 'command_palette'
  | 'onboarding'
  | null

interface ModalState {
  type: ModalType
  payload?: any
}

interface AppContextType {
  authStatus: 'loading' | 'authenticated' | 'unauthenticated'
  authError: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, title?: string) => Promise<void>
  activeModule: ModuleId
  setActiveModule: (id: ModuleId) => void
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  activeUserId: string | null
  logout: () => Promise<void>

  // Profile & Onboarding
  profile: UserProfile
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  updateDailyFocus: (focus: string) => Promise<void>
  completeOnboarding: (data: OnboardingData) => Promise<void>
  resetToOnboarding: () => void

  // Tasks
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>
  updateTask: (task: Task) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  // Habits
  habits: Habit[]
  addHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions' | 'createdAt'>) => Promise<void>
  updateHabit: (habit: Habit) => Promise<void>
  toggleHabit: (id: string, dateStr?: string) => Promise<void>
  toggleArchiveHabit: (id: string) => Promise<void>
  deleteHabit: (id: string) => Promise<void>

  // Water
  waterLog: WaterLog
  logWater: (amountMl: number, containerName?: string) => Promise<void>
  resetWater: () => Promise<void>
  setWaterTarget: (targetMl: number) => Promise<void>

  // Supplements
  supplements: Supplement[]
  addSupplement: (sup: Omit<Supplement, 'id' | 'takenToday' | 'history' | 'currentStreak'>) => Promise<void>
  updateSupplement: (sup: Supplement) => Promise<void>
  toggleSupplement: (id: string) => Promise<void>
  deleteSupplement: (id: string) => Promise<void>

  // Fitness / Workouts
  workouts: WorkoutSession[]
  personalRecords: PersonalRecords
  addWorkout: (session: Omit<WorkoutSession, 'id' | 'createdAt'>) => Promise<void>
  updateWorkout: (session: WorkoutSession) => Promise<void>
  deleteWorkout: (id: string) => Promise<void>
  toggleExerciseSet: (sessionId: string, exerciseId: string, setId: string) => Promise<void>
  saveWorkoutTemplate: (session: WorkoutSession) => Promise<void>

  // Self-Care
  selfCareRoutines: SelfCareRoutine[]
  addSelfCareRoutine: (routine: Omit<SelfCareRoutine, 'id' | 'completedToday' | 'history' | 'currentStreak'>) => Promise<void>
  updateSelfCareRoutine: (routine: SelfCareRoutine) => Promise<void>
  toggleSelfCareRoutine: (id: string, dateStr?: string) => Promise<void>
  deleteSelfCareRoutine: (id: string) => Promise<void>

  // Academics
  academics: AcademicSubject[]
  addSubject: (subject: Omit<AcademicSubject, 'id' | 'lectureSheets' | 'labSheets' | 'assignments' | 'exams' | 'goals'>) => Promise<void>
  updateSubject: (subject: AcademicSubject) => Promise<void>
  deleteSubject: (id: string) => Promise<void>
  toggleLectureSheet: (subjectId: string, sheetId: string) => Promise<void>
  addLectureSheet: (subjectId: string, sheet: Omit<LectureSheet, 'id'>) => Promise<void>
  toggleLabSheet: (subjectId: string, sheetId: string) => Promise<void>
  addLabSheet: (subjectId: string, sheet: Omit<LabSheet, 'id'>) => Promise<void>
  toggleAssignment: (subjectId: string, assignmentId: string) => Promise<void>
  addAssignment: (subjectId: string, assignment: Omit<Assignment, 'id'>) => Promise<void>
  addLectureSheetWithSubject: (subject: { code: string; name: string }, sheet: Omit<LectureSheet, 'id'>) => Promise<void>
  addLabSheetWithSubject: (subject: { code: string; name: string }, sheet: Omit<LabSheet, 'id'>) => Promise<void>
  addAssignmentWithSubject: (subject: { code: string; name: string }, assignment: Omit<Assignment, 'id'>) => Promise<void>

  // Career
  careerRoadmaps: CareerRoadmap[]
  addCareerRoadmap: (roadmap: Omit<CareerRoadmap, 'id' | 'createdAt' | 'skills' | 'courses' | 'projects' | 'milestones' | 'resources'>) => Promise<void>
  deleteCareerRoadmap: (id: string) => Promise<void>
  addCareerSkill: (roadmapId: string, skill: Omit<CareerSkill, 'id'>) => Promise<void>
  updateCareerSkill: (roadmapId: string, skillId: string, progress: number) => Promise<void>
  addCareerCourse: (roadmapId: string, course: Omit<CareerCourse, 'id'>) => Promise<void>
  toggleCareerCourse: (roadmapId: string, courseId: string) => Promise<void>
  addCareerProject: (roadmapId: string, project: Omit<CareerProject, 'id'>) => Promise<void>
  addCareerMilestone: (roadmapId: string, milestone: Omit<CareerMilestone, 'id'>) => Promise<void>
  toggleCareerMilestone: (roadmapId: string, milestoneId: string) => Promise<void>
  addCareerResource: (roadmapId: string, resource: Omit<CareerResource, 'id'>) => Promise<void>

  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progressPercentage'>) => Promise<void>
  updateGoal: (goal: Goal) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleGoalMilestone: (goalId: string, milestoneId: string) => Promise<void>
  toggleGoalChecklist: (goalId: string, checklistId: string) => Promise<void>

  // Hobbies
  hobbies: Hobby[]
  addHobby: (hobby: Omit<Hobby, 'id' | 'createdAt' | 'sessions' | 'currentStreak'>) => Promise<void>
  updateHobby: (hobby: Hobby) => Promise<void>
  deleteHobby: (id: string) => Promise<void>
  logHobbySession: (hobbyId: string, session: Omit<HobbySession, 'id'>) => Promise<void>

  // Inspiration
  inspirationImages: InspirationImage[]
  addInspirationImages: (newImages: Array<Omit<InspirationImage, 'id' | 'createdAt' | 'order'>>) => Promise<void>
  updateInspirationImage: (image: InspirationImage) => Promise<void>
  deleteInspirationImage: (id: string) => Promise<void>
  togglePinInspirationImage: (id: string) => Promise<void>
  reorderInspirationImages: (orderedIds: string[]) => Promise<void>

  // Schedule
  schedule: ScheduleItem[]
  toggleScheduleItem: (id: string) => void

  // Modals
  modal: ModalState
  openModal: (type: ModalType, payload?: any) => void
  closeModal: () => void

  // Toast / Feedback
  toast: ToastMessage | null
  showToast: (message: string, undoAction?: () => void, undoLabel?: string) => void
  dismissToast: () => void

  // Search & Global Filter
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Computed Metrics
  metrics: {
    tasksCompleted: number
    totalTasks: number
    taskCompletionRate: number
    habitsCompletedToday: number
    totalHabits: number
    habitCompletionRate: number
    waterCurrentMl: number
    waterTargetMl: number
    waterPercentage: number
    supplementsTakenToday: number
    totalSupplements: number
    academicCompletionRate: number
    activeCareerRoadmaps: number
    activeGoalsCount: number
    workoutsCount: number
    selfCareCompletedCount: number
    totalSelfCareCount: number
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function mapAuthUserToProfile(user: AuthUser): UserProfile {
  const source = user.profile
  return {
    id: user.id,
    email: user.email,
    name: source?.name || user.email.split('@')[0],
    title: source?.title || '',
    dailyFocus: source?.dailyFocus || '',
    semester: source?.semester || '',
    wakeTime: source?.wakeTime || '07:00',
    sleepTime: source?.sleepTime || '23:00',
    streakScore: 0,
    themePreference: 'system',
    avatarInitials: source?.avatarInitials || user.email.slice(0, 1).toUpperCase(),
    avatarColor: source?.avatarColor || '#3b82f6',
    waterTargetMl: source?.waterTargetMl || 2500,
    onboarded: source?.onboarded || false,
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayStr = useMemo(() => getTodayDateString(), [])
  const [activeModule, setActiveModule] = useState<ModuleId>('today')
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Modals state
  const [modal, setModal] = useState<ModalState>({ type: null })

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Show Toast helper
  const showToast = useCallback((message: string, undoAction?: () => void, undoLabel: string = 'Undo') => {
    const id = `toast_${Date.now()}`
    setToast({ id, message, undoAction, undoLabel })
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  // Modal helpers
  const openModal = useCallback((type: ModalType, payload?: any) => {
    setModal({ type, payload })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ type: null })
  }, [])

  const [authStatus, setAuthStatus] = useState<AppContextType['authStatus']>('loading')
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeUserId, setActiveUserId] = useState<string | null>(null)

  // Domain states (start empty by default)
  const [profile, setProfile] = useState<UserProfile>(defaultEmptyProfile)
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [waterLog, setWaterLog] = useState<WaterLog>({ date: todayStr, targetMl: 2500, currentMl: 0, entries: [] })
  const [supplements, setSupplements] = useState<Supplement[]>([])
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>({})
  const [selfCareRoutines, setSelfCareRoutines] = useState<SelfCareRoutine[]>([])
  const [academics, setAcademics] = useState<AcademicSubject[]>([])
  const [careerRoadmaps, setCareerRoadmaps] = useState<CareerRoadmap[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [hobbies, setHobbies] = useState<Hobby[]>([])
  const [inspirationImages, setInspirationImages] = useState<InspirationImage[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  // Load data for a specific user ID
  const loadUserDataForUser = useCallback(async (userId: string, authenticatedProfile?: UserProfile) => {
    storageService.setUserScope(userId)
    const fallbackProfile: UserProfile = authenticatedProfile ?? {
      id: userId,
      name: 'User',
      email: '',
      title: '',
      dailyFocus: '',
      semester: '',
      wakeTime: '07:00',
      sleepTime: '23:00',
      streakScore: 0,
      themePreference: 'system',
      avatarInitials: 'U',
      avatarColor: '#3b82f6',
      waterTargetMl: 2500,
      onboarded: false,
    }

    const [
        savedProfile,
        savedTasks,
        savedHabits,
        savedWater,
        savedSupplements,
        savedWorkouts,
        savedPRs,
        savedSelfCare,
        savedAcademics,
        savedCareer,
        savedGoals,
        savedHobbies,
        savedInspiration,
    ] = await Promise.all([
        ProfileRepository.get(fallbackProfile),
        TaskRepository.getAll([]),
        HabitRepository.getAll([]),
        WaterRepository.getLogForDate(todayStr, 2500),
        SupplementRepository.getAll([]),
        FitnessRepository.getAll([]),
        FitnessRepository.getPersonalRecords(),
        SelfCareRepository.getAll([]),
        AcademicsRepository.getAll([]),
        CareerRepository.getAll([]),
        GoalsRepository.getAll([]),
        HobbiesRepository.getAll([]),
        InspirationRepository.getAll(userId),
      ])

    setProfile(savedProfile)
      setTasks(savedTasks)
      setHabits(savedHabits)
      setWaterLog(savedWater)
      setSupplements(savedSupplements)
      setWorkouts(savedWorkouts)
      setPersonalRecords(savedPRs)
      setSelfCareRoutines(savedSelfCare)
      setAcademics(savedAcademics)
      setCareerRoadmaps(savedCareer)
      setGoals(savedGoals)
      setHobbies(savedHobbies)
      setInspirationImages(savedInspiration)

      // If user has not completed onboarding, trigger onboarding modal
    if (!savedProfile.onboarded) {
      setModal({ type: 'onboarding' })
    }

  }, [todayStr])

  // Restore the server session, then load the active user's workspace.
  useEffect(() => {
    async function restoreSession() {
      try {
        const user = await AuthRepository.current()
        if (!user) {
          setActiveUserId(null)
          storageService.setUserScope(null)
          setAuthStatus('unauthenticated')
          return
        }
        setActiveUserId(user.id)
        await loadUserDataForUser(user.id, mapAuthUserToProfile(user))
        setAuthStatus('authenticated')
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not connect to Just Do It. Check your connection and try again.'
        setActiveUserId(null)
        storageService.setUserScope(null)
        setAuthError(message)
        setAuthStatus('unauthenticated')
      }
    }
    restoreSession()
  }, [loadUserDataForUser])

  const acceptAuthenticatedUser = async (user: AuthUser) => {
    setActiveUserId(user.id)
    await loadUserDataForUser(user.id, mapAuthUserToProfile(user))
    setAuthStatus('authenticated')
    setAuthError(null)
  }

  const signIn = async (email: string, password: string) => {
    try {
      await acceptAuthenticatedUser(await AuthRepository.login({ email, password }))
      showToast('Welcome back')
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not connect to Just Do It. Check your connection and try again.'
      setActiveUserId(null)
      storageService.setUserScope(null)
      setAuthError(message)
    }
  }

  const signUp = async (name: string, email: string, password: string, title?: string) => {
    try {
      await acceptAuthenticatedUser(await AuthRepository.register({ name, email, password, title }))
      setModal({ type: 'onboarding' })
      showToast(`Welcome, ${name}! Set up your workspace.`)
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Could not connect to Just Do It. Check your connection and try again.'
      setActiveUserId(null)
      storageService.setUserScope(null)
      setAuthError(message)
    }
  }

  const logout = async () => {
    await AuthRepository.logout()
    setActiveUserId(null)
    setAuthStatus('unauthenticated')
    setAuthError(null)
    storageService.setUserScope(null)
    setProfile(defaultEmptyProfile)
    setTasks([])
    setHabits([])
    setWaterLog({ date: todayStr, targetMl: 2500, currentMl: 0, entries: [] })
    setSupplements([])
    setWorkouts([])
    setPersonalRecords({})
    setSelfCareRoutines([])
    setAcademics([])
    setCareerRoadmaps([])
    setGoals([])
    setHobbies([])
    setInspirationImages([])
    setSchedule([])
    showToast('Logged out successfully')
  }

  // Complete Onboarding logic
  const completeOnboarding = async (data: OnboardingData) => {
    const isFirstOnboarding = !profile.onboarded
    const seed = generatePersonalizedSeed(data)
    if (activeUserId) {
      seed.profile.id = activeUserId
      seed.profile.email = profile.email
      if (profile.avatarColor) seed.profile.avatarColor = profile.avatarColor
    }

    setProfile(seed.profile)
    if (isFirstOnboarding) {
      const [savedHabits, savedSupplements, , , , savedHobbies, savedSelfCare] = await Promise.all([
        HabitRepository.saveAll(seed.habits),
        SupplementRepository.saveAll(seed.supplements),
        AcademicsRepository.saveAll(seed.subjects),
        CareerRepository.saveAll(seed.roadmaps),
        GoalsRepository.saveAll(seed.goals),
        HobbiesRepository.saveAll(seed.hobbies),
        SelfCareRepository.saveAll(seed.selfCare),
      ])
      setHabits(savedHabits)
      setSupplements(savedSupplements)
      setAcademics(seed.subjects)
      setCareerRoadmaps(seed.roadmaps)
      setGoals(seed.goals)
      setHobbies(savedHobbies)
      setSelfCareRoutines(savedSelfCare)
    }
    await ProfileRepository.save(seed.profile)
    if (isFirstOnboarding) {
      const savedWater = await WaterRepository.updateTarget(seed.waterLog.targetMl, seed.waterLog)
      setWaterLog(savedWater)
    }

    closeModal()
    showToast(`Welcome to Just Do It, ${seed.profile.name}! Your workspace is ready.`)
  }

  const resetToOnboarding = () => {
    openModal('onboarding')
  }

  const updateProfile = async (partial: Partial<UserProfile>) => {
    const updated = { ...profile, ...partial }
    setProfile(updated)
    try {
      await ProfileRepository.save(updated)
    } catch (error) {
      setProfile(profile)
      throw error
    }
  }

  const updateDailyFocus = async (focus: string) => {
    const updated = await ProfileRepository.updateFocus(focus, profile)
    setProfile(updated)
  }

  // Task Actions
  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    }
    const updated = await TaskRepository.add(newTask, tasks)
    setTasks(updated)
    closeModal()
    showToast(`Task created: "${newTask.title}"`)
  }

  const updateTask = async (task: Task) => {
    const updated = await TaskRepository.update(task, tasks)
    setTasks(updated)
  }

  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id)
    const updated = await TaskRepository.toggleComplete(id, tasks)
    setTasks(updated)
    if (target && !target.completed) {
      showToast(`Completed: "${target.title}"`, async () => {
        const reverted = await TaskRepository.toggleComplete(id, updated)
        setTasks(reverted)
      })
    }
  }

  const deleteTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id)
    const updated = await TaskRepository.delete(id, tasks)
    setTasks(updated)
    if (target) {
      showToast(`Deleted task: "${target.title}"`, async () => {
        const restored = await TaskRepository.add(target, updated)
        setTasks(restored)
      })
    }
  }

  // Habit Actions
  const addHabit = async (
    habitData: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions' | 'createdAt'>
  ) => {
    const newHabit: Habit = {
      ...habitData,
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      currentStreak: 0,
      bestStreak: 0,
      completions: {},
      createdAt: new Date().toISOString(),
    }
    const updated = await HabitRepository.add(newHabit, habits)
    setHabits(updated)
    closeModal()
    showToast(`Habit added: "${newHabit.title}"`)
  }

  const updateHabit = async (habit: Habit) => {
    const updated = await HabitRepository.update(habit, habits)
    setHabits(updated)
  }

  const toggleHabit = async (id: string, dateStr: string = todayStr) => {
    const target = habits.find((h) => h.id === id)
    const wasDone = !!target?.completions[dateStr]
    const updated = await HabitRepository.toggleCompletion(id, dateStr, habits)
    setHabits(updated)
    if (!wasDone && target) {
      showToast(`Checked off "${target.title}" 🔥 Streak: ${target.currentStreak + 1}`, async () => {
        const reverted = await HabitRepository.toggleCompletion(id, dateStr, updated)
        setHabits(reverted)
      })
    }
  }

  const toggleArchiveHabit = async (id: string) => {
    const updated = await HabitRepository.toggleArchive(id, habits)
    setHabits(updated)
  }

  const deleteHabit = async (id: string) => {
    const target = habits.find((h) => h.id === id)
    const updated = await HabitRepository.delete(id, habits)
    setHabits(updated)
    if (target) {
      showToast(`Deleted habit: "${target.title}"`, async () => {
        const restored = await HabitRepository.add(target, updated)
        setHabits(restored)
      })
    }
  }

  // Water Actions
  const logWater = async (amountMl: number, containerName?: string) => {
    const updated = await WaterRepository.addIntake(amountMl, waterLog, containerName)
    setWaterLog(updated)
    closeModal()
    showToast(`Logged +${amountMl}ml water 💧 (${updated.currentMl}/${updated.targetMl}ml)`)
  }

  const resetWater = async () => {
    const reset = await WaterRepository.resetLog(todayStr, waterLog.targetMl)
    setWaterLog(reset)
  }

  const setWaterTarget = async (targetMl: number) => {
    const updated = await WaterRepository.updateTarget(targetMl, waterLog)
    setWaterLog(updated)
  }

  // Supplement Actions
  const addSupplement = async (
    supData: Omit<Supplement, 'id' | 'takenToday' | 'history' | 'currentStreak'>
  ) => {
    const newSup: Supplement = {
      ...supData,
      id: `s_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      takenToday: false,
      history: {},
      currentStreak: 0,
    }
    const updated = await SupplementRepository.add(newSup, supplements)
    setSupplements(updated)
    closeModal()
    showToast(`Supplement added: "${newSup.name}"`)
  }

  const updateSupplement = async (sup: Supplement) => {
    const updated = await SupplementRepository.update(sup, supplements)
    setSupplements(updated)
  }

  const toggleSupplement = async (id: string) => {
    const target = supplements.find((s) => s.id === id)
    const wasTaken = target?.takenToday
    const updated = await SupplementRepository.toggle(id, todayStr, supplements)
    setSupplements(updated)
    if (!wasTaken && target) {
      showToast(`Taken: ${target.name} (${target.dosage} ${target.unit})`, async () => {
        const reverted = await SupplementRepository.toggle(id, todayStr, updated)
        setSupplements(reverted)
      })
    }
  }

  const deleteSupplement = async (id: string) => {
    const target = supplements.find((s) => s.id === id)
    const updated = await SupplementRepository.delete(id, supplements)
    setSupplements(updated)
    if (target) {
      showToast(`Deleted supplement: "${target.name}"`, async () => {
        const restored = await SupplementRepository.add(target, updated)
        setSupplements(restored)
      })
    }
  }

  // Fitness Actions
  const addWorkout = async (sessionData: Omit<WorkoutSession, 'id' | 'createdAt'>) => {
    const session: WorkoutSession = {
      ...sessionData,
      id: `wo_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    const updated = await FitnessRepository.addSession(session, workouts)
    setWorkouts(updated)

    // Detect personal records
    const { updated: updatedPRs, newPRs } = await FitnessRepository.updatePersonalRecords(session, personalRecords)
    if (newPRs.length > 0) {
      setPersonalRecords(updatedPRs)
      showToast(`🏆 New PR${newPRs.length > 1 ? 's' : ''}: ${newPRs.slice(0, 2).join(', ')}${newPRs.length > 2 ? ` +${newPRs.length - 2}` : ''}`)
    } else {
      showToast(`Workout saved: "${session.title}"`)
    }
  }

  const saveWorkoutTemplate = async (session: WorkoutSession) => {
    const template: WorkoutSession = {
      ...session,
      id: `tmpl_${Date.now()}`,
      isTemplate: true,
      templateName: session.title,
      createdAt: new Date().toISOString(),
    }
    const updated = await FitnessRepository.addSession(template, workouts)
    setWorkouts(updated)
    showToast(`Template saved: "${template.title}"`)
  }

  const updateWorkout = async (session: WorkoutSession) => {
    const updated = await FitnessRepository.updateSession(session, workouts)
    setWorkouts(updated)
    const { updated: newPRs, newPRs: prNames } = await FitnessRepository.updatePersonalRecords(session, personalRecords)
    if (prNames.length > 0) {
      setPersonalRecords(newPRs)
      showToast(`🏆 New PR: ${prNames.join(', ')}!`)
    } else {
      showToast(`Session updated: "${session.title}"`)
    }
  }

  const deleteWorkout = async (id: string) => {
    const target = workouts.find((w) => w.id === id)
    const updated = await FitnessRepository.deleteSession(id, workouts)
    setWorkouts(updated)
    if (target) {
      showToast(`Deleted workout: "${target.title}"`, async () => {
        const restored = await FitnessRepository.addSession(target, updated)
        setWorkouts(restored)
      })
    }
  }

  const toggleExerciseSet = async (sessionId: string, exerciseId: string, setId: string) => {
    const updated = await FitnessRepository.toggleExerciseSet(sessionId, exerciseId, setId, workouts)
    setWorkouts(updated)
  }

  // Self-Care Actions
  const addSelfCareRoutine = async (
    routineData: Omit<SelfCareRoutine, 'id' | 'completedToday' | 'history' | 'currentStreak'>
  ) => {
    const routine: SelfCareRoutine = {
      ...routineData,
      id: `sc_${Date.now()}`,
      completedToday: false,
      history: {},
      currentStreak: 0,
    }
    const updated = await SelfCareRepository.addRoutine(routine, selfCareRoutines)
    setSelfCareRoutines(updated)
    closeModal()
    showToast(`Routine added: "${routine.title}"`)
  }

  const updateSelfCareRoutine = async (routine: SelfCareRoutine) => {
    const updated = await SelfCareRepository.updateRoutine(routine, selfCareRoutines)
    setSelfCareRoutines(updated)
  }

  const toggleSelfCareRoutine = async (id: string, dateStr: string = todayStr) => {
    const updated = await SelfCareRepository.toggleRoutine(id, dateStr, selfCareRoutines)
    setSelfCareRoutines(updated)
  }

  const deleteSelfCareRoutine = async (id: string) => {
    const target = selfCareRoutines.find((r) => r.id === id)
    const updated = await SelfCareRepository.deleteRoutine(id, selfCareRoutines)
    setSelfCareRoutines(updated)
    if (target) {
      showToast(`Deleted routine: "${target.title}"`, async () => {
        const restored = await SelfCareRepository.addRoutine(target, updated)
        setSelfCareRoutines(restored)
      })
    }
  }

  // Academics Actions
  const addSubject = async (
    subjData: Omit<AcademicSubject, 'id' | 'lectureSheets' | 'labSheets' | 'assignments' | 'exams' | 'goals'>
  ) => {
    const newSubject: AcademicSubject = {
      ...subjData,
      id: `subj_${Date.now()}`,
      lectureSheets: [],
      labSheets: [],
      assignments: [],
      exams: [],
      goals: [],
    }
    const updated = await AcademicsRepository.addSubject(newSubject, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Subject added: "${newSubject.name}"`)
  }

  const updateSubject = async (subject: AcademicSubject) => {
    const updated = await AcademicsRepository.updateSubject(subject, academics)
    setAcademics(updated)
  }

  const deleteSubject = async (id: string) => {
    const target = academics.find((s) => s.id === id)
    const updated = await AcademicsRepository.deleteSubject(id, academics)
    setAcademics(updated)
    if (target) {
      showToast(`Deleted subject: "${target.code}"`, async () => {
        const restored = await AcademicsRepository.addSubject(target, updated)
        setAcademics(restored)
      })
    }
  }

  const toggleLectureSheet = async (subjectId: string, sheetId: string) => {
    const updated = await AcademicsRepository.toggleLectureSheet(subjectId, sheetId, academics, todayStr)
    setAcademics(updated)
    showToast(`Lecture sheet updated`, async () => {
      const reverted = await AcademicsRepository.toggleLectureSheet(subjectId, sheetId, updated, todayStr)
      setAcademics(reverted)
    })
  }

  const addLectureSheet = async (subjectId: string, sheetData: Omit<LectureSheet, 'id'>) => {
    const newSheet: LectureSheet = {
      ...sheetData,
      id: `ls_${Date.now()}`,
    }
    const updated = await AcademicsRepository.addLectureSheet(subjectId, newSheet, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Lecture Sheet #${newSheet.number} added`)
  }

  const toggleLabSheet = async (subjectId: string, sheetId: string) => {
    const updated = await AcademicsRepository.toggleLabSheet(subjectId, sheetId, academics, todayStr)
    setAcademics(updated)
    showToast(`Lab sheet updated`, async () => {
      const reverted = await AcademicsRepository.toggleLabSheet(subjectId, sheetId, updated, todayStr)
      setAcademics(reverted)
    })
  }

  const addLabSheet = async (subjectId: string, sheetData: Omit<LabSheet, 'id'>) => {
    const newSheet: LabSheet = {
      ...sheetData,
      id: `lab_${Date.now()}`,
    }
    const updated = await AcademicsRepository.addLabSheet(subjectId, newSheet, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Lab Sheet #${newSheet.number} added`)
  }

  const toggleAssignment = async (subjectId: string, assignmentId: string) => {
    const updated = await AcademicsRepository.toggleAssignment(subjectId, assignmentId, academics)
    setAcademics(updated)
  }

  const addAssignment = async (subjectId: string, assignmentData: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `as_${Date.now()}`,
    }
    const updated = await AcademicsRepository.addAssignment(subjectId, newAssignment, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Assignment added: "${newAssignment.title}"`)
  }

  const addLectureSheetWithSubject = async (
    subject: { code: string; name: string },
    sheetData: Omit<LectureSheet, 'id'>
  ) => {
    const newSheet: LectureSheet = {
      ...sheetData,
      id: `ls_${Date.now()}`,
    }
    const newSubj: AcademicSubject = {
      id: `subj_${Date.now()}`,
      code: subject.code,
      name: subject.name,
      semester: profile.semester || 'Semester 5',
      lectureSheets: [newSheet],
      labSheets: [],
      assignments: [],
      exams: [],
      goals: [],
    }
    const updated = await AcademicsRepository.addSubject(newSubj, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Created subject "${newSubj.code}" and added Lecture Sheet #${newSheet.number}`)
  }

  const addLabSheetWithSubject = async (
    subject: { code: string; name: string },
    sheetData: Omit<LabSheet, 'id'>
  ) => {
    const newSheet: LabSheet = {
      ...sheetData,
      id: `lab_${Date.now()}`,
    }
    const newSubj: AcademicSubject = {
      id: `subj_${Date.now()}`,
      code: subject.code,
      name: subject.name,
      semester: profile.semester || 'Semester 5',
      lectureSheets: [],
      labSheets: [newSheet],
      assignments: [],
      exams: [],
      goals: [],
    }
    const updated = await AcademicsRepository.addSubject(newSubj, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Created subject "${newSubj.code}" and added Lab Sheet #${newSheet.number}`)
  }

  const addAssignmentWithSubject = async (
    subject: { code: string; name: string },
    assignmentData: Omit<Assignment, 'id'>
  ) => {
    const newAssignment: Assignment = {
      ...assignmentData,
      id: `as_${Date.now()}`,
    }
    const newSubj: AcademicSubject = {
      id: `subj_${Date.now()}`,
      code: subject.code,
      name: subject.name,
      semester: profile.semester || 'Semester 5',
      lectureSheets: [],
      labSheets: [],
      assignments: [newAssignment],
      exams: [],
      goals: [],
    }
    const updated = await AcademicsRepository.addSubject(newSubj, academics)
    setAcademics(updated)
    closeModal()
    showToast(`Created subject "${newSubj.code}" and added assignment`)
  }

  // Career Actions
  const addCareerRoadmap = async (
    roadmapData: Omit<CareerRoadmap, 'id' | 'createdAt' | 'skills' | 'courses' | 'projects' | 'milestones' | 'resources'>
  ) => {
    const newRoadmap: CareerRoadmap = {
      ...roadmapData,
      id: `cr_${Date.now()}`,
      createdAt: new Date().toISOString(),
      skills: [],
      courses: [],
      projects: [],
      milestones: [],
      resources: [],
    }
    const updated = await CareerRepository.addRoadmap(newRoadmap, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
    showToast(`Career track added: "${newRoadmap.title}"`)
  }

  const deleteCareerRoadmap = async (id: string) => {
    const target = careerRoadmaps.find((r) => r.id === id)
    const updated = await CareerRepository.deleteRoadmap(id, careerRoadmaps)
    setCareerRoadmaps(updated)
    if (target) {
      showToast(`Deleted career track: "${target.title}"`, async () => {
        const restored = await CareerRepository.addRoadmap(target, updated)
        setCareerRoadmaps(restored)
      })
    }
  }

  const addCareerSkill = async (roadmapId: string, skillData: Omit<CareerSkill, 'id'>) => {
    const skill: CareerSkill = {
      ...skillData,
      id: `sk_${Date.now()}`,
    }
    const updated = await CareerRepository.addSkill(roadmapId, skill, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
    showToast(`Skill added: "${skill.name}"`)
  }

  const updateCareerSkill = async (roadmapId: string, skillId: string, progress: number) => {
    const updated = await CareerRepository.updateSkillProgress(roadmapId, skillId, progress, careerRoadmaps)
    setCareerRoadmaps(updated)
  }

  const addCareerCourse = async (roadmapId: string, courseData: Omit<CareerCourse, 'id'>) => {
    const course: CareerCourse = {
      ...courseData,
      id: `co_${Date.now()}`,
    }
    const updated = await CareerRepository.addCourse(roadmapId, course, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
  }

  const toggleCareerCourse = async (roadmapId: string, courseId: string) => {
    const updated = await CareerRepository.toggleCourse(roadmapId, courseId, careerRoadmaps)
    setCareerRoadmaps(updated)
  }

  const addCareerProject = async (roadmapId: string, projectData: Omit<CareerProject, 'id'>) => {
    const project: CareerProject = {
      ...projectData,
      id: `proj_${Date.now()}`,
    }
    const updated = await CareerRepository.addProject(roadmapId, project, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
    showToast(`Project added: "${project.title}"`)
  }

  const addCareerMilestone = async (roadmapId: string, milestoneData: Omit<CareerMilestone, 'id'>) => {
    const milestone: CareerMilestone = {
      ...milestoneData,
      id: `cm_${Date.now()}`,
    }
    const updated = await CareerRepository.addMilestone(roadmapId, milestone, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
    showToast(`Milestone added: "${milestone.title}"`)
  }

  const toggleCareerMilestone = async (roadmapId: string, milestoneId: string) => {
    const updated = await CareerRepository.toggleMilestone(roadmapId, milestoneId, careerRoadmaps)
    setCareerRoadmaps(updated)
  }

  const addCareerResource = async (roadmapId: string, resourceData: Omit<CareerResource, 'id'>) => {
    const res: CareerResource = {
      ...resourceData,
      id: `res_${Date.now()}`,
    }
    const updated = await CareerRepository.addResource(roadmapId, res, careerRoadmaps)
    setCareerRoadmaps(updated)
    closeModal()
  }

  // Goals Actions
  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt' | 'progressPercentage'>) => {
    const goal: Goal = {
      ...goalData,
      id: `g_${Date.now()}`,
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
    }
    const updated = await GoalsRepository.addGoal(goal, goals)
    setGoals(updated)
    closeModal()
    showToast(`Goal created: "${goal.title}"`)
  }

  const updateGoal = async (goal: Goal) => {
    const updated = await GoalsRepository.updateGoal(goal, goals)
    setGoals(updated)
  }

  const deleteGoal = async (id: string) => {
    const target = goals.find((g) => g.id === id)
    const updated = await GoalsRepository.deleteGoal(id, goals)
    setGoals(updated)
    if (target) {
      showToast(`Deleted goal: "${target.title}"`, async () => {
        const restored = await GoalsRepository.addGoal(target, updated)
        setGoals(restored)
      })
    }
  }

  const toggleGoalMilestone = async (goalId: string, milestoneId: string) => {
    const updated = await GoalsRepository.toggleMilestone(goalId, milestoneId, goals)
    setGoals(updated)
  }

  const toggleGoalChecklist = async (goalId: string, checklistId: string) => {
    const updated = await GoalsRepository.toggleChecklist(goalId, checklistId, goals)
    setGoals(updated)
  }

  // Hobbies Actions
  const addHobby = async (hobbyData: Omit<Hobby, 'id' | 'createdAt' | 'sessions' | 'currentStreak'>) => {
    const newHobby: Hobby = {
      ...hobbyData,
      id: `hob_${Date.now()}`,
      createdAt: new Date().toISOString(),
      sessions: [],
      currentStreak: 0,
    }
    const updated = await HobbiesRepository.addHobby(newHobby, hobbies)
    setHobbies(updated)
    closeModal()
    showToast(`Hobby added: "${newHobby.name}"`)
  }

  const updateHobby = async (hobby: Hobby) => {
    const updated = await HobbiesRepository.updateHobby(hobby, hobbies)
    setHobbies(updated)
  }

  const deleteHobby = async (id: string) => {
    const target = hobbies.find((h) => h.id === id)
    const updated = await HobbiesRepository.deleteHobby(id, hobbies)
    setHobbies(updated)
    if (target) {
      showToast(`Deleted hobby: "${target.name}"`, async () => {
        const restored = await HobbiesRepository.addHobby(target, updated)
        setHobbies(restored)
      })
    }
  }

  const logHobbySession = async (hobbyId: string, sessionData: Omit<HobbySession, 'id'>) => {
    const session: HobbySession = {
      ...sessionData,
      id: `hs_${Date.now()}`,
    }
    const updated = await HobbiesRepository.logSession(hobbyId, session, hobbies)
    setHobbies(updated)
    closeModal()
    showToast(`Hobby session logged! 🎨`)
  }

  // Inspiration Actions
  const addInspirationImages = async (newImagesData: Array<Omit<InspirationImage, 'id' | 'createdAt' | 'order'>>) => {
    if (!activeUserId) return
    const now = new Date().toISOString()
    const created: InspirationImage[] = newImagesData.map((data, idx) => ({
      ...data,
      id: `insp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      pinned: data.pinned ?? false,
      order: idx,
    }))
    const updated = [...created, ...inspirationImages].map((img, idx) => ({ ...img, order: idx }))
    setInspirationImages(updated)
    await InspirationRepository.saveAll(activeUserId, updated)
    showToast(created.length === 1 ? 'Image added to Inspiration' : `${created.length} images added to Inspiration`)
  }

  const updateInspirationImage = async (image: InspirationImage) => {
    if (!activeUserId) return
    const updated = inspirationImages.map((i) => (i.id === image.id ? image : i))
    setInspirationImages(updated)
    await InspirationRepository.updateImage(activeUserId, image, inspirationImages)
    showToast('Image updated')
  }

  const deleteInspirationImage = async (id: string) => {
    if (!activeUserId) return
    const target = inspirationImages.find((i) => i.id === id)
    const updated = inspirationImages.filter((i) => i.id !== id).map((img, idx) => ({ ...img, order: idx }))
    setInspirationImages(updated)
    await InspirationRepository.deleteImage(activeUserId, id, inspirationImages)
    if (target) {
      showToast(`Image deleted`, async () => {
        const restored = [target, ...updated].map((img, idx) => ({ ...img, order: idx }))
        setInspirationImages(restored)
        await InspirationRepository.saveAll(activeUserId, restored)
      })
    }
  }

  const togglePinInspirationImage = async (id: string) => {
    if (!activeUserId) return
    const updated = inspirationImages.map((img) =>
      img.id === id ? { ...img, pinned: !img.pinned } : img
    )
    updated.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return a.order - b.order
    })
    const normalized = updated.map((img, idx) => ({ ...img, order: idx }))
    setInspirationImages(normalized)
    await InspirationRepository.saveAll(activeUserId, normalized)
  }

  const reorderInspirationImages = async (orderedIds: string[]) => {
    if (!activeUserId) return
    const map = new Map(inspirationImages.map((i) => [i.id, i]))
    const reordered: InspirationImage[] = []
    orderedIds.forEach((id) => {
      const item = map.get(id)
      if (item) reordered.push(item)
    })
    inspirationImages.forEach((img) => {
      if (!orderedIds.includes(img.id)) reordered.push(img)
    })
    const normalized = reordered.map((img, idx) => ({ ...img, order: idx }))
    setInspirationImages(normalized)
    await InspirationRepository.saveAll(activeUserId, normalized)
  }

  // Schedule Actions
  const toggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    )
  }

  // Keyboard Shortcuts (Cmd+K for search, N for contextual add, Esc for close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openModal('command_palette')
        return
      }

      // Escape: Close any open modal
      if (e.key === 'Escape' && modal.type) {
        closeModal()
        return
      }

      // 'N' or 'n': Contextual add
      if ((e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null
        const isEditable =
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.isContentEditable)

        if (!isEditable && !modal.type) {
          e.preventDefault()
          switch (activeModule) {
            case 'tasks':        openModal('task'); break
            case 'habits':       openModal('habit'); break
            case 'water':        openModal('water'); break
            case 'supplements':  openModal('supplement'); break
            case 'workouts':     openModal('workout'); break
            case 'selfcare':     openModal('selfcare'); break
            case 'academics':    openModal('lecture_sheet'); break
            case 'career':       openModal('career_roadmap'); break
            case 'goals':        openModal('goal'); break
            case 'hobbies':      openModal('hobby'); break
            default:             openModal('task'); break
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openModal, closeModal, modal.type, activeModule])

  // Calculated Metrics
  const metrics = useMemo(() => {
    const tasksCompleted = tasks.filter((t) => t.completed).length
    const totalTasks = tasks.length
    const taskCompletionRate = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

    const activeHabits = habits.filter((h) => !h.isArchived)
    const habitsCompletedToday = activeHabits.filter((h) => !!h.completions[todayStr]).length
    const totalHabits = activeHabits.length
    const habitCompletionRate = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0

    const waterCurrentMl = waterLog.currentMl
    const waterTargetMl = waterLog.targetMl
    const waterPercentage = waterTargetMl > 0 ? Math.round((waterCurrentMl / waterTargetMl) * 100) : 0

    const supplementsTakenToday = supplements.filter((s) => s.takenToday).length
    const totalSupplements = supplements.length

    // Academics completion
    let totalSheets = 0
    let completedSheets = 0
    academics.forEach((subj) => {
      subj.lectureSheets.forEach((ls) => {
        totalSheets++
        if (ls.completed) completedSheets++
      })
      subj.labSheets.forEach((lbs) => {
        totalSheets++
        if (lbs.completed) completedSheets++
      })
    })
    const academicCompletionRate = totalSheets > 0 ? Math.round((completedSheets / totalSheets) * 100) : 0

    const activeCareerRoadmaps = careerRoadmaps.length
    const activeGoalsCount = goals.filter((g) => g.status !== 'completed').length
    const workoutsCount = workouts.length

    const selfCareCompletedCount = selfCareRoutines.filter((r) => r.completedToday || r.history[todayStr]).length
    const totalSelfCareCount = selfCareRoutines.length

    return {
      tasksCompleted,
      totalTasks,
      taskCompletionRate,
      habitsCompletedToday,
      totalHabits,
      habitCompletionRate,
      waterCurrentMl,
      waterTargetMl,
      waterPercentage,
      supplementsTakenToday,
      totalSupplements,
      academicCompletionRate,
      activeCareerRoadmaps,
      activeGoalsCount,
      workoutsCount,
      selfCareCompletedCount,
      totalSelfCareCount,
    }
  }, [tasks, habits, waterLog, supplements, academics, careerRoadmaps, goals, workouts, selfCareRoutines, todayStr])

  return (
    <AppContext.Provider
      value={{
        authStatus,
        authError,
        signIn,
        signUp,
        activeModule,
        setActiveModule,
        isSidebarOpen,
        setSidebarOpen,
        activeUserId,
        logout,
        profile,
        updateProfile,
        updateDailyFocus,
        completeOnboarding,
        resetToOnboarding,
        tasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        habits,
        addHabit,
        updateHabit,
        toggleHabit,
        toggleArchiveHabit,
        deleteHabit,
        waterLog,
        logWater,
        resetWater,
        setWaterTarget,
        supplements,
        addSupplement,
        updateSupplement,
        toggleSupplement,
        deleteSupplement,
        workouts,
        personalRecords,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        toggleExerciseSet,
        saveWorkoutTemplate,
        selfCareRoutines,
        addSelfCareRoutine,
        updateSelfCareRoutine,
        toggleSelfCareRoutine,
        deleteSelfCareRoutine,
        academics,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleLectureSheet,
        addLectureSheet,
        toggleLabSheet,
        addLabSheet,
        toggleAssignment,
        addAssignment,
        addLectureSheetWithSubject,
        addLabSheetWithSubject,
        addAssignmentWithSubject,
        careerRoadmaps,
        addCareerRoadmap,
        deleteCareerRoadmap,
        addCareerSkill,
        updateCareerSkill,
        addCareerCourse,
        toggleCareerCourse,
        addCareerProject,
        addCareerMilestone,
        toggleCareerMilestone,
        addCareerResource,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoalMilestone,
        toggleGoalChecklist,
        hobbies,
        addHobby,
        updateHobby,
        deleteHobby,
        logHobbySession,
        inspirationImages,
        addInspirationImages,
        updateInspirationImage,
        deleteInspirationImage,
        togglePinInspirationImage,
        reorderInspirationImages,
        schedule,
        toggleScheduleItem,
        modal,
        openModal,
        closeModal,
        toast,
        showToast,
        dismissToast,
        searchQuery,
        setSearchQuery,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
