import React from 'react'
import {
  BarChart3,
  TrendingUp,
  CheckSquare,
  Flame,
  Droplets,
  Pill,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Target,
  Palette,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { Badge } from '../../components/ui/Badge'

export const AnalyticsModule: React.FC = () => {
  const { metrics, habits, workouts, academics, careerRoadmaps, goals, hobbies } = useApp()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div>
        <div className="page-meta">Holistic Reflection · Cross-System Life Metrics</div>
        <h1 className="page-title">Personal OS Analytics</h1>
      </div>

      {/* Main Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {/* 1. EXECUTION & HABITS */}
        <div
          style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={16} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Daily Execution & Habits</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Task Completion Rate</span>
                <span style={{ fontWeight: 600 }}>{metrics.taskCompletionRate}%</span>
              </div>
              <ProgressBar progress={metrics.taskCompletionRate} variant="blue" height={6} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Habit Adherence Today</span>
                <span style={{ fontWeight: 600 }}>{metrics.habitCompletionRate}%</span>
              </div>
              <ProgressBar progress={metrics.habitCompletionRate} variant="amber" height={6} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Hydration Target Pace</span>
                <span style={{ fontWeight: 600 }}>{metrics.waterPercentage}%</span>
              </div>
              <ProgressBar progress={metrics.waterPercentage} variant="blue" height={6} />
            </div>
          </div>
        </div>

        {/* 2. ACADEMICS & CAREER */}
        <div
          style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={16} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Academics & Career Progress</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Academic Sheet & Assignment Completion</span>
                <span style={{ fontWeight: 600 }}>{metrics.academicCompletionRate}%</span>
              </div>
              <ProgressBar progress={metrics.academicCompletionRate} variant="purple" height={6} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Active Career Roadmaps</span>
                <span style={{ fontWeight: 600 }}>{careerRoadmaps.length} Tracks</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {careerRoadmaps.map((r) => r.title).join(' · ')}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span>Active Strategic Goals</span>
                <span style={{ fontWeight: 600 }}>{metrics.activeGoalsCount} in progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PHYSICAL & RECOVERY HEALTH */}
        <div
          style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={16} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Physical & Recovery Health</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Workout Sessions Logged</span>
              <Badge variant="green">{workouts.length} total</Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Daily Supplement Adherence</span>
              <Badge variant="purple">{metrics.supplementsTakenToday}/{metrics.totalSupplements} taken</Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px' }}>Self-Care Protocols</span>
              <Badge variant="blue">{metrics.selfCareCompletedCount}/{metrics.totalSelfCareCount} done</Badge>
            </div>
          </div>
        </div>

        {/* 4. CREATIVE CRAFT & HOBBIES */}
        <div
          style={{
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={16} style={{ color: 'var(--color-accent)' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Craft & Hobbies Mastery</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hobbies.map((h) => {
              const totalMins = h.sessions.reduce((acc, s) => acc + s.durationMinutes, 0)
              return (
                <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{h.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{h.targetFrequency}</div>
                  </div>
                  <Badge variant="amber">{(totalMins / 60).toFixed(1)} hrs</Badge>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
