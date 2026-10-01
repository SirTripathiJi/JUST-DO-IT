import React, { useState } from 'react'
import {
  HeartHandshake,
  Plus,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'

export const SelfCareModule: React.FC = () => {
  const { selfCareRoutines, toggleSelfCareRoutine, deleteSelfCareRoutine, openModal } = useApp()
  const todayStr = getTodayDateString()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredRoutines = selfCareRoutines.filter((r) => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Wellness · Grooming, Skincare & Recovery Protocols</div>
          <h1 className="page-title">Self-Care & Hygiene</h1>
        </div>
        <Button variant="primary" onClick={() => openModal('selfcare')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New Routine
        </Button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'skincare', 'haircare', 'hygiene', 'grooming', 'body'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12px',
              fontWeight: 600,
              background: selectedCategory === cat ? 'var(--color-bg-secondary)' : 'transparent',
              color: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              border: selectedCategory === cat ? '1px solid var(--color-border-subtle)' : '1px solid transparent',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Routine Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredRoutines.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', gridColumn: '1 / -1' }}>
            No routines found in this category. Click "+ New Routine" to add one.
          </div>
        ) : (
          filteredRoutines.map((routine) => {
            const isDone = routine.completedToday || !!routine.history[todayStr]

            return (
              <div
                key={routine.id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Checkbox
                      checked={isDone}
                      onChange={() => toggleSelfCareRoutine(routine.id, todayStr)}
                    />
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {routine.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                        {routine.timeOfDay.toUpperCase()} · {routine.frequency} · {routine.category}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant="green">🔥 {routine.currentStreak}d</Badge>
                    <button
                      onClick={() => deleteSelfCareRoutine(routine.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {routine.description && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '8px 10px', borderRadius: 'var(--radius-xs)' }}>
                    {routine.description}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
