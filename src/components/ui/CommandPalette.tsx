import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  CheckSquare,
  Flame,
  GraduationCap,
  Briefcase,
  Target,
  Sparkles,
  Calendar,
  Dumbbell,
  Droplets,
  Pill,
  HeartHandshake,
  Palette,
  BarChart3,
  Settings,
  ArrowRight,
  X,
  Image as ImageIcon,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { ModuleId } from '../../types'

interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: string
  icon: React.ReactNode
  onSelect: () => void
}

export const CommandPalette: React.FC = () => {
  const {
    modal,
    closeModal,
    setActiveModule,
    tasks,
    habits,
    academics,
    careerRoadmaps,
    goals,
  } = useApp()

  const [query, setQuery] = useState('')

  useEffect(() => {
    if (modal.type === 'command_palette') {
      setQuery('')
    }
  }, [modal.type])

  const results: SearchResultItem[] = useMemo(() => {
    if (!query.trim()) {
      // Default quick navigation
      return [
        {
          id: 'nav-today',
          title: 'Today Command Center',
          subtitle: 'Daily focus, high priority tasks, habits',
          category: 'Navigation',
          icon: <Sparkles size={16} />,
          onSelect: () => {
            setActiveModule('today')
            closeModal()
          },
        },
        {
          id: 'nav-academics',
          title: 'Academics & Lecture Sheets',
          subtitle: 'Courses, sheets, assignments & exam prep',
          category: 'Navigation',
          icon: <GraduationCap size={16} />,
          onSelect: () => {
            setActiveModule('academics')
            closeModal()
          },
        },
        {
          id: 'nav-career',
          title: 'Career Roadmaps',
          subtitle: 'Skills, projects, and milestones',
          category: 'Navigation',
          icon: <Briefcase size={16} />,
          onSelect: () => {
            setActiveModule('career')
            closeModal()
          },
        },
        {
          id: 'nav-tasks',
          title: 'Task Manager',
          subtitle: 'All tasks, subtasks and priorities',
          category: 'Navigation',
          icon: <CheckSquare size={16} />,
          onSelect: () => {
            setActiveModule('tasks')
            closeModal()
          },
        },
        {
          id: 'nav-habits',
          title: 'Habit Consistency',
          subtitle: 'Atomic habits & heatmaps',
          category: 'Navigation',
          icon: <Flame size={16} />,
          onSelect: () => {
            setActiveModule('habits')
            closeModal()
          },
        },
        {
          id: 'nav-goals',
          title: 'Goals & Milestones',
          subtitle: 'Semester and personal goals',
          category: 'Navigation',
          icon: <Target size={16} />,
          onSelect: () => {
            setActiveModule('goals')
            closeModal()
          },
        },
      ]
    }

    const q = query.toLowerCase()
    const items: SearchResultItem[] = []

    // Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) {
        items.push({
          id: `task-${t.id}`,
          title: t.title,
          subtitle: `Task · Priority: ${t.priority} · ${t.completed ? 'Completed' : 'Pending'}`,
          category: 'Tasks',
          icon: <CheckSquare size={15} />,
          onSelect: () => {
            setActiveModule('tasks')
            closeModal()
          },
        })
      }
    })

    // Academics (Subjects, Sheets, Assignments)
    academics.forEach((subj) => {
      if (subj.name.toLowerCase().includes(q) || subj.code.toLowerCase().includes(q)) {
        items.push({
          id: `subj-${subj.id}`,
          title: `${subj.code}: ${subj.name}`,
          subtitle: `Academic Subject · ${subj.semester}`,
          category: 'Academics',
          icon: <GraduationCap size={15} />,
          onSelect: () => {
            setActiveModule('academics')
            closeModal()
          },
        })
      }
      subj.lectureSheets.forEach((ls) => {
        if (ls.title.toLowerCase().includes(q)) {
          items.push({
            id: `ls-${ls.id}`,
            title: `Lecture Sheet #${ls.number}: ${ls.title}`,
            subtitle: `${subj.code} · ${ls.completed ? 'Completed' : 'Incomplete'}`,
            category: 'Academics',
            icon: <GraduationCap size={15} />,
            onSelect: () => {
              setActiveModule('academics')
              closeModal()
            },
          })
        }
      })
      subj.assignments.forEach((as) => {
        if (as.title.toLowerCase().includes(q)) {
          items.push({
            id: `as-${as.id}`,
            title: `Assignment: ${as.title}`,
            subtitle: `${subj.code} · Due: ${as.dueDate}`,
            category: 'Academics',
            icon: <GraduationCap size={15} />,
            onSelect: () => {
              setActiveModule('academics')
              closeModal()
            },
          })
        }
      })
    })

    // Habits
    habits.forEach((h) => {
      if (h.title.toLowerCase().includes(q)) {
        items.push({
          id: `habit-${h.id}`,
          title: h.title,
          subtitle: `Habit · Streak: ${h.currentStreak}d · ${h.frequency}`,
          category: 'Habits',
          icon: <Flame size={15} />,
          onSelect: () => {
            setActiveModule('habits')
            closeModal()
          },
        })
      }
    })

    // Career Roadmaps & Projects
    careerRoadmaps.forEach((cr) => {
      if (cr.title.toLowerCase().includes(q) || cr.targetRole.toLowerCase().includes(q)) {
        items.push({
          id: `cr-${cr.id}`,
          title: cr.title,
          subtitle: `Career Roadmap · ${cr.targetRole}`,
          category: 'Career',
          icon: <Briefcase size={15} />,
          onSelect: () => {
            setActiveModule('career')
            closeModal()
          },
        })
      }
      cr.projects.forEach((p) => {
        if (p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
          items.push({
            id: `proj-${p.id}`,
            title: `Project: ${p.title}`,
            subtitle: `${cr.title} · ${p.status}`,
            category: 'Career',
            icon: <Briefcase size={15} />,
            onSelect: () => {
              setActiveModule('career')
              closeModal()
            },
          })
        }
      })
    })

    // Goals
    goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q)) {
        items.push({
          id: `goal-${g.id}`,
          title: g.title,
          subtitle: `Goal · Category: ${g.category} · ${g.progressPercentage}% done`,
          category: 'Goals',
          icon: <Target size={15} />,
          onSelect: () => {
            setActiveModule('goals')
            closeModal()
          },
        })
      }
    })

    // Navigation Modules
    const modules: { id: ModuleId; name: string; icon: React.ReactNode }[] = [
      { id: 'today', name: 'Today Command Center', icon: <Sparkles size={15} /> },
      { id: 'calendar', name: 'Calendar Schedule', icon: <Calendar size={15} /> },
      { id: 'inspiration', name: 'Inspiration Visual Board', icon: <ImageIcon size={15} /> },
      { id: 'tasks', name: 'Tasks Workspace', icon: <CheckSquare size={15} /> },
      { id: 'habits', name: 'Habits Tracker', icon: <Flame size={15} /> },
      { id: 'water', name: 'Water & Hydration', icon: <Droplets size={15} /> },
      { id: 'supplements', name: 'Supplements & Vitamins', icon: <Pill size={15} /> },
      { id: 'workouts', name: 'Fitness & Gym Tracker', icon: <Dumbbell size={15} /> },
      { id: 'selfcare', name: 'Self-Care & Hygiene Routines', icon: <HeartHandshake size={15} /> },
      { id: 'academics', name: 'Academics & Study', icon: <GraduationCap size={15} /> },
      { id: 'career', name: 'Career Roadmaps', icon: <Briefcase size={15} /> },
      { id: 'goals', name: 'Goals & OKRs', icon: <Target size={15} /> },
      { id: 'hobbies', name: 'Hobbies & Craft', icon: <Palette size={15} /> },
      { id: 'analytics', name: 'Analytics & Insights', icon: <BarChart3 size={15} /> },
      { id: 'settings', name: 'Settings & Profile', icon: <Settings size={15} /> },
    ]

    modules.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.id.includes(q)) {
        items.push({
          id: `nav-${m.id}`,
          title: m.name,
          subtitle: `Open ${m.name} module`,
          category: 'Modules',
          icon: m.icon,
          onSelect: () => {
            setActiveModule(m.id)
            closeModal()
          },
        })
      }
    })

    return items
  }, [query, tasks, academics, habits, careerRoadmaps, goals, setActiveModule, closeModal])

  if (modal.type !== 'command_palette') return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={closeModal}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <Search size={18} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, search tasks, subjects, goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={closeModal}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '2px 6px',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div
          style={{
            overflowY: 'auto',
            padding: '8px',
            maxHeight: '400px',
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: '13px',
              }}
            >
              No matching tasks, courses, or roadmaps found for "{query}".
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={item.onSelect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <div
                  style={{
                    color: 'var(--color-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-bg-secondary)',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-text-tertiary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.subtitle}
                  </div>
                </div>
                <ArrowRight size={13} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--color-text-tertiary)',
          }}
        >
          <span>Use <strong>Cmd+K</strong> anytime to quick jump</span>
          <span>Press <strong>Enter</strong> to select</span>
        </div>
      </div>
    </div>
  )
}
