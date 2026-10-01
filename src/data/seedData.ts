import type {
  AcademicSubject,
  CareerRoadmap,
  Goal,
  Habit,
  Hobby,
  NavigationItem,
  OnboardingData,
  ScheduleItem,
  SelfCareRoutine,
  Supplement,
  Task,
  UserProfile,
  WaterLog,
  WorkoutSession,
} from '../types'

export const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getTodayDateString = (): string => {
  return formatLocalDate(new Date())
}


export const defaultEmptyProfile: UserProfile = {
  name: '',
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

export const createFreshUserData = (name: string, role?: string, email?: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .substring(0, 2) || 'U'

  const profile: UserProfile = {
    id: `user_${Date.now()}`,
    name,
    email: email || '',
    title: role || '',
    dailyFocus: '',
    semester: '',
    wakeTime: '07:00',
    sleepTime: '23:00',
    streakScore: 0,
    themePreference: 'system',
    avatarInitials: initials,
    avatarColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'][Math.floor(Math.random() * 6)],
    waterTargetMl: 2500,
    onboarded: false,
  }

  return {
    profile,
    tasks: [] as Task[],
    habits: [] as Habit[],
    waterLog: {
      date: getTodayDateString(),
      targetMl: 2500,
      currentMl: 0,
      entries: [],
    } as WaterLog,
    supplements: [] as Supplement[],
    workouts: [] as WorkoutSession[],
    selfCare: [] as SelfCareRoutine[],
    academics: [] as AcademicSubject[],
    careerRoadmaps: [] as CareerRoadmap[],
    goals: [] as Goal[],
    hobbies: [] as Hobby[],
    schedule: [] as ScheduleItem[],
  }
}

export const initialProfile: UserProfile = {
  name: 'Alex Rivers',
  title: 'Computer Science Student & Engineer',
  dailyFocus: 'Focus on distributed systems assignment and nail today’s strength workout.',
  semester: 'Semester 5',
  wakeTime: '06:30',
  sleepTime: '23:00',
  streakScore: 21,
  themePreference: 'system',
  avatarInitials: 'AR',
  avatarColor: '#3b82f6',
  waterTargetMl: 2750,
  onboarded: true,
}

export const initialTasks: Task[] = [
  {
    id: 't-1',
    title: 'Review System Design architecture for Q4 scaling',
    description: 'Finalize interface contracts, cache invalidation strategy, and repository adapters.',
    priority: 'high',
    dueDate: getTodayDateString(),
    dueTime: '11:00',
    endTime: '12:30',
    completed: true,
    category: 'work',
    tags: ['Architecture', 'Core'],
    subtasks: [
      { id: 'st-1', title: 'Define repository interface contracts', completed: true },
      { id: 'st-2', title: 'Draft caching tier invalidation logic', completed: true },
    ],
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 't-2',
    title: 'Complete Distributed Systems problem set #4',
    description: 'Raft consensus invariants, leader election edge cases, and log compaction.',
    priority: 'urgent',
    dueDate: getTodayDateString(),
    dueTime: '14:30',
    endTime: '16:00',
    completed: false,
    category: 'academic',
    tags: ['CS 401', 'Academics'],
    subtasks: [
      { id: 'st-3', title: 'Proof of Raft leader election safety', completed: true },
      { id: 'st-4', title: 'Log replication matching property proof', completed: false },
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 't-3',
    title: 'Hydration & Mobility stretching break',
    description: '10 minutes of hip mobility and thoracic spine rotation.',
    priority: 'medium',
    dueDate: getTodayDateString(),
    dueTime: '16:00',
    completed: false,
    category: 'health',
    tags: ['Posture', 'Recovery'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    title: 'Prepare presentation for AI Club keynote',
    description: 'Highlight transformer attention heads and self-supervised learning.',
    priority: 'high',
    dueDate: getTodayDateString(),
    dueTime: '17:30',
    completed: false,
    category: 'career',
    tags: ['AI/ML', 'Presentation'],
    createdAt: new Date().toISOString(),
  },
]

export const initialHabits: Habit[] = [
  {
    id: 'h-1',
    title: 'Morning Sunlight & Breathwork',
    icon: 'Sun',
    description: '10-15 minutes of direct morning sunlight to anchor circadian rhythm.',
    frequency: 'daily',
    targetPerDay: 1,
    currentStreak: 18,
    bestStreak: 45,
    completions: { [getTodayDateString()]: true },
    category: 'wellness',
    timeOfDay: 'morning',
    color: 'amber',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'h-2',
    title: '90-Minute Deep Work Block',
    icon: 'Zap',
    description: 'Zero notifications, full focus on primary creative or engineering task.',
    frequency: 'weekdays',
    targetPerDay: 1,
    currentStreak: 12,
    bestStreak: 28,
    completions: { [getTodayDateString()]: true },
    category: 'productivity',
    timeOfDay: 'morning',
    color: 'blue',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'h-3',
    title: 'Strength Training Session',
    icon: 'Dumbbell',
    description: 'Push / Pull / Legs compound movements followed by mobility.',
    frequency: 'daily',
    targetPerDay: 1,
    currentStreak: 5,
    bestStreak: 21,
    completions: { [getTodayDateString()]: false },
    category: 'fitness',
    timeOfDay: 'afternoon',
    color: 'emerald',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'h-4',
    title: 'Read 20+ Pages of Book',
    icon: 'BookOpen',
    description: 'Deliberate reading with margin notes and knowledge capture.',
    frequency: 'daily',
    targetPerDay: 1,
    currentStreak: 26,
    bestStreak: 30,
    completions: { [getTodayDateString()]: false },
    category: 'learning',
    timeOfDay: 'evening',
    color: 'purple',
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
  },
]

export const initialSupplements: Supplement[] = [
  {
    id: 's-1',
    name: 'Vitamin D3 + K2',
    dosage: '5000',
    unit: 'IU',
    timing: 'morning',
    frequency: 'daily',
    notes: 'Take with morning meal containing healthy fats',
    category: 'vitamin',
    takenToday: true,
    history: { [getTodayDateString()]: true },
    currentStreak: 14,
    lastTakenDate: getTodayDateString(),
  },
  {
    id: 's-2',
    name: 'Omega-3 EPA/DHA',
    dosage: '2000',
    unit: 'mg',
    timing: 'morning',
    frequency: 'daily',
    notes: 'Supports cardiovascular & cognitive health',
    category: 'general',
    takenToday: true,
    history: { [getTodayDateString()]: true },
    currentStreak: 12,
    lastTakenDate: getTodayDateString(),
  },
  {
    id: 's-3',
    name: 'Creatine Monohydrate',
    dosage: '5',
    unit: 'g',
    timing: 'noon',
    frequency: 'daily',
    notes: 'Mix in warm water post workout',
    category: 'protein',
    takenToday: false,
    history: {},
    currentStreak: 8,
  },
  {
    id: 's-4',
    name: 'Magnesium Glycinate',
    dosage: '400',
    unit: 'mg',
    timing: 'bedtime',
    frequency: 'daily',
    notes: '30-45 minutes before sleep for nervous system relaxation',
    category: 'mineral',
    takenToday: false,
    history: {},
    currentStreak: 19,
  },
]

export const initialSchedule: ScheduleItem[] = [
  {
    id: 'sc-1',
    title: 'Morning Routine & Sunlight',
    startTime: '07:00',
    endTime: '08:00',
    category: 'wellness',
    isCompleted: true,
  },
  {
    id: 'sc-2',
    title: 'Distributed Systems Lecture & Lab',
    startTime: '09:00',
    endTime: '11:30',
    category: 'academic',
    location: 'Hall B / Lab 3',
    isCompleted: true,
  },
  {
    id: 'sc-3',
    title: 'Core Deep Work Session',
    startTime: '13:00',
    endTime: '15:30',
    category: 'work',
    isCompleted: false,
  },
  {
    id: 'sc-4',
    title: 'Upper Body Hypertrophy Session',
    startTime: '17:00',
    endTime: '18:15',
    category: 'fitness',
    location: 'Campus Gym',
    isCompleted: false,
  },
  {
    id: 'sc-5',
    title: 'Guitar Practice & Reflection',
    startTime: '21:00',
    endTime: '21:45',
    category: 'hobby',
    isCompleted: false,
  },
]

export const initialWaterLog: WaterLog = {
  date: getTodayDateString(),
  targetMl: 2750,
  currentMl: 1750,
  entries: [
    { id: 'w1', amountMl: 500, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), containerName: 'Glass' },
    { id: 'w2', amountMl: 500, timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), containerName: 'Bottle' },
    { id: 'w3', amountMl: 500, timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), containerName: 'Bottle' },
    { id: 'w4', amountMl: 250, timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), containerName: 'Mug' },
  ],
}

