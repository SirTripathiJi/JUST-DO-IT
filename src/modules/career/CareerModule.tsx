import React, { useState } from 'react'
import {
  Briefcase,
  Plus,
  Code2,
  BookOpen,
  FolderGit2,
  Flag,
  ExternalLink,
  Trash2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'
import { ProgressBar } from '../../components/ui/ProgressBar'

export const CareerModule: React.FC = () => {
  const {
    careerRoadmaps,
    deleteCareerRoadmap,
    toggleCareerCourse,
    toggleCareerMilestone,
    updateCareerSkill,
    openModal,
  } = useApp()

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(careerRoadmaps[0]?.id || '')

  const currentRoadmap = careerRoadmaps.find((r) => r.id === selectedRoadmapId) || careerRoadmaps[0]

  // Calculate roadmap completion percentage
  const calculateRoadmapProgress = (roadmap: typeof currentRoadmap) => {
    if (!roadmap) return 0
    let totalItems = 0
    let progressSum = 0

    roadmap.skills.forEach((s) => {
      totalItems++
      progressSum += s.progressPercentage
    })

    roadmap.courses.forEach((c) => {
      totalItems++
      progressSum += c.completed ? 100 : c.progressPercentage
    })

    roadmap.projects.forEach((p) => {
      totalItems++
      const done = p.milestones.filter((m) => m.completed).length
      const pPct = p.milestones.length > 0 ? (done / p.milestones.length) * 100 : 0
      progressSum += pPct
    })

    roadmap.milestones.forEach((m) => {
      totalItems++
      if (m.completed) progressSum += 100
    })

    return totalItems > 0 ? Math.round(progressSum / totalItems) : 0
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Long-Term Growth · Professional Roadmaps</div>
          <h1 className="page-title">Career Development</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => openModal('career_skill')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Skill
          </Button>
          <Button variant="secondary" onClick={() => openModal('career_project')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Project
          </Button>
          <Button variant="primary" onClick={() => openModal('career_roadmap')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> New Roadmap
          </Button>
        </div>
      </div>

      {/* Roadmap Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {careerRoadmaps.map((r) => {
          const isSelected = r.id === currentRoadmap?.id
          const progress = calculateRoadmapProgress(r)
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoadmapId(r.id)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '220px',
                textAlign: 'left',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{r.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.targetRole}
                </div>
              </div>
              <Badge variant={progress >= 70 ? 'green' : 'blue'}>{progress}%</Badge>
            </button>
          )
        })}
      </div>

      {/* Current Roadmap Details */}
      {currentRoadmap ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Roadmap Header Card */}
          <div
            style={{
              padding: '18px 20px',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} style={{ color: 'var(--color-accent)' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 700 }}>{currentRoadmap.title}</h2>
                <Badge variant="blue">Target: {currentRoadmap.targetRole}</Badge>
              </div>
              {currentRoadmap.description && (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                  {currentRoadmap.description}
                </p>
              )}
              <div style={{ marginTop: '12px', maxWidth: '420px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>Roadmap Mastery</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                    {calculateRoadmapProgress(currentRoadmap)}%
                  </span>
                </div>
                <ProgressBar progress={calculateRoadmapProgress(currentRoadmap)} variant="blue" height={6} />
              </div>
            </div>

            <button
              onClick={() => deleteCareerRoadmap(currentRoadmap.id)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px' }}
              title="Delete Career Roadmap"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* 4-Column Layout: Skills / Projects / Courses / Milestones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* 1. SKILLS MATRIX */}
            <div
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Code2 size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Skills Matrix</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal('career_skill')}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Add Skill
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentRoadmap.skills.map((skill) => (
                  <div key={skill.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{skill.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{skill.level}</span>
                        <Badge variant={skill.progressPercentage >= 80 ? 'green' : 'blue'}>
                          {skill.progressPercentage}%
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar progress={skill.progressPercentage} variant="blue" height={4} />
                    {skill.notes && (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>{skill.notes}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. PORTFOLIO PROJECTS */}
            <div
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FolderGit2 size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Showcase Projects</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal('career_project')}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Add Project
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentRoadmap.projects.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: '12px',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{proj.title}</span>
                      <Badge variant={proj.status === 'completed' ? 'green' : 'blue'}>{proj.status}</Badge>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      {proj.description}
                    </p>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {proj.techStack.map((tech, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '10px',
                            padding: '1px 5px',
                            background: 'var(--color-bg-primary)',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border-subtle)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. COURSES & CERTIFICATIONS */}
            <div
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Courses & Certs</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentRoadmap.courses.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    No courses added yet.
                  </div>
                ) : (
                  currentRoadmap.courses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-xs)',
                        background: c.completed ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        <Checkbox
                          checked={c.completed}
                          onChange={() => toggleCareerCourse(currentRoadmap.id, c.id)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: c.completed ? 'line-through' : 'none',
                          }}
                        >
                          {c.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                          {c.platform} · {c.progressPercentage}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 4. KEY MILESTONES */}
            <div
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Career Milestones</h3>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentRoadmap.milestones.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: m.completed ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <Checkbox
                      checked={m.completed}
                      onChange={() => toggleCareerMilestone(currentRoadmap.id, m.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          textDecoration: m.completed ? 'line-through' : 'none',
                        }}
                      >
                        {m.title}
                      </div>
                      {m.targetDate && (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                          Target: {m.targetDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          No career roadmaps found. Click "+ New Roadmap" to establish your career path.
        </div>
      )}
    </div>
  )
}
