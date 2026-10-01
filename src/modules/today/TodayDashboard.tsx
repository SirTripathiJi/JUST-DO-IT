import React, { useState } from 'react'
import {
  CheckSquare,
  Flame,
  Clock,
  Dumbbell,
  Droplets,
  Pill,
  HeartHandshake,
  GraduationCap,
  Target,
  Plus,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Checkbox } from '../../components/ui/Checkbox'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { EmptyState } from '../../components/ui/EmptyState'
import { LiveClock } from '../../components/ui/LiveClock'

export const TodayDashboard: React.FC = () => {
  const {
    profile,
    updateDailyFocus,
    tasks,
    toggleTask,
    habits,
    toggleHabit,
    schedule,
    toggleScheduleItem,
    workouts,
    waterLog,
    logWater,
    supplements,
    toggleSupplement,
    selfCareRoutines,
    toggleSelfCareRoutine,
    academics,
    toggleLectureSheet,
    toggleLabSheet,
    goals,
    toggleGoalMilestone,
    careerRoadmaps,
    toggleCareerMilestone,
    inspirationImages,
    openModal,
    setActiveModule,
    metrics,
  } = useApp()

  const todayStr = getTodayDateString()
  const [isEditingFocus, setIsEditingFocus] = useState(false)
  const [focusDraft, setFocusDraft] = useState(profile.dailyFocus)

  // Progressive disclosure: collapsed state for sections
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    tasks: false,
    habits: false,
    schedule: false,
    workout: false,
    water: false,
    supplements: false,
    selfcare: false,
    academics: false,
    goals: false,
    inspiration: false,
  })

  const toggleCollapse = (section: string) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // 1. Important tasks today (sorted: urgent/high first, then incomplete)
  const todayTasks = tasks
    .filter((t) => !t.dueDate || t.dueDate === todayStr)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const pMap: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
      return (pMap[a.priority] ?? 2) - (pMap[b.priority] ?? 2)
    })

  // 2. Habits
  const activeHabits = habits.filter((h) => !h.isArchived)
  const doneHabits = activeHabits.filter((h) => !!h.completions[todayStr]).length

  // 3. Scheduled Activities
  const todaySchedule = schedule
    .filter((s) => !s.date || s.date === todayStr)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))

  // 4. Workout
  const todayWorkouts = workouts.filter((w) => w.date === todayStr || !w.date)
  const latestWorkout = todayWorkouts[0] || workouts[0]

  // 5. Water
  const waterPct = metrics.waterPercentage

  // 6. Supplements
  const pendingSupplements = supplements.filter((s) => !s.takenToday).length

  // 7. Self-Care
  const pendingSelfCare = selfCareRoutines.filter((r) => !r.completedToday && !r.history[todayStr]).length

  // 8. Academic Sheets
  const academicItems: {
    subjectId: string
    subjectCode: string
    subjectName: string
    type: 'lecture' | 'lab'
    id: string
    title: string
    completed: boolean
  }[] = []

  academics.forEach((subj) => {
    subj.lectureSheets.slice(0, 3).forEach((ls) => {
      academicItems.push({
        subjectId: subj.id,
        subjectCode: subj.code,
        subjectName: subj.name,
        type: 'lecture',
        id: ls.id,
        title: `Sheet #${ls.number}: ${ls.title}`,
        completed: ls.completed,
      })
    })
    subj.labSheets.slice(0, 2).forEach((lab) => {
      academicItems.push({
        subjectId: subj.id,
        subjectCode: subj.code,
        subjectName: subj.name,
        type: 'lab',
        id: lab.id,
        title: `Lab #${lab.number}: ${lab.title}`,
        completed: lab.completed,
      })
    })
  })

  // 9. In-progress Goals & Career Milestones
  const activeMilestones: {
    id: string
    parentId: string
    parentTitle: string
    title: string
    isCompleted: boolean
    type: 'goal' | 'career'
  }[] = []

  goals.forEach((g) => {
    g.milestones.slice(0, 2).forEach((m) => {
      activeMilestones.push({
        id: m.id,
        parentId: g.id,
        parentTitle: g.title,
        title: m.title,
        isCompleted: m.completed,
        type: 'goal',
      })
    })
  })

  careerRoadmaps.forEach((r) => {
    r.milestones.slice(0, 2).forEach((m) => {
      activeMilestones.push({
        id: m.id,
        parentId: r.id,
        parentTitle: r.title,
        title: m.title,
        isCompleted: m.completed,
        type: 'career',
      })
    })
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile.name ? profile.name.split(' ')[0] : 'there'

  const fullDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const handleSaveFocus = () => {
    if (focusDraft.trim()) updateDailyFocus(focusDraft.trim())
    setIsEditingFocus(false)
  }

  const pendingTasks = todayTasks.filter((t) => !t.completed).length

  return (
    <div className="animate-in">
      {/* ── HERO BLOCK ─────────────────────────────────────────────────── */}
      <div className="today-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="today-hero__eyebrow">
              <span>{fullDate}</span>
              {profile.semester && (
                <span style={{ color: 'var(--text-tertiary)' }}>· {profile.semester}</span>
              )}
            </div>

            <h1 className="today-hero__greeting">
              {greeting}, {firstName}.
            </h1>
          </div>

          <LiveClock />
        </div>

        {/* Daily Anchor — inline editable focus */}
        <div
          className="today-anchor"
          onClick={() => {
            if (!isEditingFocus) {
              setFocusDraft(profile.dailyFocus)
              setIsEditingFocus(true)
            }
          }}
        >
          <span className="today-anchor__label">Daily Focus</span>

          {isEditingFocus ? (
            <input
              autoFocus
              className="today-anchor__input"
              type="text"
              value={focusDraft}
              placeholder="What is your #1 priority today?"
              onChange={(e) => setFocusDraft(e.target.value)}
              onBlur={handleSaveFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveFocus()
                if (e.key === 'Escape') setIsEditingFocus(false)
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="today-anchor__text">
              {profile.dailyFocus || (
                <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Click to set your daily anchor or main focus...
                </span>
              )}
            </span>
          )}

          <button
            className="today-anchor__edit"
            onClick={(e) => {
              e.stopPropagation()
              if (isEditingFocus) handleSaveFocus()
              else {
                setFocusDraft(profile.dailyFocus)
                setIsEditingFocus(true)
              }
            }}
          >
            {isEditingFocus ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {/* ── VITALS STRIP ───────────────────────────────────────────────── */}
      <div className="vitals-strip" style={{ marginBottom: '32px' }}>
        <button
          className="vital-stat"
          onClick={() => setActiveModule('tasks')}
          style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
        >
          <div>
            <span className="vital-stat__label">Tasks</span>
            <span className="vital-stat__num">
              {metrics.tasksCompleted}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                /{metrics.totalTasks}
              </span>
            </span>
          </div>
        </button>

        <button
          className="vital-stat"
          onClick={() => setActiveModule('habits')}
          style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
        >
          <div>
            <span className="vital-stat__label">Habits</span>
            <span className="vital-stat__num">
              {doneHabits}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                /{activeHabits.length}
              </span>
            </span>
          </div>
        </button>

        <button
          className="vital-stat"
          onClick={() => setActiveModule('calendar')}
          style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
        >
          <div>
            <span className="vital-stat__label">Agenda</span>
            <span className="vital-stat__num">
              {todaySchedule.filter((s) => s.isCompleted).length}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                /{todaySchedule.length}
              </span>
            </span>
          </div>
        </button>

        <button
          className="vital-stat"
          onClick={() => setActiveModule('water')}
          style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
        >
          <div>
            <span className="vital-stat__label">Hydration</span>
            <span className="vital-stat__num">
              {waterPct}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}>%</span>
            </span>
            <span className="vital-stat__sub">{waterLog.currentMl} / {waterLog.targetMl} ml</span>
          </div>
        </button>

        <button
          className="vital-stat"
          onClick={() => setActiveModule('supplements')}
          style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
        >
          <div>
            <span className="vital-stat__label">Supplements</span>
            <span className="vital-stat__num">
              {metrics.supplementsTakenToday}
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}>
                /{metrics.totalSupplements}
              </span>
            </span>
          </div>
        </button>
      </div>

      {/* ── MAIN WORKSPACE GRID ────────────────────────────────────────── */}
      <div className="workspace-grid">
        {/* ══ LEFT COLUMN: Action Items (Tasks, Habits, Agenda) ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* 1. TODAY'S IMPORTANT TASKS */}
          <div className="section">
            <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('tasks')}>
              <span className="section-title">
                <CheckSquare size={14} strokeWidth={2} />
                Important Tasks
                {pendingTasks > 0 && (
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                    — {pendingTasks} remaining
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => openModal('task')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
                >
                  <Plus size={12} /> Add Task
                </button>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => toggleCollapse('tasks')}
                  aria-label="Toggle tasks section"
                >
                  {collapsed.tasks ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {!collapsed.tasks && (
              <>
                {todayTasks.length === 0 ? (
                  <EmptyState
                    compact
                    title="No tasks scheduled for today"
                    description="Keep your momentum going by creating your top 3 daily priorities."
                    actionLabel="+ Add Task"
                    onAction={() => openModal('task')}
                  />
                ) : (
                  <div className="task-list">
                    {todayTasks.map((task) => (
                      <div key={task.id} className={`task-row ${task.completed ? 'task-row--done' : ''}`}>
                        <div style={{ marginTop: '2px' }}>
                          <Checkbox checked={task.completed} onChange={() => toggleTask(task.id)} />
                        </div>
                        <div className="task-row__content">
                          <div className="task-row__title">{task.title}</div>
                          {(task.description || task.dueTime) && (
                            <div className="task-row__meta">
                              {task.dueTime && <span className="task-row__time">{task.dueTime}</span>}
                              {task.description && (
                                <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>
                                  {task.description}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {task.priority === 'urgent' && <Badge variant="red">Urgent</Badge>}
                        {task.priority === 'high' && <Badge variant="amber">High</Badge>}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ paddingTop: '8px' }}>
                  <button
                    onClick={() => setActiveModule('tasks')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    View all tasks <ChevronRight size={11} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 2. HABITS */}
          <div className="section">
            <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('habits')}>
              <span className="section-title">
                <Flame size={14} strokeWidth={2} />
                Daily Habits
                {activeHabits.length > 0 && (
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                    — {doneHabits}/{activeHabits.length} done
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => openModal('habit')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
                >
                  <Plus size={12} /> Add Habit
                </button>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => toggleCollapse('habits')}
                  aria-label="Toggle habits section"
                >
                  {collapsed.habits ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {!collapsed.habits && (
              <>
                {activeHabits.length === 0 ? (
                  <EmptyState
                    compact
                    title="No habits established yet"
                    description="Consistency builds mastery. Form your first atomic daily routine."
                    actionLabel="+ Add Habit"
                    onAction={() => openModal('habit')}
                  />
                ) : (
                  <div className="habit-list">
                    {activeHabits.map((habit) => {
                      const isDone = !!habit.completions[todayStr]
                      return (
                        <div key={habit.id} className={`habit-row ${isDone ? 'habit-row--done' : ''}`}>
                          <Checkbox checked={isDone} onChange={() => toggleHabit(habit.id, todayStr)} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              className="habit-row__name"
                              style={{
                                textDecoration: isDone ? 'line-through' : 'none',
                                textDecorationColor: 'var(--border-hover)',
                              }}
                            >
                              {habit.title}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                              {habit.timeOfDay || 'Anytime'} · {habit.frequency}
                            </div>
                          </div>
                          {habit.currentStreak > 0 && (
                            <span className="habit-row__streak">{habit.currentStreak}d</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ paddingTop: '8px' }}>
                  <button
                    onClick={() => setActiveModule('habits')}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    Manage all habits <ChevronRight size={11} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 3. SCHEDULED ACTIVITIES */}
          <div className="section">
            <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('schedule')}>
              <span className="section-title">
                <Clock size={14} strokeWidth={2} />
                Scheduled Agenda
                {todaySchedule.length > 0 && (
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                    — {todaySchedule.length} events
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => setActiveModule('calendar')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
                >
                  <CalendarIcon size={12} /> Calendar
                </button>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => toggleCollapse('schedule')}
                  aria-label="Toggle schedule section"
                >
                  {collapsed.schedule ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {!collapsed.schedule && (
              <>
                {todaySchedule.length === 0 ? (
                  <EmptyState
                    compact
                    title="No calendar events scheduled"
                    description="Block time on your calendar for lectures, deep work, and workouts."
                    actionLabel="Open Calendar"
                    onAction={() => setActiveModule('calendar')}
                  />
                ) : (
                  <div className="task-list">
                    {todaySchedule.map((item) => (
                      <div key={item.id} className={`task-row ${item.isCompleted ? 'task-row--done' : ''}`}>
                        <Checkbox checked={item.isCompleted} onChange={() => toggleScheduleItem(item.id)} />
                        <div className="task-row__content">
                          <div className="task-row__title">{item.title}</div>
                          <div className="task-row__meta">
                            <span>{item.startTime} - {item.endTime}</span>
                            {item.location && <span>· {item.location}</span>}
                            <span style={{ textTransform: 'capitalize' }}>· {item.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* 3.5. INSPIRATION PREVIEW */}
          <div className="section">
            <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('inspiration')}>
              <span className="section-title">
                <ImageIcon size={14} strokeWidth={2} />
                Inspiration Board
                {inspirationImages.length > 0 && (
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                    — {inspirationImages.filter((img) => img.pinned).length > 0
                        ? `${inspirationImages.filter((img) => img.pinned).length} pinned`
                        : `${inspirationImages.length} images`}
                  </span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => setActiveModule('inspiration')}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
                >
                  Open Board <ChevronRight size={12} />
                </button>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => toggleCollapse('inspiration')}
                  aria-label="Toggle inspiration section"
                >
                  {collapsed.inspiration ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {!collapsed.inspiration && (
              <>
                {inspirationImages.length === 0 ? (
                  <EmptyState
                    compact
                    title="No inspiration images added yet"
                    description="Upload visual references, moodboards, and aesthetics to your personal board."
                    actionLabel="Open Inspiration"
                    onAction={() => setActiveModule('inspiration')}
                  />
                ) : (
                  <div className="inspiration-preview-section">
                    <div className="inspiration-preview-strip">
                      {(inspirationImages.filter((img) => img.pinned).length > 0
                        ? inspirationImages.filter((img) => img.pinned)
                        : inspirationImages.slice(0, 6)
                      ).map((img) => (
                        <div
                          key={img.id}
                          className="inspiration-preview-thumb"
                          onClick={() => setActiveModule('inspiration')}
                          title={img.title || 'Inspiration image'}
                        >
                          <img
                            src={img.imageData}
                            alt={img.title || 'Inspiration thumbnail'}
                            className="inspiration-preview-thumb__img"
                            loading="lazy"
                          />
                          {img.title && (
                            <div className="inspiration-preview-thumb__title">
                              {img.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
                      <button
                        onClick={() => setActiveModule('inspiration')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        View all in Inspiration <ChevronRight size={11} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 8. ACADEMIC ITEMS */}
          {academicItems.length > 0 && (
            <div className="section">
              <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('academics')}>
                <span className="section-title">
                  <GraduationCap size={14} strokeWidth={2} />
                  Academic Sheets & Labs
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn--ghost btn--xs"
                    onClick={() => openModal('lecture_sheet')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
                  >
                    <Plus size={12} /> Add
                  </button>
                  <button
                    className="btn btn--ghost btn--xs"
                    onClick={() => toggleCollapse('academics')}
                    aria-label="Toggle academics section"
                  >
                    {collapsed.academics ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </button>
                </div>
              </div>

              {!collapsed.academics && (
                <>
                  <div className="task-list">
                    {academicItems.slice(0, 4).map((item) => (
                      <div key={item.id} className={`task-row ${item.completed ? 'task-row--done' : ''}`}>
                        <div style={{ marginTop: '2px' }}>
                          <Checkbox
                            checked={item.completed}
                            onChange={() =>
                              item.type === 'lecture'
                                ? toggleLectureSheet(item.subjectId, item.id)
                                : toggleLabSheet(item.subjectId, item.id)
                            }
                          />
                        </div>
                        <div className="task-row__content">
                          <div className="task-row__title">{item.title}</div>
                          <div className="task-row__meta">
                            <span>{item.subjectCode}</span>
                            <span>·</span>
                            <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ paddingTop: '8px' }}>
                    <button
                      onClick={() => setActiveModule('academics')}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                    >
                      All academic subjects <ChevronRight size={11} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 9. GOALS & CAREER MILESTONES */}
          {activeMilestones.length > 0 && (
            <div className="section">
              <div className="section-header" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse('goals')}>
                <span className="section-title">
                  <Target size={14} strokeWidth={2} />
                  Target Milestones
                </span>
                <button
                  className="btn btn--ghost btn--xs"
                  onClick={() => toggleCollapse('goals')}
                  aria-label="Toggle goals section"
                >
                  {collapsed.goals ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {!collapsed.goals && (
                <div className="task-list">
                  {activeMilestones.map((m) => (
                    <div key={m.id} className={`task-row ${m.isCompleted ? 'task-row--done' : ''}`}>
                      <Checkbox
                        checked={m.isCompleted}
                        onChange={() =>
                          m.type === 'goal'
                            ? toggleGoalMilestone(m.parentId, m.id)
                            : toggleCareerMilestone(m.parentId, m.id)
                        }
                      />
                      <div className="task-row__content">
                        <div className="task-row__title">{m.title}</div>
                        <div className="task-row__meta">
                          <span>{m.parentTitle}</span>
                          <span>·</span>
                          <span style={{ textTransform: 'capitalize' }}>{m.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ RIGHT COLUMN: Wellness & Lifestyle ══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* 4. WORKOUT */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">
                <Dumbbell size={14} strokeWidth={2} />
                Workout & Training
              </span>
              <button
                className="btn btn--ghost btn--xs"
                onClick={() => openModal('workout')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
              >
                <Plus size={12} /> Log Session
              </button>
            </div>

            {latestWorkout ? (
              <div style={{ paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{latestWorkout.title}</span>
                    {latestWorkout.sportActivity && (
                      <span
                        style={{
                          fontSize: 'var(--text-2xs)',
                          padding: '1px 6px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r-pill)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {latestWorkout.sportActivity}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {latestWorkout.durationMinutes > 0 ? `${latestWorkout.durationMinutes}m` : ''}
                    {latestWorkout.distance ? ` · ${latestWorkout.distance}km` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    {latestWorkout.muscleGroups.join(', ')}
                  </span>
                  {latestWorkout.rating > 0 && (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                      {'★'.repeat(latestWorkout.rating)}
                    </span>
                  )}
                </div>
                {latestWorkout.exercises.length > 0 && (
                  <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {latestWorkout.exercises.map((ex) => (
                      <span
                        key={ex.id}
                        style={{
                          fontSize: 'var(--text-xs)',
                          padding: '2px 6px',
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--r-xs)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {ex.name} · {ex.sets.length}s
                      </span>
                    ))}
                  </div>
                )}
                {latestWorkout.reflection && (
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      borderLeft: '2px solid var(--border-strong)',
                      paddingLeft: '8px',
                    }}
                  >
                    "{latestWorkout.reflection}"
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                compact
                title="No workout logged today"
                description="Record strength sets, cardio distance, or active sports sessions."
                actionLabel="+ Log Workout"
                onAction={() => openModal('workout')}
              />
            )}
          </div>

          {/* 5. WATER */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">
                <Droplets size={14} strokeWidth={2} />
                Hydration Tracker
              </span>
              <button
                className="btn btn--ghost btn--xs"
                onClick={() => openModal('water')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
              >
                <Plus size={12} /> Custom
              </button>
            </div>

            <div style={{ paddingTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span className="water-amount">{waterLog.currentMl}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                  / {waterLog.targetMl} ml ({waterPct}%)
                </span>
              </div>
              <ProgressBar progress={waterPct} variant="blue" height={4} />
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                {[
                  { label: '+250ml', amount: 250 },
                  { label: '+500ml', amount: 500 },
                  { label: '+750ml', amount: 750 },
                ].map((btn) => (
                  <button
                    key={btn.amount}
                    className="btn btn--secondary btn--xs"
                    onClick={() => logWater(btn.amount, 'Glass')}
                    style={{ flex: 1, padding: '6px 0' }}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. SUPPLEMENTS */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">
                <Pill size={14} strokeWidth={2} />
                Supplements
                {supplements.length > 0 && (
                  <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', textTransform: 'none', letterSpacing: 0 }}>
                    — {metrics.supplementsTakenToday}/{supplements.length} taken
                  </span>
                )}
              </span>
              <button
                className="btn btn--ghost btn--xs"
                onClick={() => openModal('supplement')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="supplement-list">
              {supplements.length === 0 ? (
                <EmptyState
                  compact
                  title="No supplements configured"
                  description="Track vitamins, creatine, omega-3, or medications."
                  actionLabel="+ Add Supplement"
                  onAction={() => openModal('supplement')}
                />
              ) : (
                supplements.map((sup) => (
                  <div key={sup.id} className={`supplement-row ${sup.takenToday ? 'supplement-row--done' : ''}`}>
                    <Checkbox checked={sup.takenToday} onChange={() => toggleSupplement(sup.id)} />
                    <div className="supplement-row__info">
                      <div
                        className="supplement-row__name"
                        style={{
                          textDecoration: sup.takenToday ? 'line-through' : 'none',
                          textDecorationColor: 'var(--border-hover)',
                        }}
                      >
                        {sup.name}
                      </div>
                      <div className="supplement-row__dose">
                        {sup.dosage} {sup.unit} · {sup.timing}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 7. SELF-CARE */}
          <div className="section">
            <div className="section-header">
              <span className="section-title">
                <HeartHandshake size={14} strokeWidth={2} />
                Self-Care & Recovery
              </span>
              <button
                className="btn btn--ghost btn--xs"
                onClick={() => openModal('selfcare')}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
              >
                <Plus size={12} /> Add
              </button>
            </div>

            <div className="supplement-list">
              {selfCareRoutines.length === 0 ? (
                <EmptyState
                  compact
                  title="No self-care routines set"
                  description="Add daily non-negotiables like mobility, mindfulness, reading, or sleep rituals."
                  actionLabel="+ Add Routine"
                  onAction={() => openModal('selfcare')}
                />
              ) : (
                selfCareRoutines.map((routine) => {
                  const isDone = routine.completedToday || !!routine.history[todayStr]
                  return (
                    <div key={routine.id} className={`supplement-row ${isDone ? 'supplement-row--done' : ''}`}>
                      <Checkbox checked={isDone} onChange={() => toggleSelfCareRoutine(routine.id, todayStr)} />
                      <div className="supplement-row__info">
                        <div
                          className="supplement-row__name"
                          style={{
                            textDecoration: isDone ? 'line-through' : 'none',
                            textDecorationColor: 'var(--border-hover)',
                          }}
                        >
                          {routine.title}
                        </div>
                        <div className="supplement-row__dose" style={{ textTransform: 'capitalize' }}>
                          {routine.timeOfDay} · {routine.category}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
