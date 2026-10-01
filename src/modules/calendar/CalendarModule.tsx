import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  CheckSquare,
  Dumbbell,
  GraduationCap,
  Clock,
  X,
  Layers,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString, formatLocalDate } from '../../data/seedData'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'
import { EmptyState } from '../../components/ui/EmptyState'

export const CalendarModule: React.FC = () => {
  const { tasks, toggleTask, academics, workouts, schedule, toggleScheduleItem, openModal } = useApp()
  const todayStr = useMemo(() => getTodayDateString(), [])

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [viewDate, setViewDate] = useState<Date>(new Date())
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false)

  // Quick navigation handlers
  const handlePrev = useCallback(() => {
    setViewDate((prev) => {
      const d = new Date(prev)
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() - 1)
      } else {
        d.setDate(d.getDate() - 7)
      }
      return d
    })
  }, [viewMode])

  const handleNext = useCallback(() => {
    setViewDate((prev) => {
      const d = new Date(prev)
      if (viewMode === 'month') {
        d.setMonth(d.getMonth() + 1)
      } else {
        d.setDate(d.getDate() + 7)
      }
      return d
    })
  }, [viewMode])

  const handleGoToday = useCallback(() => {
    const now = new Date()
    setViewDate(now)
    setSelectedDate(todayStr)
  }, [todayStr])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isEditable) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault()
        handleGoToday()
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setViewMode('month')
      } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        setViewMode('week')
      } else if (e.key === 'Escape' && isInspectorOpen) {
        setIsInspectorOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrev, handleNext, handleGoToday, isInspectorOpen])

  // Month header text
  const monthYearLabel = useMemo(() => {
    return viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [viewDate])

  // Days for month grid
  const monthDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startingDayOfWeek = firstDay.getDay() // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Days from previous month to fill first week
    const prevMonthDays = new Date(year, month, 0).getDate()
    const days: {
      dateStr: string
      dayNumber: number
      isCurrentMonth: boolean
      isToday: boolean
    }[] = []

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const d = new Date(year, month - 1, dayNum)
      const dateStr = formatLocalDate(d)
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      })
    }

    // Days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      const dateStr = formatLocalDate(d)
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      })
    }

    // Days from next month to complete last week
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      const dateStr = formatLocalDate(d)
      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      })
    }

    return days
  }, [viewDate, todayStr])

  // Days for week view
  const weekDays = useMemo(() => {
    const d = new Date(viewDate)
    const dayOfWeek = d.getDay()
    const diff = d.getDate() - dayOfWeek
    d.setDate(diff)

    return Array.from({ length: 7 }).map((_, i) => {
      const curr = new Date(d)
      curr.setDate(d.getDate() + i)
      const dateStr = formatLocalDate(curr)
      return {
        dateStr,
        dayName: curr.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: curr.getDate(),
        isToday: dateStr === todayStr,
      }
    })
  }, [viewDate, todayStr])

  // Quick lookup helper for events on a specific date
  const getItemsForDate = useCallback(
    (dateStr: string) => {
      const dayTasks = tasks.filter((t) => t.dueDate === dateStr)
      const dayWorkouts = workouts.filter((w) => w.date === dateStr)
      const daySchedule = schedule.filter((s) => s.date === dateStr)
      const dayAssignments: { subjCode: string; title: string }[] = []
      academics.forEach((s) => {
        s.assignments.forEach((a) => {
          if (a.dueDate === dateStr) dayAssignments.push({ subjCode: s.code, title: a.title })
        })
      })

      return {
        tasks: dayTasks,
        workouts: dayWorkouts,
        schedule: daySchedule,
        assignments: dayAssignments,
        totalCount: dayTasks.length + dayWorkouts.length + daySchedule.length + dayAssignments.length,
      }
    },
    [tasks, workouts, schedule, academics]
  )

  const selectedItems = useMemo(() => getItemsForDate(selectedDate), [getItemsForDate, selectedDate])

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    setIsInspectorOpen(true)
  }

  const selectedDateFormatted = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  }, [selectedDate])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-in">
      {/* ── Page Header & Anatomy ────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="page-meta">Time Allocation · Unified Schedule & Deadlines</div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Calendar</span>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--text-tertiary)' }}>
              · {monthYearLabel}
            </span>
          </h1>
        </div>

        {/* View Controls & Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Month / Week Switcher */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--bg-subtle)',
              padding: '2px',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
            }}
          >
            <button
              className={`btn btn--xs ${viewMode === 'month' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setViewMode('month')}
              style={{ padding: '4px 10px' }}
            >
              Month
            </button>
            <button
              className={`btn btn--xs ${viewMode === 'week' ? 'btn--primary' : 'btn--ghost'}`}
              onClick={() => setViewMode('week')}
              style={{ padding: '4px 10px' }}
            >
              Week
            </button>
          </div>

          {/* Prev / Today / Next */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <Button variant="secondary" size="sm" icon onClick={handlePrev} aria-label="Previous">
              <ChevronLeft size={14} />
            </Button>
            <Button variant="secondary" size="sm" onClick={handleGoToday}>
              Today
            </Button>
            <Button variant="secondary" size="sm" icon onClick={handleNext} aria-label="Next">
              <ChevronRight size={14} />
            </Button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => openModal('task')}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* ── Main Layout: Calendar Grid + Inspector Panel ─────────────────── */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Calendar Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Weekday headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '8px',
              textAlign: 'center',
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <span
                key={d}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-tertiary)',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* ── MONTH VIEW ── */}
          {viewMode === 'month' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '1px',
                background: 'var(--border)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)',
                overflow: 'hidden',
                marginTop: '8px',
              }}
            >
              {monthDays.map((day) => {
                const items = getItemsForDate(day.dateStr)
                const isSelected = selectedDate === day.dateStr

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => handleSelectDate(day.dateStr)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectDate(day.dateStr)}
                    style={{
                      minHeight: '88px',
                      background: isSelected
                        ? 'var(--bg-active)'
                        : day.isCurrentMonth
                        ? 'var(--color-bg-primary)'
                        : 'var(--bg-subtle)',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'background var(--t-fast) var(--ease)',
                      outline: isSelected ? '2px solid var(--border-focus)' : 'none',
                      outlineOffset: '-2px',
                    }}
                  >
                    {/* Day Number Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          fontWeight: day.isToday ? 700 : 500,
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: day.isToday ? 'var(--text-primary)' : 'transparent',
                          color: day.isToday
                            ? 'var(--text-inverse)'
                            : day.isCurrentMonth
                            ? 'var(--text-primary)'
                            : 'var(--text-disabled)',
                        }}
                      >
                        {day.dayNumber}
                      </span>

                      {items.totalCount > 0 && (
                        <span
                          style={{
                            fontSize: 'var(--text-2xs)',
                            fontWeight: 600,
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          {items.totalCount}
                        </span>
                      )}
                    </div>

                    {/* Chips inside day cell (compact) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                      {items.tasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          style={{
                            fontSize: '10px',
                            padding: '2px 5px',
                            borderRadius: 'var(--r-xs)',
                            background: 'var(--bg-hover)',
                            color: t.completed ? 'var(--text-tertiary)' : 'var(--text-primary)',
                            textDecoration: t.completed ? 'line-through' : 'none',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderLeft: '2px solid var(--text-primary)',
                          }}
                        >
                          {t.title}
                        </div>
                      ))}

                      {items.workouts.slice(0, 1).map((w) => (
                        <div
                          key={w.id}
                          style={{
                            fontSize: '10px',
                            padding: '2px 5px',
                            borderRadius: 'var(--r-xs)',
                            background: 'var(--bg-hover)',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            borderLeft: '2px solid var(--status-green)',
                          }}
                        >
                          🏋️ {w.title}
                        </div>
                      ))}

                      {items.totalCount > 3 && (
                        <span style={{ fontSize: '9px', color: 'var(--text-tertiary)', paddingLeft: '2px' }}>
                          +{items.totalCount - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── WEEK VIEW ── */}
          {viewMode === 'week' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              {weekDays.map((day) => {
                const items = getItemsForDate(day.dateStr)
                const isSelected = selectedDate === day.dateStr

                return (
                  <div
                    key={day.dateStr}
                    onClick={() => handleSelectDate(day.dateStr)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelectDate(day.dateStr)}
                    style={{
                      minHeight: '220px',
                      background: isSelected ? 'var(--bg-active)' : 'var(--color-bg-primary)',
                      border: day.isToday
                        ? '2px solid var(--text-primary)'
                        : isSelected
                        ? '1.5px solid var(--border-focus)'
                        : '1px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      padding: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {/* Day Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {day.dayName}
                      </span>
                      <span
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: day.isToday ? 700 : 600,
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: day.isToday ? 'var(--text-primary)' : 'transparent',
                          color: day.isToday ? 'var(--text-inverse)' : 'var(--text-primary)',
                        }}
                      >
                        {day.dayNumber}
                      </span>
                    </div>

                    {/* Day Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      {items.tasks.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            padding: '4px 6px',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--r-xs)',
                            borderLeft: '2px solid var(--text-primary)',
                            fontSize: '11px',
                          }}
                        >
                          <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {t.title}
                          </div>
                          {t.dueTime && <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{t.dueTime}</div>}
                        </div>
                      ))}

                      {items.workouts.map((w) => (
                        <div
                          key={w.id}
                          style={{
                            padding: '4px 6px',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--r-xs)',
                            borderLeft: '2px solid var(--status-green)',
                            fontSize: '11px',
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>🏋️ {w.title}</div>
                        </div>
                      ))}

                      {items.assignments.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 6px',
                            background: 'var(--bg-subtle)',
                            borderRadius: 'var(--r-xs)',
                            borderLeft: '2px solid var(--status-amber)',
                            fontSize: '11px',
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>📚 {a.subjCode}</div>
                        </div>
                      ))}

                      {items.totalCount === 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '20px' }}>
                          No items
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Inspection Side Panel / Drawer ──────────────────────────────── */}
        {isInspectorOpen && (
          <aside
            style={{
              width: '320px',
              flexShrink: 0,
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              animation: 'fadeSlideUp var(--t-fast) var(--ease)',
            }}
            aria-label="Date Inspector"
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Selected Date
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedDateFormatted}
                </div>
              </div>

              <Button variant="ghost" size="sm" icon onClick={() => setIsInspectorOpen(false)} aria-label="Close Inspector">
                <X size={15} />
              </Button>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<Plus size={12} />}
                onClick={() => openModal('task', { dueDate: selectedDate })}
                style={{ flex: 1 }}
              >
                Task
              </Button>
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<Plus size={12} />}
                onClick={() => openModal('workout', { date: selectedDate })}
                style={{ flex: 1 }}
              >
                Workout
              </Button>
            </div>

            {/* Content List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {/* Tasks for date */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckSquare size={12} />
                  <span>Tasks ({selectedItems.tasks.length})</span>
                </div>
                {selectedItems.tasks.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>None scheduled</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedItems.tasks.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--r-xs)',
                        }}
                      >
                        <Checkbox checked={t.completed} onChange={() => toggleTask(t.id)} />
                        <span style={{ fontSize: '12px', textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-tertiary)' : 'var(--text-primary)', flex: 1 }}>
                          {t.title}
                        </span>
                        {t.priority === 'urgent' && <Badge variant="red">Urgent</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Workouts for date */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Dumbbell size={12} />
                  <span>Workouts ({selectedItems.workouts.length})</span>
                </div>
                {selectedItems.workouts.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>None logged</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedItems.workouts.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          padding: '6px 8px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--r-xs)',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{w.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {w.durationMinutes} mins · {w.muscleGroups.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Academic Deadlines */}
              {selectedItems.assignments.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <GraduationCap size={12} />
                    <span>Academic Deadlines ({selectedItems.assignments.length})</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {selectedItems.assignments.map((a, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '6px 8px',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--r-xs)',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{a.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{a.subjCode}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
