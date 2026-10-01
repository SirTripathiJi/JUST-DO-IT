import React from 'react'
import type { ModuleId } from '../../types'
import { navigationItems } from '../../data/seedData'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Plus } from 'lucide-react'

export const ModulePlaceholder: React.FC<{ moduleId: ModuleId }> = ({ moduleId }) => {
  const { setActiveModule, openModal } = useApp()
  const navItem = navigationItems.find((n) => n.id === moduleId)

  const getModuleRoadmap = () => {
    switch (moduleId) {
      case 'calendar':
        return ['Google Calendar sync', 'Drag-and-drop time blocking', 'Daily focus session timers', 'Agenda rescheduling']
      case 'workouts':
        return ['Progressive overload tracking', 'Rest timers', '1RM calculators', 'Volume load trends']
      case 'selfcare':
        return ['Sleep hygiene checklist', 'Breathwork pacing timer', 'Weekly recovery score', 'Burnout prevention alerts']
      case 'goals':
        return ['Quarterly OKRs', 'Habit-linked progress', 'Vision board uploads', 'Milestone tracking']
      case 'academics':
        return ['Assignment deadline tracker', 'GPA calculator', 'Cornell note templates', 'Spaced repetition']
      case 'career':
        return ['Skill matrix roadmap', 'Performance review logs', 'Networking Rolodex', 'Portfolio milestones']
      case 'hobbies':
        return ['Creative project logs', 'Reading list with quotes', 'Practice session logs', 'Visual gallery']
      case 'analytics':
        return ['Focus hour heatmaps', 'Habit consistency graphs', 'Hydration correlations', 'Monthly retrospectives']
      case 'settings':
        return ['Custom tags and themes', 'JSON export and backup', 'Data reset options', 'Module visibility config']
      default:
        return ['Full filtering and sorting', 'Multi-factor categorization', 'Batch editing', 'Export to PDF/CSV']
    }
  }

  return (
    <div className="animate-in">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-hero__left">
          <div className="module-hero__eyebrow">Module</div>
          <h1 className="module-hero__title">{navItem?.label || 'Module'}</h1>
          {navItem?.description && (
            <p className="module-hero__subtitle">{navItem.description}</p>
          )}
        </div>
        <div className="module-hero__actions">
          <Button variant="ghost" size="sm" onClick={() => setActiveModule('today')}>
            Today
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => openModal('task')}
          >
            Quick Add
          </Button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="ws-section">
        <div className="ws-section__header">
          <span className="ws-section__title">Planned Features</span>
        </div>
        <div style={{ paddingTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--border)' }}>
          {getModuleRoadmap().map((feature, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 16px',
                background: 'var(--bg-white)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-strong)', flexShrink: 0, display: 'inline-block' }} />
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Editorial empty state */}
      <div style={{ marginTop: '48px', padding: '48px 0', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '32px' }}>
        <div style={{ width: '1px', height: '64px', background: 'var(--border-strong)', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Building in Progress
          </div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '480px' }}>
            This module is part of the{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Just Do It</strong> personal OS.
            It shares the same local-first architecture and will be fully interactive in the next release.
          </p>
        </div>
      </div>
    </div>
  )
}