export const initialAcademics: AcademicSubject[] = [
  {
    id: 'subj-math',
    code: 'MATH 301',
    name: 'Advanced Linear Algebra & Optimization',
    professor: 'Dr. Katherine Vaughn',
    semester: 'Semester 5',
    color: 'blue',
    lectureSheets: [
      { id: 'ls-1', number: 1, title: 'Vector Spaces & Subspaces', completed: true, completedDate: getTodayDateString() },
      { id: 'ls-2', number: 2, title: 'Linear Transformations & Matrix Representations', completed: true, completedDate: getTodayDateString() },
      { id: 'ls-3', number: 3, title: 'Eigenvalues, Eigenvectors & Diagonalization', completed: true, completedDate: getTodayDateString() },
      { id: 'ls-4', number: 4, title: 'Singular Value Decomposition (SVD)', completed: false, notes: 'Revise low-rank matrix approximations' },
      { id: 'ls-5', number: 5, title: 'Convex Optimization & Gradient Methods', completed: false },
    ],
    labSheets: [
      { id: 'lab-1', number: 1, title: 'NumPy Matrix Decompositions & Performance', completed: true, completedDate: getTodayDateString() },
      { id: 'lab-2', number: 2, title: 'PCA Implementation on High-Dimensional Datasets', completed: true, completedDate: getTodayDateString() },
      { id: 'lab-3', number: 3, title: 'Constrained Optimization using SciPy', completed: false, notes: 'Due this Thursday' },
    ],
    assignments: [
      { id: 'as-1', title: 'Problem Set 1: Orthogonal Projections', dueDate: '2026-09-15', completed: true, weightPercentage: 10 },
      { id: 'as-2', title: 'Problem Set 2: SVD & Image Compression', dueDate: getTodayDateString(), completed: false, weightPercentage: 15, notes: 'Needs Jupyter Notebook submission' },
    ],
    exams: [
      { id: 'ex-1', title: 'Midterm Examination', date: '2026-10-14', time: '10:00 AM', location: 'Hall 102', weightPercentage: 35, completed: false, syllabusCovered: 'Sheets 1-4, Labs 1-2' },
    ],
    goals: ['Score 90%+ on Midterm', 'Master geometric intuition for SVD'],
  },
  {
    id: 'subj-cs',
    code: 'CS 401',
    name: 'Distributed Systems & Cloud Computing',
    professor: 'Prof. David Chen',
    semester: 'Semester 5',
    color: 'purple',
    lectureSheets: [
      { id: 'ls-c1', number: 1, title: 'Distributed Clocks & Lamport Timestamps', completed: true },
      { id: 'ls-c2', number: 2, title: 'Raft Consensus Protocol & Invariants', completed: true },
      { id: 'ls-c3', number: 3, title: 'Paxos vs Raft Comparison & Failure Modes', completed: false, notes: 'Review quorum intersection rules' },
      { id: 'ls-c4', number: 4, title: 'Consistent Hashing & Dynamo Architecture', completed: false },
    ],
    labSheets: [
      { id: 'lab-c1', number: 1, title: 'RPC Server & Client in Go', completed: true },
      { id: 'lab-c2', number: 2, title: 'Building Raft Key-Value Store Part A', completed: false, notes: 'Leader election bug in partition test' },
    ],
    assignments: [
      { id: 'as-c1', title: 'Distributed Mutex Lab Report', dueDate: getTodayDateString(), completed: false, weightPercentage: 20 },
    ],
    exams: [
      { id: 'ex-c1', title: 'Quiz 1: Consensus Mechanisms', date: '2026-09-28', weightPercentage: 15, completed: false },
    ],
    goals: ['Complete Raft KV store with 100% test pass rate'],
  },
]

