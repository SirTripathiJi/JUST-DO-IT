import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import type {
  GoalCategory,
  HabitCategory,
  HabitFrequency,
  HabitTimeOfDay,
  PriorityLevel,
  SupplementTiming,
  TaskCategory,
} from '../../types'
import { Plus, Trash2, X, ChevronDown } from 'lucide-react'

export const ContextualModalManager: React.FC = () => {
  const {
    modal,
    closeModal,
    addTask,
    addHabit,
    logWater,
    addSupplement,
    addWorkout,
    addSelfCareRoutine,
    profile,
    academics,
    addSubject,
    addLectureSheet,
    addLabSheet,
    addAssignment,
    addLectureSheetWithSubject,
    addLabSheetWithSubject,
    addAssignmentWithSubject,
    careerRoadmaps,
    addCareerRoadmap,
    addCareerSkill,
    addCareerProject,
    addCareerMilestone,
    addGoal,
    hobbies,
    addHobby,
    logHobbySession,
  } = useApp()

  const today = getTodayDateString()

  // 1. Task Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium')
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('personal')
  const [taskDate, setTaskDate] = useState(today)
  const [taskStartTime, setTaskStartTime] = useState('09:00')
  const [taskEndTime, setTaskEndTime] = useState('10:00')
  const [taskRecurring, setTaskRecurring] = useState<'none' | 'daily' | 'weekdays' | 'weekly'>('none')
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>([])
  const [subtaskInput, setSubtaskInput] = useState('')
  const [taskTags, setTaskTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // 2. Habit Form State
  const [habitTitle, setHabitTitle] = useState('')
  const [habitDesc, setHabitDesc] = useState('')
  const [habitCategory, setHabitCategory] = useState<any>('wellness')
  const [habitFreq, setHabitFreq] = useState<HabitFrequency>('daily')
  const [habitTimeOfDay, setHabitTimeOfDay] = useState<HabitTimeOfDay>('morning')
  const [habitColor, setHabitColor] = useState('blue')

  // 3. Water Form State
  const [waterAmount, setWaterAmount] = useState<number>(250)
  const [waterContainer, setWaterContainer] = useState('Glass')

  // 4. Supplement Form State
  const [supName, setSupName] = useState('')
  const [supDosage, setSupDosage] = useState('1')
  const [supUnit, setSupUnit] = useState('capsule')
  const [supTiming, setSupTiming] = useState<SupplementTiming>('morning')
  const [supNotes, setSupNotes] = useState('')

  // 5. Workout Form State
  const [woTitle, setWoTitle] = useState('Upper Body Hypertrophy')
  const [woType, setWoType] = useState<any>('strength')
  const [woMuscles, setWoMuscles] = useState('Chest, Back, Arms')
  const [woSportActivity, setWoSportActivity] = useState('')
  const [woDuration, setWoDuration] = useState(60)
  const [woDistance, setWoDistance] = useState<number>(0)
  const [woRating, setWoRating] = useState(5)
  const [woEnergy, setWoEnergy] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [woDifficulty, setWoDifficulty] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [woNotes, setWoNotes] = useState('')
  const [woReflection, setWoReflection] = useState('')
  const [woExercises, setWoExercises] = useState<
    { name: string; targetMuscle: string; sets: { reps: number; weightKg: number }[] }[]
  >([
    {
      name: 'Bench Press',
      targetMuscle: 'Chest',
      sets: [
        { reps: 8, weightKg: 80 },
        { reps: 8, weightKg: 80 },
        { reps: 6, weightKg: 85 },
      ],
    },
  ])

  // 6. SelfCare Form State
  const [scTitle, setScTitle] = useState('')
  const [scCategory, setScCategory] = useState<any>('skincare')
  const [scFreq, setScFreq] = useState<any>('daily')
  const [scTimeOfDay, setScTimeOfDay] = useState<any>('morning')
  const [scDesc, setScDesc] = useState('')

  // 7. Academic Forms
  const [subjCode, setSubjCode] = useState('MATH 301')
  const [subjName, setSubjName] = useState('')
  const [subjProf, setSubjProf] = useState('')
  const [subjSem, setSubjSem] = useState('Semester 5')

  const [sheetSubjId, setSheetSubjId] = useState('')
  const [sheetNumber, setSheetNumber] = useState(1)
  const [sheetTitle, setSheetTitle] = useState('')
  const [sheetNotes, setSheetNotes] = useState('')
  const [sheetSubjectMode, setSheetSubjectMode] = useState<'choose' | 'new'>('choose')
  const [sheetNewSubjCode, setSheetNewSubjCode] = useState('')
  const [sheetNewSubjName, setSheetNewSubjName] = useState('')

  // Sync subject selection and defaults whenever academic modals open
  useEffect(() => {
    if (modal.type === 'lecture_sheet' || modal.type === 'lab_sheet' || modal.type === 'assignment') {
      // Determine best subject ID
      let resolvedSubjId = ''
      if (modal.payload?.subjectId && academics.some((s) => s.id === modal.payload.subjectId)) {
        resolvedSubjId = modal.payload.subjectId
      } else if (sheetSubjId && academics.some((s) => s.id === sheetSubjId)) {
        resolvedSubjId = sheetSubjId
      } else if (academics.length > 0) {
        resolvedSubjId = academics[0].id
      }

      if (resolvedSubjId) {
        setSheetSubjId(resolvedSubjId)
        setSheetSubjectMode('choose')
      } else {
        setSheetSubjId('')
        setSheetSubjectMode('new')
      }

      if (modal.payload?.nextNumber) {
        setSheetNumber(modal.payload.nextNumber)
      } else if (modal.type === 'lecture_sheet') {
        const targetSubj = academics.find((s) => s.id === resolvedSubjId)
        if (targetSubj) {
          setSheetNumber(targetSubj.lectureSheets.length + 1)
        }
      } else if (modal.type === 'lab_sheet') {
        const targetSubj = academics.find((s) => s.id === resolvedSubjId)
        if (targetSubj) {
          setSheetNumber(targetSubj.labSheets.length + 1)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.type, modal.payload, academics])

  const [asTitle, setAsTitle] = useState('')
  const [asDate, setAsDate] = useState(today)
  const [asWeight, setAsWeight] = useState(15)

  // 8. Career Forms
  const [crTitle, setCrTitle] = useState('')
  const [crTargetRole, setCrTargetRole] = useState('')
  const [crDesc, setCrDesc] = useState('')

  const [skillRoadmapId, setSkillRoadmapId] = useState(careerRoadmaps[0]?.id || '')
  const [skillName, setSkillName] = useState('')
  const [skillLevel, setSkillLevel] = useState<any>('beginner')

  const [projRoadmapId, setProjRoadmapId] = useState(careerRoadmaps[0]?.id || '')
  const [projTitle, setProjTitle] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [projTech, setProjTech] = useState('')

  const [msRoadmapId, setMsRoadmapId] = useState(careerRoadmaps[0]?.id || '')
  const [msTitle, setMsTitle] = useState('')
  const [msDate, setMsDate] = useState(today)

  // 9. Goals Form State
  const [goalTitle, setGoalTitle] = useState('')
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('semester')
  const [goalDate, setGoalDate] = useState(today)
  const [goalDesc, setGoalDesc] = useState('')
  const [goalMilestones, setGoalMilestones] = useState<string[]>([])
  const [gmInput, setGmInput] = useState('')

  // 10. Hobbies Form State
  const [hobName, setHobName] = useState('')
  const [hobCat, setHobCat] = useState('Creative')
  const [hobFreq, setHobFreq] = useState('3x / week')
  const [hobMins, setHobMins] = useState(120)

  const [sessionHobId, setSessionHobId] = useState(hobbies[0]?.id || '')
  const [sessionMins, setSessionMins] = useState(30)
  const [sessionRating, setSessionRating] = useState(5)
  const [sessionNotes, setSessionNotes] = useState('')

  if (!modal.type || modal.type === 'onboarding' || modal.type === 'command_palette') {
    return null
  }

  // Submit Handlers
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      priority: taskPriority,
      category: taskCategory,
      dueDate: taskDate,
      dueTime: taskStartTime,
      endTime: taskEndTime,
      recurring: taskRecurring,
      completed: false,
      tags: taskTags,
      subtasks: taskSubtasks.map((st, i) => ({ id: `st_${Date.now()}_${i}`, title: st, completed: false })),
    })
    setTaskTitle('')
    setTaskDesc('')
    setTaskSubtasks([])
  }

  const handleHabitSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!habitTitle.trim()) return
    addHabit({
      title: habitTitle.trim(),
      description: habitDesc.trim() || undefined,
      category: habitCategory,
      frequency: habitFreq,
      timeOfDay: habitTimeOfDay,
      targetPerDay: 1,
      color: habitColor,
    })
    setHabitTitle('')
    setHabitDesc('')
  }

  const handleWaterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (waterAmount <= 0) return
    logWater(waterAmount, waterContainer)
  }

  const handleSupplementSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supName.trim()) return
    addSupplement({
      name: supName.trim(),
      dosage: supDosage,
      unit: supUnit,
      timing: supTiming,
      frequency: 'daily',
      notes: supNotes.trim() || undefined,
    })
    setSupName('')
    setSupNotes('')
  }

  const handleWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!woTitle.trim()) return
    const exercisesFormatted = woExercises.map((ex, idx) => ({
      id: `ex_${Date.now()}_${idx}`,
      name: ex.name,
      targetMuscle: ex.targetMuscle,
      sets: ex.sets.map((s, sIdx) => ({
        id: `s_${Date.now()}_${idx}_${sIdx}`,
        setNumber: sIdx + 1,
        reps: s.reps,
        weightKg: s.weightKg,
        completed: true,
      })),
    }))
    addWorkout({
      title: woTitle.trim(),
      date: today,
      workoutType: woType,
      muscleGroups: woMuscles.split(',').map((m) => m.trim()).filter(Boolean),
      sportActivity: woSportActivity || undefined,
      durationMinutes: Number(woDuration) || 0,
      distance: woDistance > 0 ? Number(woDistance) : undefined,
      rating: woRating,
      energyLevel: woEnergy,
      difficulty: woDifficulty,
      notes: woNotes.trim() || undefined,
      reflection: woReflection.trim() || undefined,
      completed: true,
      exercises: exercisesFormatted,
    })
  }

  const handleSelfCareSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scTitle.trim()) return
    addSelfCareRoutine({
      title: scTitle.trim(),
      category: scCategory,
      frequency: scFreq,
      timeOfDay: scTimeOfDay,
      description: scDesc.trim() || undefined,
    })
    setScTitle('')
    setScDesc('')
  }

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subjName.trim()) return
    addSubject({
      code: subjCode.trim() || 'SUBJ 101',
      name: subjName.trim(),
      professor: subjProf.trim() || undefined,
      semester: subjSem.trim() || 'Semester 5',
      color: 'blue',
    })
    setSubjName('')
  }

  const handleLectureSheetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sheetTitle.trim()) return

    const isNew = sheetSubjectMode === 'new' || academics.length === 0
    if (isNew) {
      const code = sheetNewSubjCode.trim() || 'ACAD 101'
      const name = sheetNewSubjName.trim() || code
      addLectureSheetWithSubject(
        { code, name },
        {
          number: Number(sheetNumber) || 1,
          title: sheetTitle.trim(),
          completed: false,
          notes: sheetNotes.trim() || undefined,
        }
      )
    } else {
      const targetId = sheetSubjId || academics[0]?.id
      if (!targetId) return
      addLectureSheet(targetId, {
        number: Number(sheetNumber) || 1,
        title: sheetTitle.trim(),
        completed: false,
        notes: sheetNotes.trim() || undefined,
      })
    }
    setSheetTitle('')
    setSheetNotes('')
    setSheetNewSubjCode('')
    setSheetNewSubjName('')
  }

  const handleLabSheetSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sheetTitle.trim()) return

    const isNew = sheetSubjectMode === 'new' || academics.length === 0
    if (isNew) {
      const code = sheetNewSubjCode.trim() || 'LAB 101'
      const name = sheetNewSubjName.trim() || code
      addLabSheetWithSubject(
        { code, name },
        {
          number: Number(sheetNumber) || 1,
          title: sheetTitle.trim(),
          completed: false,
          notes: sheetNotes.trim() || undefined,
        }
      )
    } else {
      const targetId = sheetSubjId || academics[0]?.id
      if (!targetId) return
      addLabSheet(targetId, {
        number: Number(sheetNumber) || 1,
        title: sheetTitle.trim(),
        completed: false,
        notes: sheetNotes.trim() || undefined,
      })
    }
    setSheetTitle('')
    setSheetNotes('')
    setSheetNewSubjCode('')
    setSheetNewSubjName('')
  }

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!asTitle.trim()) return

    const isNew = sheetSubjectMode === 'new' || academics.length === 0
    if (isNew) {
      const code = sheetNewSubjCode.trim() || 'ACAD 101'
      const name = sheetNewSubjName.trim() || code
      addAssignmentWithSubject(
        { code, name },
        {
          title: asTitle.trim(),
          dueDate: asDate,
          completed: false,
          weightPercentage: Number(asWeight) || 10,
        }
      )
    } else {
      const targetId = sheetSubjId || academics[0]?.id
      if (!targetId) return
      addAssignment(targetId, {
        title: asTitle.trim(),
        dueDate: asDate,
        completed: false,
        weightPercentage: Number(asWeight) || 10,
      })
    }
    setAsTitle('')
    setSheetNewSubjCode('')
    setSheetNewSubjName('')
  }

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!goalTitle.trim()) return
    addGoal({
      title: goalTitle.trim(),
      category: goalCategory,
      targetDate: goalDate,
      status: 'in_progress',
      description: goalDesc.trim() || undefined,
      milestones: goalMilestones.map((gm, i) => ({
        id: `gm_${Date.now()}_${i}`,
        title: gm,
        completed: false,
      })),
      checklist: [],
    })
    setGoalTitle('')
    setGoalDesc('')
    setGoalMilestones([])
  }

  const handleRoadmapSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!crTitle.trim()) return
    addCareerRoadmap({
      title: crTitle.trim(),
      targetRole: crTargetRole.trim() || crTitle.trim(),
      description: crDesc.trim() || undefined,
    })
    setCrTitle('')
  }

  const handleSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!skillName.trim() || !skillRoadmapId) return
    addCareerSkill(skillRoadmapId, {
      name: skillName.trim(),
      level: skillLevel,
      progressPercentage: 20,
    })
    setSkillName('')
  }

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!projTitle.trim() || !projRoadmapId) return
    addCareerProject(projRoadmapId, {
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: projTech.split(',').map((t) => t.trim()),
      status: 'planning',
      milestones: [{ id: `m1`, title: 'Initial architecture & spec', completed: false }],
    })
    setProjTitle('')
    setProjDesc('')
  }

  const handleHobbySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hobName.trim()) return
    addHobby({
      name: hobName.trim(),
      category: hobCat,
      targetFrequency: hobFreq,
      targetMinutesPerWeek: Number(hobMins),
    })
    setHobName('')
  }

  const handleHobbySessionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionHobId) return
    logHobbySession(sessionHobId, {
      date: today,
      durationMinutes: Number(sessionMins),
      rating: Number(sessionRating),
      notes: sessionNotes.trim() || undefined,
    })
    setSessionNotes('')
  }

  return (
    <>
      {/* 1. TASK MODAL */}
      <Modal
        isOpen={modal.type === 'task'}
        onClose={closeModal}
        title="Create New Task"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleTaskSubmit}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Task Title *"
            autoFocus
            placeholder="e.g. Implement consensus algorithm"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />

          <Textarea
            label="Description & Context"
            placeholder="Key acceptance criteria or details..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Priority"
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
            />
            <Select
              label="Category"
              value={taskCategory}
              onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
              options={[
                { value: 'academic', label: 'Academic' },
                { value: 'career', label: 'Career' },
                { value: 'work', label: 'Work' },
                { value: 'personal', label: 'Personal' },
                { value: 'health', label: 'Health' },
                { value: 'projects', label: 'Projects' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Due Date"
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
            />
            <Input
              label="Start Time"
              type="time"
              value={taskStartTime}
              onChange={(e) => setTaskStartTime(e.target.value)}
            />
            <Input
              label="End Time"
              type="time"
              value={taskEndTime}
              onChange={(e) => setTaskEndTime(e.target.value)}
            />
          </div>

          {/* Subtasks */}
          <div className="field">
            <label className="field-label">Subtasks / Checklist</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Add subtask step..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (subtaskInput.trim()) {
                      setTaskSubtasks([...taskSubtasks, subtaskInput.trim()])
                      setSubtaskInput('')
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (subtaskInput.trim()) {
                    setTaskSubtasks([...taskSubtasks, subtaskInput.trim()])
                    setSubtaskInput('')
                  }
                }}
              >
                + Add
              </Button>
            </div>
            {taskSubtasks.map((st, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  marginBottom: '4px',
                }}
              >
                <span>{st}</span>
                <button
                  type="button"
                  onClick={() => setTaskSubtasks(taskSubtasks.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* 2. HABIT MODAL */}
      <Modal
        isOpen={modal.type === 'habit'}
        onClose={closeModal}
        title="Create New Habit"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleHabitSubmit}>
              Save Habit
            </Button>
          </>
        }
      >
        <form onSubmit={handleHabitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Habit Name *"
            autoFocus
            placeholder="e.g. 90-Minute Deep Work Block"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
          />

          <Textarea
            label="Description / Anchor trigger"
            placeholder="e.g. Right after morning cold brew, phone on Do Not Disturb"
            value={habitDesc}
            onChange={(e) => setHabitDesc(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Frequency"
              value={habitFreq}
              onChange={(e) => setHabitFreq(e.target.value as HabitFrequency)}
              options={[
                { value: 'daily', label: 'Daily (7 days / week)' },
                { value: 'weekdays', label: 'Weekdays (Mon - Fri)' },
                { value: 'weekends', label: 'Weekends (Sat - Sun)' },
                { value: 'weekly', label: 'Weekly' },
              ]}
            />
            <Select
              label="Time of Day"
              value={habitTimeOfDay}
              onChange={(e) => setHabitTimeOfDay(e.target.value as HabitTimeOfDay)}
              options={[
                { value: 'morning', label: 'Morning' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening' },
                { value: 'anytime', label: 'Anytime' },
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Category"
              value={habitCategory}
              onChange={(e) => setHabitCategory(e.target.value)}
              options={[
                { value: 'productivity', label: 'Productivity' },
                { value: 'wellness', label: 'Wellness' },
                { value: 'fitness', label: 'Fitness' },
                { value: 'learning', label: 'Learning' },
                { value: 'mindset', label: 'Mindset' },
              ]}
            />
            <Select
              label="Accent Color"
              value={habitColor}
              onChange={(e) => setHabitColor(e.target.value)}
              options={[
                { value: 'blue', label: 'Blue' },
                { value: 'emerald', label: 'Emerald' },
                { value: 'amber', label: 'Amber' },
                { value: 'purple', label: 'Purple' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* 3. WATER MODAL */}
      <Modal
        isOpen={modal.type === 'water'}
        onClose={closeModal}
        title="Log Water Intake"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleWaterSubmit}>
              Log Intake
            </Button>
          </>
        }
      >
        <form onSubmit={handleWaterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-accent)' }}>
              +{waterAmount} ml
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Container: {waterContainer}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { amount: 250, label: 'Glass (250ml)' },
              { amount: 350, label: 'Mug (350ml)' },
              { amount: 500, label: 'Bottle (500ml)' },
              { amount: 750, label: 'Flask (750ml)' },
            ].map((item) => (
              <button
                key={item.amount}
                type="button"
                onClick={() => {
                  setWaterAmount(item.amount)
                  setWaterContainer(item.label.split(' ')[0])
                }}
                style={{
                  padding: '10px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: waterAmount === item.amount ? '2px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                  background: waterAmount === item.amount ? 'var(--color-accent-subtle)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Input
            label="Custom Amount (ml)"
            type="number"
            value={waterAmount}
            onChange={(e) => setWaterAmount(Number(e.target.value))}
          />
        </form>
      </Modal>

      {/* 4. SUPPLEMENT MODAL */}
      <Modal
        isOpen={modal.type === 'supplement'}
        onClose={closeModal}
        title="Add Supplement / Vitamin"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSupplementSubmit}>
              Save Supplement
            </Button>
          </>
        }
      >
        <form onSubmit={handleSupplementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Supplement Name *"
            autoFocus
            placeholder="e.g. Magnesium Glycinate"
            value={supName}
            onChange={(e) => setSupName(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Dosage"
              placeholder="e.g. 400"
              value={supDosage}
              onChange={(e) => setSupDosage(e.target.value)}
            />
            <Select
              label="Unit"
              value={supUnit}
              onChange={(e) => setSupUnit(e.target.value)}
              options={[
                { value: 'mg', label: 'mg' },
                { value: 'g', label: 'g' },
                { value: 'IU', label: 'IU' },
                { value: 'mcg', label: 'mcg' },
                { value: 'capsule', label: 'capsule' },
                { value: 'scoop', label: 'scoop' },
                { value: 'drops', label: 'drops' },
              ]}
            />
          </div>

          <Select
            label="Timing Schedule"
            value={supTiming}
            onChange={(e) => setSupTiming(e.target.value as SupplementTiming)}
            options={[
              { value: 'morning', label: 'Morning (with breakfast)' },
              { value: 'noon', label: 'Noon / Lunch' },
              { value: 'evening', label: 'Evening / Post Workout' },
              { value: 'bedtime', label: 'Bedtime (before sleep)' },
              { value: 'with-meal', label: 'With Any Meal' },
            ]}
          />

          <Textarea
            label="Instructions & Notes"
            placeholder="e.g. Take with healthy fats for enhanced absorption"
            value={supNotes}
            onChange={(e) => setSupNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* 5. WORKOUT MODAL */}
      <Modal
        isOpen={modal.type === 'workout'}
        onClose={closeModal}
        title="Log Workout & Review"
        maxWidth="520px"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleWorkoutSubmit}>
              Log & Save Review
            </Button>
          </>
        }
      >
        <form onSubmit={handleWorkoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Session Title *"
            autoFocus
            placeholder="e.g. Upper Body Hypertrophy or Football Match"
            value={woTitle}
            onChange={(e) => setWoTitle(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Workout / Activity Type"
              value={woSportActivity || woType}
              onChange={(e) => {
                const val = e.target.value
                const sports = ['Football', 'Badminton', 'Cricket / Net Practice', 'Walking', 'Running', 'Cycling', 'Stretching', 'Mobility']
                if (sports.includes(val)) {
                  setWoSportActivity(val)
                  setWoType(val === 'Walking' || val === 'Stretching' || val === 'Mobility' ? 'recovery' : val === 'Running' || val === 'Cycling' ? 'cardio' : 'sports')
                  setWoMuscles(val)
                } else {
                  setWoSportActivity('')
                  setWoType(val)
                }
              }}
              options={[
                { value: 'strength', label: '🏋️ Strength / Gym Split' },
                { value: 'Football', label: '⚽ Football' },
                { value: 'Badminton', label: '🏸 Badminton' },
                { value: 'Cricket / Net Practice', label: '🏏 Cricket / Net Practice' },
                { value: 'Walking', label: '🚶 Walking / Active Recovery' },
                { value: 'Running', label: '🏃 Running' },
                { value: 'Cycling', label: '🚴 Cycling' },
                { value: 'Stretching', label: '🧘 Stretching' },
                { value: 'Mobility', label: '🤸 Mobility Flow' },
                { value: 'cardio', label: 'Cardio / Other' },
                { value: 'sports', label: 'Other Sports / Custom' },
              ]}
            />
            <Input
              label="Duration (minutes)"
              type="number"
              value={woDuration}
              onChange={(e) => setWoDuration(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Target Focus / Muscles"
              placeholder="e.g. Chest, Legs, Full Body"
              value={woMuscles}
              onChange={(e) => setWoMuscles(e.target.value)}
            />
            <Input
              label="Distance (km, optional)"
              type="number"
              step="0.1"
              placeholder="e.g. 5.2"
              value={woDistance === 0 ? '' : woDistance}
              onChange={(e) => setWoDistance(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Rating */}
          <div className="field">
            <label className="field__label">Session Rating (1–5 Stars)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setWoRating(star)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 'var(--r-sm)',
                    background: woRating >= star ? 'var(--text-primary)' : 'var(--bg-white)',
                    color: woRating >= star ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: woRating >= star ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  ★ {star}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div className="field">
            <label className="field__label">Energy Level (1–5)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setWoEnergy(lvl)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 'var(--r-sm)',
                    background: woEnergy === lvl ? 'var(--text-primary)' : 'var(--bg-white)',
                    color: woEnergy === lvl ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: woEnergy === lvl ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              <span>Exhausted</span>
              <span>Peak</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="field">
            <label className="field__label">Difficulty (1–5)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([1, 2, 3, 4, 5] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setWoDifficulty(lvl)}
                  style={{
                    flex: 1,
                    padding: '7px 0',
                    borderRadius: 'var(--r-sm)',
                    background: woDifficulty === lvl ? 'var(--text-primary)' : 'var(--bg-white)',
                    color: woDifficulty === lvl ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: woDifficulty === lvl ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 'var(--text-xs)',
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              <span>Very Easy</span>
              <span>Max Effort</span>
            </div>
          </div>

          {/* Reflection */}
          <Textarea
            label="“How did I feel?” Reflection"
            placeholder="Reflect on your physical sensations, mindset, clarity, recovery needs..."
            value={woReflection}
            onChange={(e) => setWoReflection(e.target.value)}
          />

          {/* Notes */}
          <Textarea
            label="Session Notes (optional)"
            placeholder="Gear, conditions, drills, or sets notes..."
            value={woNotes}
            onChange={(e) => setWoNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* 6. SELF-CARE MODAL */}
      <Modal
        isOpen={modal.type === 'selfcare'}
        onClose={closeModal}
        title="Add Self-Care Routine"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSelfCareSubmit}>
              Save Routine
            </Button>
          </>
        }
      >
        <form onSubmit={handleSelfCareSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Routine Title *"
            autoFocus
            placeholder="e.g. Haircare & Scalp Treatment"
            value={scTitle}
            onChange={(e) => setScTitle(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Category"
              value={scCategory}
              onChange={(e) => setScCategory(e.target.value)}
              options={[
                { value: 'skincare', label: 'Skincare' },
                { value: 'haircare', label: 'Haircare' },
                { value: 'hygiene', label: 'Hygiene & Bath' },
                { value: 'grooming', label: 'Grooming' },
                { value: 'body', label: 'Body & Mobility' },
              ]}
            />
            <Select
              label="Frequency"
              value={scFreq}
              onChange={(e) => setScFreq(e.target.value)}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'alternate', label: 'Alternate Days' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
          </div>

          <Select
            label="Time of Day"
            value={scTimeOfDay}
            onChange={(e) => setScTimeOfDay(e.target.value)}
            options={[
              { value: 'morning', label: 'Morning' },
              { value: 'evening', label: 'Evening' },
              { value: 'night', label: 'Night' },
              { value: 'anytime', label: 'Anytime' },
            ]}
          />

          <Textarea
            label="Routine Steps / Products"
            placeholder="e.g. Cleanser, Hyaluronic Serum, Moisturizer, SPF 50"
            value={scDesc}
            onChange={(e) => setScDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* 7. ACADEMIC: SUBJECT MODAL */}
      <Modal
        isOpen={modal.type === 'subject'}
        onClose={closeModal}
        title="Add Academic Subject"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubjectSubmit}>
              Add Subject
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Course Code *"
              autoFocus
              placeholder="e.g. CS 401"
              value={subjCode}
              onChange={(e) => setSubjCode(e.target.value)}
            />
            <Input
              label="Subject Name *"
              placeholder="e.g. Distributed Systems & Cloud Computing"
              value={subjName}
              onChange={(e) => setSubjName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Professor / Instructor"
              placeholder="e.g. Prof. David Chen"
              value={subjProf}
              onChange={(e) => setSubjProf(e.target.value)}
            />
            <Input
              label="Semester"
              placeholder="e.g. Semester 5"
              value={subjSem}
              onChange={(e) => setSubjSem(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* 8. ACADEMIC: LECTURE SHEET MODAL */}
      <Modal
        isOpen={modal.type === 'lecture_sheet'}
        onClose={closeModal}
        title="Add Lecture Sheet"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLectureSheetSubmit}>
              Add Lecture Sheet
            </Button>
          </>
        }
      >
        <form onSubmit={handleLectureSheetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject: Choose existing or Fill new */}
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="field__label" style={{ marginBottom: 0 }}>
                {sheetSubjectMode === 'new' || academics.length === 0 ? 'Subject Details *' : 'Select Subject *'}
              </label>
              {academics.length > 0 && (
                <button
                  type="button"
                  className="btn btn--xs btn--ghost"
                  onClick={() => {
                    const nextMode = sheetSubjectMode === 'choose' ? 'new' : 'choose'
                    setSheetSubjectMode(nextMode)
                    if (nextMode === 'choose' && !sheetSubjId) {
                      setSheetSubjId(academics[0].id)
                    }
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--r-xs)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {sheetSubjectMode === 'choose' ? '+ Fill New Subject' : '← Choose Existing Subject'}
                </button>
              )}
            </div>

            {sheetSubjectMode === 'new' || academics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <Input
                    label="Code *"
                    placeholder="e.g. CS 401"
                    value={sheetNewSubjCode}
                    onChange={(e) => setSheetNewSubjCode(e.target.value)}
                  />
                  <Input
                    label="Subject Name *"
                    placeholder="e.g. Distributed Systems"
                    value={sheetNewSubjName}
                    onChange={(e) => setSheetNewSubjName(e.target.value)}
                  />
                </div>
                {academics.length === 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    No subjects registered yet — entering details above will create the subject automatically.
                  </div>
                )}
              </div>
            ) : (
              <div className="input-wrap">
                <select
                  className="select-input input"
                  style={{ position: 'relative', zIndex: 1 }}
                  value={sheetSubjId || academics[0]?.id || ''}
                  onChange={(e) => {
                    const newId = e.target.value
                    setSheetSubjId(newId)
                    const subj = academics.find((s) => s.id === newId)
                    if (subj) {
                      setSheetNumber(subj.lectureSheets.length + 1)
                    }
                  }}
                >
                  {academics.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
                <span className="input-wrap__right">
                  <ChevronDown size={14} />
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '12px' }}>
            <Input
              label="Sheet #"
              type="number"
              value={sheetNumber}
              onChange={(e) => setSheetNumber(Number(e.target.value))}
            />
            <Input
              label="Lecture Topic / Title *"
              autoFocus
              placeholder="e.g. Raft Consensus Protocol & Invariants"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
            />
          </div>

          <Textarea
            label="Notes / Key Concepts"
            placeholder="Key points to revise or homework problems..."
            value={sheetNotes}
            onChange={(e) => setSheetNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* 9. ACADEMIC: LAB SHEET MODAL */}
      <Modal
        isOpen={modal.type === 'lab_sheet'}
        onClose={closeModal}
        title="Add Lab Sheet"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLabSheetSubmit}>
              Add Lab Sheet
            </Button>
          </>
        }
      >
        <form onSubmit={handleLabSheetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject: Choose existing or Fill new */}
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="field__label" style={{ marginBottom: 0 }}>
                {sheetSubjectMode === 'new' || academics.length === 0 ? 'Subject Details *' : 'Select Subject *'}
              </label>
              {academics.length > 0 && (
                <button
                  type="button"
                  className="btn btn--xs btn--ghost"
                  onClick={() => {
                    const nextMode = sheetSubjectMode === 'choose' ? 'new' : 'choose'
                    setSheetSubjectMode(nextMode)
                    if (nextMode === 'choose' && !sheetSubjId) {
                      setSheetSubjId(academics[0].id)
                    }
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--r-xs)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {sheetSubjectMode === 'choose' ? '+ Fill New Subject' : '← Choose Existing Subject'}
                </button>
              )}
            </div>

            {sheetSubjectMode === 'new' || academics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <Input
                    label="Code *"
                    placeholder="e.g. CS 401"
                    value={sheetNewSubjCode}
                    onChange={(e) => setSheetNewSubjCode(e.target.value)}
                  />
                  <Input
                    label="Subject Name *"
                    placeholder="e.g. Distributed Systems"
                    value={sheetNewSubjName}
                    onChange={(e) => setSheetNewSubjName(e.target.value)}
                  />
                </div>
                {academics.length === 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    No subjects registered yet — entering details above will create the subject automatically.
                  </div>
                )}
              </div>
            ) : (
              <div className="input-wrap">
                <select
                  className="select-input input"
                  style={{ position: 'relative', zIndex: 1 }}
                  value={sheetSubjId || academics[0]?.id || ''}
                  onChange={(e) => {
                    const newId = e.target.value
                    setSheetSubjId(newId)
                    const subj = academics.find((s) => s.id === newId)
                    if (subj) {
                      setSheetNumber(subj.labSheets.length + 1)
                    }
                  }}
                >
                  {academics.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
                <span className="input-wrap__right">
                  <ChevronDown size={14} />
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '12px' }}>
            <Input
              label="Lab #"
              type="number"
              value={sheetNumber}
              onChange={(e) => setSheetNumber(Number(e.target.value))}
            />
            <Input
              label="Lab Topic / Title *"
              autoFocus
              placeholder="e.g. Building Raft Key-Value Store Part A"
              value={sheetTitle}
              onChange={(e) => setSheetTitle(e.target.value)}
            />
          </div>

          <Textarea
            label="Instructions & Submission Notes"
            placeholder="Code repository link, test cases, deadlines..."
            value={sheetNotes}
            onChange={(e) => setSheetNotes(e.target.value)}
          />
        </form>
      </Modal>

      {/* 10. ACADEMIC: ASSIGNMENT MODAL */}
      <Modal
        isOpen={modal.type === 'assignment'}
        onClose={closeModal}
        title="Add Assignment"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAssignmentSubmit}>
              Add Assignment
            </Button>
          </>
        }
      >
        <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Subject: Choose existing or Fill new */}
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="field__label" style={{ marginBottom: 0 }}>
                {sheetSubjectMode === 'new' || academics.length === 0 ? 'Subject Details *' : 'Select Subject *'}
              </label>
              {academics.length > 0 && (
                <button
                  type="button"
                  className="btn btn--xs btn--ghost"
                  onClick={() => {
                    const nextMode = sheetSubjectMode === 'choose' ? 'new' : 'choose'
                    setSheetSubjectMode(nextMode)
                    if (nextMode === 'choose' && !sheetSubjId) {
                      setSheetSubjId(academics[0].id)
                    }
                  }}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    color: 'var(--color-accent)',
                    cursor: 'pointer',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--r-xs)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {sheetSubjectMode === 'choose' ? '+ Fill New Subject' : '← Choose Existing Subject'}
                </button>
              )}
            </div>

            {sheetSubjectMode === 'new' || academics.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                  <Input
                    label="Code *"
                    placeholder="e.g. CS 401"
                    value={sheetNewSubjCode}
                    onChange={(e) => setSheetNewSubjCode(e.target.value)}
                  />
                  <Input
                    label="Subject Name *"
                    placeholder="e.g. Distributed Systems"
                    value={sheetNewSubjName}
                    onChange={(e) => setSheetNewSubjName(e.target.value)}
                  />
                </div>
                {academics.length === 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    No subjects registered yet — entering details above will create the subject automatically.
                  </div>
                )}
              </div>
            ) : (
              <div className="input-wrap">
                <select
                  className="select-input input"
                  style={{ position: 'relative', zIndex: 1 }}
                  value={sheetSubjId || academics[0]?.id || ''}
                  onChange={(e) => setSheetSubjId(e.target.value)}
                >
                  {academics.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code}: {s.name}
                    </option>
                  ))}
                </select>
                <span className="input-wrap__right">
                  <ChevronDown size={14} />
                </span>
              </div>
            )}
          </div>

          <Input
            label="Assignment Title *"
            autoFocus
            placeholder="e.g. Problem Set 2: SVD & Matrix Compression"
            value={asTitle}
            onChange={(e) => setAsTitle(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Due Date"
              type="date"
              value={asDate}
              onChange={(e) => setAsDate(e.target.value)}
            />
            <Input
              label="Grade Weight (%)"
              type="number"
              value={asWeight}
              onChange={(e) => setAsWeight(Number(e.target.value))}
            />
          </div>
        </form>
      </Modal>

      {/* 11. GOAL MODAL */}
      <Modal
        isOpen={modal.type === 'goal'}
        onClose={closeModal}
        title="Create New Goal"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGoalSubmit}>
              Create Goal
            </Button>
          </>
        }
      >
        <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Goal Title *"
            autoFocus
            placeholder="e.g. Achieve 3.9+ GPA in Semester 5"
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Goal Category"
              value={goalCategory}
              onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
              options={[
                { value: 'semester', label: 'Semester' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'subject', label: 'Subject' },
                { value: 'career', label: 'Career' },
                { value: 'personal', label: 'Personal' },
                { value: 'habit', label: 'Habit' },
              ]}
            />
            <Input
              label="Target Deadline"
              type="date"
              value={goalDate}
              onChange={(e) => setGoalDate(e.target.value)}
            />
          </div>

          <Textarea
            label="Description & Success Metrics"
            placeholder="Why is this important and how will success be measured?"
            value={goalDesc}
            onChange={(e) => setGoalDesc(e.target.value)}
          />

          <div className="field">
            <label className="field-label">Key Milestones</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="Add measurable milestone..."
                value={gmInput}
                onChange={(e) => setGmInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (gmInput.trim()) {
                      setGoalMilestones([...goalMilestones, gmInput.trim()])
                      setGmInput('')
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (gmInput.trim()) {
                    setGoalMilestones([...goalMilestones, gmInput.trim()])
                    setGmInput('')
                  }
                }}
              >
                + Add
              </Button>
            </div>
            {goalMilestones.map((gm, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  marginBottom: '4px',
                }}
              >
                <span>{gm}</span>
                <button
                  type="button"
                  onClick={() => setGoalMilestones(goalMilestones.filter((_, i) => i !== idx))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </form>
      </Modal>

      {/* 12. CAREER: ROADMAP MODAL */}
      <Modal
        isOpen={modal.type === 'career_roadmap'}
        onClose={closeModal}
        title="Add Career Roadmap"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRoadmapSubmit}>
              Create Roadmap
            </Button>
          </>
        }
      >
        <form onSubmit={handleRoadmapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Roadmap Title *"
            autoFocus
            placeholder="e.g. AI / Machine Learning Engineering"
            value={crTitle}
            onChange={(e) => setCrTitle(e.target.value)}
          />

          <Input
            label="Target Professional Role"
            placeholder="e.g. Senior Machine Learning Systems Engineer"
            value={crTargetRole}
            onChange={(e) => setCrTargetRole(e.target.value)}
          />

          <Textarea
            label="Roadmap Description & Scope"
            placeholder="Key focus areas, core skills to master, and portfolio targets..."
            value={crDesc}
            onChange={(e) => setCrDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* 13. CAREER: SKILL MODAL */}
      <Modal
        isOpen={modal.type === 'career_skill'}
        onClose={closeModal}
        title="Add Career Skill"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSkillSubmit}>
              Add Skill
            </Button>
          </>
        }
      >
        <form onSubmit={handleSkillSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Career Roadmap *"
            value={skillRoadmapId}
            onChange={(e) => setSkillRoadmapId(e.target.value)}
            options={careerRoadmaps.map((r) => ({ value: r.id, label: r.title }))}
          />

          <Input
            label="Skill Name *"
            autoFocus
            placeholder="e.g. PyTorch & Neural Architectures"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />

          <Select
            label="Current Proficiency"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            options={[
              { value: 'beginner', label: 'Beginner (Learning basics)' },
              { value: 'intermediate', label: 'Intermediate (Built projects)' },
              { value: 'advanced', label: 'Advanced (Deep expertise)' },
              { value: 'master', label: 'Master (Production-grade authority)' },
            ]}
          />
        </form>
      </Modal>

      {/* 14. CAREER: PROJECT MODAL */}
      <Modal
        isOpen={modal.type === 'career_project'}
        onClose={closeModal}
        title="Add Career Project"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleProjectSubmit}>
              Add Project
            </Button>
          </>
        }
      >
        <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Career Roadmap *"
            value={projRoadmapId}
            onChange={(e) => setProjRoadmapId(e.target.value)}
            options={careerRoadmaps.map((r) => ({ value: r.id, label: r.title }))}
          />

          <Input
            label="Project Title *"
            autoFocus
            placeholder="e.g. Local Latency-Optimized RAG Engine"
            value={projTitle}
            onChange={(e) => setProjTitle(e.target.value)}
          />

          <Input
            label="Tech Stack (comma separated)"
            placeholder="PyTorch, Qdrant, FastAPI, Rust"
            value={projTech}
            onChange={(e) => setProjTech(e.target.value)}
          />

          <Textarea
            label="Project Description & Highlights"
            placeholder="Key architectural feats and what makes it showcase-worthy..."
            value={projDesc}
            onChange={(e) => setProjDesc(e.target.value)}
          />
        </form>
      </Modal>

      {/* 15. HOBBIES MODAL */}
      <Modal
        isOpen={modal.type === 'hobby'}
        onClose={closeModal}
        title="Add New Hobby / Craft"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleHobbySubmit}>
              Save Hobby
            </Button>
          </>
        }
      >
        <form onSubmit={handleHobbySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Hobby Name *"
            autoFocus
            placeholder="e.g. Acoustic & Electric Guitar"
            value={hobName}
            onChange={(e) => setHobName(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Category"
              placeholder="e.g. Music, Strategy, Art"
              value={hobCat}
              onChange={(e) => setHobCat(e.target.value)}
            />
            <Input
              label="Target Frequency"
              placeholder="e.g. 4x / week"
              value={hobFreq}
              onChange={(e) => setHobFreq(e.target.value)}
            />
          </div>

          <Input
            label="Weekly Target Time (minutes)"
            type="number"
            value={hobMins}
            onChange={(e) => setHobMins(Number(e.target.value))}
          />
        </form>
      </Modal>
    </>
  )
}
