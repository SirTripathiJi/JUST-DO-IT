import React, { useState } from 'react'
import {
  Flame,
  Plus,
  Archive,
  RotateCcw,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'

export const HabitsModule: React.FC = () => {
  const { habits, addHabit, toggleHabit, toggleArchiveHabit, deleteHabit, openModal } = useApp()
  const todayStr = getTodayDateString()
  const [filter, setFilter] = useState<'active' | 'archived'>('active')
  const [quickHabitTitle, setQuickHabitTitle] = useState('')

  // Generate last 21 days for the calendar heatmap
  const pastDays = Array.from({ length: 21 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (20 - i))
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const dayLetter = d.toLocaleDateString('en-US', { weekday: 'narrow' })
    const dayNum = d.getDate()
    return { dateStr, dayLetter, dayNum, isToday: dateStr === todayStr }
  })

  const displayedHabits = habits.filter((h) => (filter === 'active' ? !h.isArchived : h.isArchived))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Consistency & Atomic Habits</div>
          <h1 className="page-title">Habit Tracker & Heatmaps</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" onClick={() => openModal('habit')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> New Habit
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            fontWeight: 600,
            background: filter === 'active' ? 'var(--color-bg-secondary)' : 'transparent',
            color: filter === 'active' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            border: filter === 'active' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          Active Habits ({habits.filter((h) => !h.isArchived).length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '12px',
            fontWeight: 600,
            background: filter === 'archived' ? 'var(--color-bg-secondary)' : 'transparent',
            color: filter === 'archived' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            border: filter === 'archived' ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          Paused / Archived ({habits.filter((h) => h.isArchived).length})
        </button>
      </div>

      {/* Inline Quick Add Input */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '8px 12px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          alignItems: 'center',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Plus size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Quick add habit and press Enter (or click + New Habit for full schedule)..."
          value={quickHabitTitle}
          onChange={(e) => setQuickHabitTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && quickHabitTitle.trim()) {
              e.preventDefault()
              addHabit({
                title: quickHabitTitle.trim(),
                frequency: 'daily',
                targetPerDay: 1,
                category: 'productivity',
              })
              setQuickHabitTitle('')
            }
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: '13px',
            color: 'var(--color-text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        {quickHabitTitle.trim() && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              addHabit({
                title: quickHabitTitle.trim(),
                frequency: 'daily',
                targetPerDay: 1,
                category: 'productivity',
              })
              setQuickHabitTitle('')
            }}
          >
            Add Habit
          </Button>
        )}
      </div>

      {/* Habit Cards with Heatmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {displayedHabits.length === 0 ? (
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              No {filter} habits tracking
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginTop: '4px',
                maxWidth: '380px',
                margin: '4px auto 16px',
              }}
            >
              Start empty and build your personal daily atomic streak. Tap any suggestion below:
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                'Morning Sunlight & Hydration',
                '90-Minute Deep Work Block',
                'Daily Exercise / Movement',
                'Read 20+ Pages',
                'Evening Meditation / Stretch',
              ].map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() =>
                    addHabit({
                      title: sug,
                      frequency: 'daily',
                      targetPerDay: 1,
                      category: 'productivity',
                    })
                  }
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={11} /> {sug}
                </button>
              ))}
            </div>

            <Button variant="secondary" size="sm" onClick={() => openModal('habit')}>
              <Plus size={13} style={{ marginRight: '6px' }} /> Custom Habit Form
            </Button>
          </div>
        ) : (
          displayedHabits.map((habit) => {
            const isDoneToday = !!habit.completions[todayStr]

            // Calculate 21-day completion percentage
            const completedPastCount = pastDays.filter((d) => !!habit.completions[d.dateStr]).length
            const adherencePercentage = Math.round((completedPastCount / pastDays.length) * 100)

            return (
              <div
                key={habit.id}
                style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Checkbox
                      checked={isDoneToday}
                      onChange={() => toggleHabit(habit.id, todayStr)}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {habit.title}
                        </span>
                        <Badge variant="amber">🔥 {habit.currentStreak}d Streak</Badge>
                        <Badge variant="gray">Best: {habit.bestStreak}d</Badge>
                      </div>
                      {habit.description && (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent)' }}>
                      {adherencePercentage}% Adherence (21d)
                    </span>
                    <button
                      onClick={() => toggleArchiveHabit(habit.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title={habit.isArchived ? 'Unarchive habit' : 'Pause / Archive habit'}
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-tertiary)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                      title="Delete habit"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 21-Day Heatmap Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                    Recent 21-Day Completion Heatmap
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(21, 1fr)', gap: '4px', maxWidth: '640px' }}>
                    {pastDays.map((d) => {
                      const completed = !!habit.completions[d.dateStr]
                      return (
                        <div
                          key={d.dateStr}
                          onClick={() => toggleHabit(habit.id, d.dateStr)}
                          title={`${d.dateStr}: ${completed ? 'Completed' : 'Missed'} (Click to toggle)`}
                          style={{
                            height: '24px',
                            borderRadius: '3px',
                            background: completed
                              ? 'var(--color-accent)'
                              : d.isToday
                              ? 'var(--color-bg-secondary)'
                              : 'var(--color-bg-elevated)',
                            border: d.isToday
                              ? '1px solid var(--color-accent)'
                              : '1px solid var(--color-border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontWeight: 600,
                            color: completed ? '#fff' : 'var(--color-text-tertiary)',
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                          }}
                        >
                          {d.dayNum}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