export const initialCareerRoadmaps: CareerRoadmap[] = [
  {
    id: 'cr-1',
    title: 'AI / Machine Learning Engineering',
    targetRole: 'Senior Machine Learning Systems Engineer',
    description: 'Master deep learning architectures, scalable inference pipelines, CUDA optimization, and distributed LLM fine-tuning.',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    skills: [
      { id: 'sk-1', name: 'PyTorch & Neural Architectures', level: 'advanced', progressPercentage: 85, notes: 'Transformers, Diffusion, LoRA' },
      { id: 'sk-2', name: 'Distributed Training (DeepSpeed, FSDP)', level: 'intermediate', progressPercentage: 60 },
      { id: 'sk-3', name: 'High-Performance Inference (vLLM, TensorRT-LLM)', level: 'intermediate', progressPercentage: 55 },
      { id: 'sk-4', name: 'CUDA C++ Kernel Development', level: 'beginner', progressPercentage: 30, notes: 'Custom FlashAttention exploration' },
    ],
    courses: [
      { id: 'co-1', title: 'DeepLearning.AI: Deep Learning Specialization', platform: 'Coursera', progressPercentage: 100, completed: true },
      { id: 'co-2', title: 'Stanford CS224N: Natural Language Processing with Deep Learning', platform: 'Stanford Online', progressPercentage: 70, completed: false },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Local Latency-Optimized RAG Engine',
        description: 'End-to-end retrieval augmented generation system with quantized embeddings and rerankers running in under 50ms.',
        techStack: ['PyTorch', 'Qdrant', 'FastAPI', 'Rust'],
        githubUrl: 'https://github.com/alexrivers/nano-rag',
        status: 'in_progress',
        milestones: [
          { id: 'm-1', title: 'Vector store benchmarking', completed: true },
          { id: 'm-2', title: 'Quantized cross-encoder reranking', completed: true },
          { id: 'm-3', title: 'Streaming token web interface', completed: false },
        ],
      },
    ],
    milestones: [
      { id: 'cm-1', title: 'Publish technical blog post on LLM inference optimization', targetDate: '2026-10-15', completed: false },
      { id: 'cm-2', title: 'Contribute PR to popular open-source ML repo', targetDate: '2026-11-01', completed: false },
    ],
    resources: [
      { id: 'res-1', title: 'Dive into Deep Learning (d2l.ai)', type: 'book', url: 'https://d2l.ai' },
      { id: 'res-2', title: 'HuggingFace TGI Architecture Guide', type: 'article' },
    ],
  },
  {
    id: 'cr-2',
    title: 'Fullstack & Systems Engineering',
    targetRole: 'Product & Systems Engineer',
    description: 'Build polished web platforms, high-performance distributed backends, and responsive, fluid client apps.',
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    skills: [
      { id: 'sk-fs1', name: 'TypeScript & React Architecture', level: 'master', progressPercentage: 95 },
      { id: 'sk-fs2', name: 'Systems Programming in Rust/Go', level: 'intermediate', progressPercentage: 65 },
      { id: 'sk-fs3', name: 'PostgreSQL & Database Internals', level: 'advanced', progressPercentage: 80 },
    ],
    courses: [
      { id: 'co-fs1', title: 'Frontend Masters: Web Performance Architecture', platform: 'Frontend Masters', progressPercentage: 100, completed: true },
    ],
    projects: [
      {
        id: 'proj-fs1',
        title: 'Just Do It — Personal Life OS',
        description: 'High-density, calm digital life operating system inspired by Apple and Linear.',
        techStack: ['React 19', 'TypeScript', 'Vite', 'Vanilla CSS'],
        status: 'in_progress',
        milestones: [
          { id: 'mf-1', title: 'Core architecture and repository persistence', completed: true },
          { id: 'mf-2', title: 'Smart Today command center & Onboarding flow', completed: true },
          { id: 'mf-3', title: 'Full interconnected modules buildout', completed: false },
        ],
      },
    ],
    milestones: [
      { id: 'cm-fs1', title: 'Ship v1.0 Production Release', targetDate: '2026-10-01', completed: false },
    ],
    resources: [
      { id: 'res-fs1', title: 'Refactoring UI by Adam Wathan & Steve Schoger', type: 'book' },
    ],
  },
]

