export type ModuleId =
  | 'today'
  | 'calendar'
  | 'inspiration'
  | 'tasks'
  | 'habits'
  | 'supplements'
  | 'water'
  | 'workouts'
  | 'selfcare'
  | 'hobbies'
  | 'goals'
  | 'academics'
  | 'career'
  | 'analytics'
  | 'settings'
  | 'profile';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'academic'
  | 'career'
  | 'work'
  | 'personal'
  | 'health'
  | 'finance'
  | 'projects';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: PriorityLevel;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  endTime?: string; // HH:mm
  completed: boolean;
  category: TaskCategory;
  tags?: string[];
  notes?: string;
  recurring?: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
  subtasks?: SubTask[];
  reminder?: boolean;
  createdAt: string;
  completedAt?: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';
export type HabitTimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';
export type HabitCategory = 'wellness' | 'mindset' | 'productivity' | 'fitness' | 'learning' | 'health';

export interface Habit {
  id: string;
  title: string;
  icon?: string;
  description?: string;
  frequency: HabitFrequency;
  selectedDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  targetPerDay: number;
  targetUnit?: string;
  currentStreak: number;
  bestStreak: number;
  completions: Record<string, boolean>; // 'YYYY-MM-DD': true
  category: 'wellness' | 'mindset' | 'productivity' | 'fitness' | 'learning' | 'health';
  timeOfDay?: HabitTimeOfDay;
  color?: string;
  isArchived?: boolean;
  reminderTime?: string;
  createdAt: string;
}

export interface WaterLogEntry {
  id: string;
  amountMl: number;
  timestamp: string; // ISO string
  containerName?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  targetMl: number;
  currentMl: number;
  entries: WaterLogEntry[];
}

export type SupplementTiming = 'morning' | 'noon' | 'evening' | 'bedtime' | 'with-meal';

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  unit: string;
  timing: SupplementTiming;
  frequency: 'daily' | 'specific-days' | 'as-needed';
  selectedDays?: number[];
  notes?: string;
  reminder?: boolean;
  reminderTime?: string;
  category?: 'vitamin' | 'nootropic' | 'mineral' | 'protein' | 'general' | 'herbal';
  takenToday: boolean;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  currentStreak: number;
  lastTakenDate?: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  workoutType: 'strength' | 'cardio' | 'hiit' | 'mobility' | 'sports' | 'custom' | 'recovery';
  muscleGroups: string[];
  exercises: Exercise[];
  durationMinutes: number;
  rating: number; // 1-5
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  reflection?: string;
  notes?: string;
  scheduledDate?: string; // YYYY-MM-DD — for planned future sessions
  isTemplate?: boolean;
  templateName?: string;
  activityType?: 'strength' | 'cardio' | 'sport' | 'mobility' | 'recovery' | 'custom';
  distance?: number; // km, for runs/cycles/sport
  sportActivity?: string; // specific activity e.g. Football, Cricket / Net Practice, Badminton, etc.
  completed: boolean;
  createdAt: string;
}


export interface SelfCareRoutine {
  id: string;
  title: string;
  category: 'skincare' | 'haircare' | 'hygiene' | 'grooming' | 'body' | 'mental';
  frequency: 'daily' | 'alternate' | 'weekly' | 'custom';
  selectedDays?: number[];
  timeOfDay: 'morning' | 'evening' | 'night' | 'anytime';
  description?: string;
  completedToday: boolean;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  currentStreak: number;
}

export interface LectureSheet {
  id: string;
  number: number;
  title: string;
  completed: boolean;
  notes?: string;
  completedDate?: string;
}

export interface LabSheet {
  id: string;
  number: number;
  title: string;
  completed: boolean;
  notes?: string;
  completedDate?: string;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  weightPercentage?: number;
  notes?: string;
}

export interface AcademicExam {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  syllabusCovered?: string;
  weightPercentage?: number;
  completed: boolean;
}

export interface AcademicSubject {
  id: string;
  code: string;
  name: string;
  professor?: string;
  semester: string;
  color?: string;
  lectureSheets: LectureSheet[];
  labSheets: LabSheet[];
  assignments: Assignment[];
  exams: AcademicExam[];
  goals: string[];
  notes?: string;
}

export type GoalCategory = 'semester' | 'monthly' | 'subject' | 'career' | 'personal' | 'habit';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';

export interface GoalMilestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
}

export interface GoalChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetDate: string;
  status: GoalStatus;
  progressPercentage: number;
  description?: string;
  milestones: GoalMilestone[];
  checklist: GoalChecklistItem[];
  notes?: string;
  createdAt: string;
}

export interface CareerSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  progressPercentage: number;
  notes?: string;
}

export interface CareerCourse {
  id: string;
  title: string;
  platform: string;
  progressPercentage: number;
  url?: string;
  completed: boolean;
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'planning' | 'in_progress' | 'completed';
  milestones: { id: string; title: string; completed: boolean }[];
}

export interface CareerMilestone {
  id: string;
  title: string;
  targetDate?: string;
  completed: boolean;
}

export interface CareerResource {
  id: string;
  title: string;
  type: 'article' | 'book' | 'video' | 'tool' | 'repo';
  url?: string;
  notes?: string;
}

export interface CareerRoadmap {
  id: string;
  title: string;
  targetRole: string;
  description?: string;
  skills: CareerSkill[];
  courses: CareerCourse[];
  projects: CareerProject[];
  milestones: CareerMilestone[];
  resources: CareerResource[];
  createdAt: string;
}

export interface HobbySession {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  rating: number; // 1-5
  notes?: string;
}

export interface Hobby {
  id: string;
  name: string;
  category: string;
  icon?: string;
  targetFrequency: string; // e.g. "3x / week", "30 mins / day"
  targetMinutesPerWeek: number;
  sessions: HobbySession[];
  currentStreak: number;
  notes?: string;
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:30"
  category: 'work' | 'academic' | 'fitness' | 'personal' | 'wellness' | 'hobby';
  location?: string;
  isCompleted: boolean;
  date?: string;
}

export interface OnboardingData {
  name: string;
  mainFocus: string;
  academicSubjects: string[];
  semester: string;
  careerPaths: string[];
  hobbies: string[];
  wakeTime: string;
  sleepTime: string;
  habitsToBuild: string[];
  supplements: string[];
  dailyWaterTargetMl: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  role?: string;
  dailyFocus?: string;
  avatarInitials: string;
  avatarColor?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  title: string;
  dailyFocus: string;
  semester?: string;
  wakeTime?: string;
  sleepTime?: string;
  streakScore: number;
  themePreference: 'system' | 'light' | 'dark';
  avatarInitials: string;
  avatarColor?: string;
  waterTargetMl?: number;
  onboarded: boolean;
  onboardingData?: OnboardingData;
}

export interface NavigationItem {
  id: ModuleId;
  label: string;
  iconName: string;
  badge?: string | number;
  group: 'overview' | 'daily' | 'wellness' | 'growth' | 'system';
  description: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  undoAction?: () => void;
  undoLabel?: string;
  type?: 'info' | 'success' | 'warning';
  durationMs?: number;
}

export interface InspirationImage {
  id: string;
  imageData: string; // Base64 data URL
  title?: string;
  caption?: string;
  category?: string;
  note?: string;
  pinned: boolean;
  order: number;
  createdAt: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}
