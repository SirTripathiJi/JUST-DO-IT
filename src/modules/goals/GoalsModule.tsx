import React, { useState } from 'react'
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Flag,
  ListTodo,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'
import { ProgressBar } from '../../components/ui/ProgressBar'

export const GoalsModule: React.FC = () => {
  const { goals, deleteGoal, toggleGoalMilestone, toggleGoalChecklist, openModal } = useApp()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredGoals = goals.filter((g) => {
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false
    return true
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Strategic Direction · OKRs & Multi-Tier Objectives</div>
          <h1 className="page-title">Goals & Milestones</h1>
        </div>
        <Button variant="primary" onClick={() => openModal('goal')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New Goal
        </Button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {['all', 'semester', 'monthly', 'subject', 'career', 'personal', 'habit'].map((cat) => (
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

      {/* Goals Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredGoals.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', gridColumn: '1 / -1' }}>
            No goals found in this category. Click "+ New Goal" to define your targets.
          </div>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal.id}
              style={{
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={16} style={{ color: 'var(--color-accent)' }} />
                    <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{goal.title}</h3>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                    {goal.category.toUpperCase()} · Target: {goal.targetDate}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Badge variant={goal.progressPercentage === 100 ? 'green' : 'blue'}>
                    {goal.progressPercentage}%
                  </Badge>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <ProgressBar progress={goal.progressPercentage} variant="blue" height={6} />

              {goal.description && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {goal.description}
                </p>
              )}

              {/* Milestones Checklist */}
              {goal.milestones.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>
                    Key Milestones
                  </div>
                  {goal.milestones.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 8px',
                        background: 'var(--color-bg-secondary)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '12px',
                      }}
                    >
                      <Checkbox
                        checked={m.completed}
                        onChange={() => toggleGoalMilestone(goal.id, m.id)}
                      />
                      <span style={{ textDecoration: m.completed ? 'line-through' : 'none', color: m.completed ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)' }}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