export const initialWorkouts: WorkoutSession[] = [
  {
    id: 'wo-1',
    date: getTodayDateString(),
    title: 'Upper Body Hypertrophy & Power',
    workoutType: 'strength',
    muscleGroups: ['Chest', 'Upper Back', 'Shoulders', 'Arms'],
    durationMinutes: 65,
    rating: 5,
    completed: false,
    notes: 'Focus on 2-second eccentric phase on bench press and full scapular retraction on pull-ups.',
    createdAt: new Date().toISOString(),
    exercises: [
      {
        id: 'ex-1',
        name: 'Barbell Bench Press',
        targetMuscle: 'Chest',
        sets: [
          { id: 's-1', setNumber: 1, reps: 8, weightKg: 85, completed: true },
          { id: 's-2', setNumber: 2, reps: 8, weightKg: 85, completed: true },
          { id: 's-3', setNumber: 3, reps: 6, weightKg: 90, completed: false },
        ],
      },
      {
        id: 'ex-2',
        name: 'Weighted Pull-Ups',
        targetMuscle: 'Upper Back / Lats',
        sets: [
          { id: 's-4', setNumber: 1, reps: 6, weightKg: 15, completed: false },
          { id: 's-5', setNumber: 2, reps: 6, weightKg: 15, completed: false },
          { id: 's-6', setNumber: 3, reps: 6, weightKg: 15, completed: false },
        ],
      },
      {
        id: 'ex-3',
        name: 'Incline Dumbbell Press',
        targetMuscle: 'Upper Chest',
        sets: [
          { id: 's-7', setNumber: 1, reps: 10, weightKg: 30, completed: false },
          { id: 's-8', setNumber: 2, reps: 10, weightKg: 30, completed: false },
        ],
      },
    ],
  },
]

export const initialSelfCare: SelfCareRoutine[] = [
  {
    id: 'sc-1',
    title: 'Morning Skincare Protocol',
    category: 'skincare',
    frequency: 'daily',
    timeOfDay: 'morning',
    description: 'Gentle cleanser, Vitamin C serum, Ceramide moisturizer, SPF 50 Broad Spectrum.',
    completedToday: true,
    history: { [getTodayDateString()]: true },
    currentStreak: 19,
  },
  {
    id: 'sc-2',
    title: 'Haircare & Scalp Treatment',
    category: 'haircare',
    frequency: 'alternate',
    timeOfDay: 'morning',
    description: 'Sulfate-free hydrating shampoo, peptide scalp serum, and conditioner.',
    completedToday: false,
    history: {},
    currentStreak: 6,
  },
  {
    id: 'sc-3',
    title: 'Evening Recovery & Night Cream',
    category: 'skincare',
    frequency: 'daily',
    timeOfDay: 'night',
    description: 'Double cleanse, 0.05% Retinol, Hyaluronic acid, barrier repair night cream.',
    completedToday: false,
    history: {},
    currentStreak: 12,
  },
  {
    id: 'sc-4',
    title: 'Posture & Joint Decompression',
    category: 'body',
    frequency: 'daily',
    timeOfDay: 'evening',
    description: 'Deadhangs (2 mins total), child pose, thoracic foam rolling.',
    completedToday: false,
    history: {},
    currentStreak: 8,
  },
]

export const initialGoals: Goal[] = [
  {
    id: 'g-1',
    title: 'Achieve 3.9+ GPA in Semester 5',
    category: 'semester',
    targetDate: '2026-12-20',
    status: 'in_progress',
    progressPercentage: 65,
    description: 'Stay ahead on all lecture sheets, complete lab assignments 48 hours prior to deadline, and review past exam questions weekly.',
    milestones: [
      { id: 'gm-1', title: 'Complete all Linear Algebra lecture sheets 1-5', completed: true },
      { id: 'gm-2', title: 'Score 90%+ on CS 401 midterm exam', completed: false, targetDate: '2026-10-20' },
      { id: 'gm-3', title: 'Submit Semester Project with distinction', completed: false, targetDate: '2026-12-05' },
    ],
    checklist: [
      { id: 'gc-1', title: 'Weekly math revision session on Sundays', completed: true },
      { id: 'gc-2', title: 'Review lab solutions with study group', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'g-2',
    title: 'Bench Press 100kg & Run 5k under 22 mins',
    category: 'personal',
    targetDate: '2026-11-30',
    status: 'in_progress',
    progressPercentage: 80,
    description: 'Consistent strength training, progressive overload, zone 2 aerobic base on weekends.',
    milestones: [
      { id: 'gm-4', title: 'Hit 90kg bench for 5 reps', completed: true },
      { id: 'gm-5', title: 'Hit 95kg bench for 3 reps', completed: true },
      { id: 'gm-6', title: 'Test 100kg single with clean pause', completed: false, targetDate: '2026-11-15' },
    ],
    checklist: [
      { id: 'gc-3', title: 'Track every set and RPE in workout log', completed: true },
      { id: 'gc-4', title: 'Maintain 160g+ daily protein intake', completed: true },
    ],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'g-3',
    title: 'Land Machine Learning Engineer Internship',
    category: 'career',
    targetDate: '2026-11-15',
    status: 'in_progress',
    progressPercentage: 70,
    description: 'Complete 2 showcase projects, prepare for system design & coding interviews.',
    milestones: [
      { id: 'gm-7', title: 'Finish and benchmark Local RAG Engine', completed: true },
      { id: 'gm-8', title: 'Polish resume and GitHub repositories', completed: true },
      { id: 'gm-9', title: 'Apply to top 15 target engineering teams', completed: false, targetDate: '2026-10-05' },
    ],
    checklist: [
      { id: 'gc-5', title: 'Solve 2 LeetCode Mediums daily', completed: true },
      { id: 'gc-6', title: 'Do 3 mock ML system design interviews', completed: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
]

export const initialHobbies: Hobby[] = [
  {
    id: 'hob-1',
    name: 'Acoustic & Electric Guitar',
    category: 'Music',
    icon: 'Music',
    targetFrequency: '4x / week',
    targetMinutesPerWeek: 180,
    currentStreak: 9,
    notes: 'Learning fingerstyle arrangements and pentatonic improvisation over jazz progressions.',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    sessions: [
      { id: 'hs-1', date: getTodayDateString(), durationMinutes: 40, rating: 5, notes: 'Mastered intro chords for Neon by John Mayer' },
      { id: 'hs-2', date: '2026-09-19', durationMinutes: 30, rating: 4, notes: 'Metronome practice at 110 bpm' },
    ],
  },
  {
    id: 'hob-2',
    name: 'Chess Tactics & Rapid Analysis',
    category: 'Strategy',
    icon: 'Sparkles',
    targetFrequency: 'Daily (20 mins)',
    targetMinutesPerWeek: 140,
    currentStreak: 14,
    notes: 'Aiming for 1800+ rating on Lichess / Chess.com rapid.',
    createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
    sessions: [
      { id: 'hs-3', date: '2026-09-20', durationMinutes: 25, rating: 5, notes: 'Solved 25 tactical puzzle rush problems with 92% accuracy' },
    ],
  },
]

/**
 * Generate personal structures from the onboarding answers
 */
export const generatePersonalizedSeed = (data: OnboardingData) => {
  const today = getTodayDateString()

  // Profile
  const initials = data.name
    ? data.name
        .split(' ')
        .map((w) => w[0]?.toUpperCase() || '')
        .join('')
        .substring(0, 2) || 'ME'
    : 'ME'

  const profile: UserProfile = {
    name: data.name || 'New User',
    title: data.careerPaths && data.careerPaths[0] ? data.careerPaths[0] : (data.semester ? `Student · ${data.semester}` : 'Active Creator'),
    dailyFocus: data.mainFocus || '',
    semester: data.semester || '',
    wakeTime: data.wakeTime || '07:00',
    sleepTime: data.sleepTime || '23:00',
    streakScore: 0,
    themePreference: 'system',
    avatarInitials: initials,
    avatarColor: '#3b82f6',
    waterTargetMl: data.dailyWaterTargetMl || 2500,
    onboarded: true,
    onboardingData: data,
  }

  // Academic Subjects - ONLY what user entered/selected, no fake lecture sheets or exams!
  const subjects: AcademicSubject[] = (data.academicSubjects || []).map((subjName, idx) => ({
    id: `subj_${Date.now()}_${idx}`,
    code: `SUBJ ${101 + idx}`,
    name: subjName,
    semester: data.semester || 'Semester 1',
    color: ['blue', 'purple', 'emerald', 'amber'][idx % 4],
    lectureSheets: [],
    labSheets: [],
    assignments: [],
    exams: [],
    goals: [],
  }))

  // Career Roadmaps - ONLY what user entered, no fake courses or projects!
  const roadmaps: CareerRoadmap[] = (data.careerPaths || []).map((pathName, idx) => ({
    id: `cr_${Date.now()}_${idx}`,
    title: pathName,
    targetRole: pathName,
    description: `Growth and skill development roadmap for ${pathName}.`,
    createdAt: new Date().toISOString(),
    skills: [],
    courses: [],
    projects: [],
    milestones: [],
    resources: [],
  }))

  // Habits - ONLY what user entered/selected!
  const habits: Habit[] = (data.habitsToBuild || []).map((habitName, idx) => ({
    id: `h_${Date.now()}_${idx}`,
    title: habitName,
    icon: 'Sparkles',
    frequency: 'daily',
    targetPerDay: 1,
    currentStreak: 0,
    bestStreak: 0,
    completions: {},
    category: idx % 2 === 0 ? 'productivity' : 'wellness',
    timeOfDay: idx === 0 ? 'morning' : 'anytime',
    color: ['blue', 'emerald', 'amber', 'purple'][idx % 4],
    createdAt: new Date().toISOString(),
  }))

  // Supplements - ONLY what user entered/selected!
  const supplements: Supplement[] = (data.supplements || []).map((supName, idx) => ({
    id: `s_${Date.now()}_${idx}`,
    name: supName,
    dosage: '1',
    unit: 'serving',
    timing: 'morning',
    frequency: 'daily',
    takenToday: false,
    history: {},
    currentStreak: 0,
  }))

  // Hobbies - ONLY what user entered/selected!
  const hobbies: Hobby[] = (data.hobbies || []).map((hobbyName, idx) => ({
    id: `hob_${Date.now()}_${idx}`,
    name: hobbyName,
    category: 'General',
    icon: 'Palette',
    targetFrequency: '3x / week',
    targetMinutesPerWeek: 120,
    currentStreak: 0,
    createdAt: new Date().toISOString(),
    sessions: [],
  }))

  // Water Log - fresh start
  const waterLog: WaterLog = {
    date: today,
    targetMl: data.dailyWaterTargetMl || 2500,
    currentMl: 0,
    entries: [],
  }

  // Tasks - start 100% empty, letting user add their own!
  const tasks: Task[] = []

  // Goals - start empty
  const goals: Goal[] = []

  // Self-Care - start empty
  const selfCare: SelfCareRoutine[] = []

  return {
    profile,
    subjects,
    roadmaps,
    habits,
    supplements,
    hobbies,
    waterLog,
    tasks,
    goals,
    selfCare,
  }
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'today',
    label: 'Today',
    iconName: 'Sparkles',
    badge: 'Active',
    group: 'overview',
    description: 'Unified daily command center, high priority tasks, habits, vitals, and instant logging.',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    iconName: 'Calendar',
    group: 'overview',
    description: 'Integrated agenda, deadlines, exams, and time-blocked schedules.',
  },
  {
    id: 'inspiration',
    label: 'Inspiration',
    iconName: 'Image',
    group: 'overview',
    description: 'Personal visual board, moodboards, aesthetics, and creative references.',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    iconName: 'CheckSquare',
    badge: 3,
    group: 'daily',
    description: 'Hierarchical task management with subtasks, tags, time-blocking, and priorities.',
  },
  {
    id: 'habits',
    label: 'Habits',
    iconName: 'Flame',
    group: 'daily',
    description: 'Daily streak tracking, consistency heatmaps, custom days, and atomic habit builders.',
  },
  {
    id: 'water',
    label: 'Water Tracker',
    iconName: 'Droplets',
    group: 'daily',
    description: 'Hydration goal tracking with quick logs, custom bottle sizes, and intake timeline.',
  },
  {
    id: 'supplements',
    label: 'Supplements',
    iconName: 'Pill',
    group: 'daily',
    description: 'Nutritional protocols, dosage units, timed schedules, and adherence history.',
  },
  {
    id: 'workouts',
    label: 'Workouts & Gym',
    iconName: 'Dumbbell',
    group: 'wellness',
    description: 'Sets, reps, weight tracking, ratings, muscle groups, and volume statistics.',
  },
  {
    id: 'selfcare',
    label: 'Self-Care',
    iconName: 'HeartHandshake',
    group: 'wellness',
    description: 'Skincare, haircare, grooming, and hygiene routines with custom frequencies.',
  },
  {
    id: 'academics',
    label: 'Academics',
    iconName: 'GraduationCap',
    group: 'growth',
    description: 'Subjects, numbered lecture sheets, lab sheets, assignments, exams, and semester progress.',
  },
  {
    id: 'career',
    label: 'Career Growth',
    iconName: 'Briefcase',
    group: 'growth',
    description: 'Multi-track career roadmaps: Skills matrix, courses, projects, and milestones.',
  },
  {
    id: 'goals',
    label: 'Goals & OKRs',
    iconName: 'Target',
    group: 'growth',
    description: 'Semester, monthly, subject, career, and personal goals with milestone checklists.',
  },
  {
    id: 'hobbies',
    label: 'Hobbies & Craft',
    iconName: 'Palette',
    group: 'growth',
    description: 'Personal projects, creative pursuits, practice sessions, ratings, and time spent.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    iconName: 'BarChart3',
    group: 'system',
    description: 'Aggregated insights across tasks, habits, workouts, academics, hydration, and career.',
  },
  {
    id: 'settings',
    label: 'Settings',
    iconName: 'Settings',
    group: 'system',
    description: 'Personalization, theme controls, and JSON data backup/restore.',
  },
  {
    id: 'profile',
    label: 'Profile & Accounts',
    iconName: 'User',
    group: 'system',
    description: 'Manage accounts, profile details, daily schedule, and personal data access.',
  },
]
