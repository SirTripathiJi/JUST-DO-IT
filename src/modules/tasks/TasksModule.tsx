import React, { useState, useMemo } from 'react'
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Checkbox } from '../../components/ui/Checkbox'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import type { PriorityLevel, Task, TaskCategory } from '../../types'

export const TasksModule: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, openModal, updateTask } = useApp()
  const todayStr = getTodayDateString()

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'all' | 'completed'>('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({})
  const [quickTaskTitle, setQuickTaskTitle] = useState('')

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.subtasks) return
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )
    updateTask({ ...task, subtasks: updatedSubtasks })
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Tab filter
      if (activeTab === 'today') {
        if (t.completed) return false
        if (t.dueDate && t.dueDate !== todayStr) return false
      } else if (activeTab === 'upcoming') {
        if (t.completed) return false
        if (!t.dueDate || t.dueDate <= todayStr) return false
      } else if (activeTab === 'completed') {
        if (!t.completed) return false
      }

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchDesc = t.description?.toLowerCase().includes(q)
        const matchTags = t.tags?.some((tag) => tag.toLowerCase().includes(q))
        if (!matchTitle && !matchDesc && !matchTags) return false
      }

      return true
    })
  }, [tasks, activeTab, priorityFilter, categoryFilter, searchQuery, todayStr])

  return (
    <div className="animate-in">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-hero__left">
          <div className="module-hero__eyebrow">Execution</div>
          <h1 className="module-hero__title">Tasks</h1>
          <p className="module-hero__subtitle">Daily focus and project work</p>
        </div>
        <div className="module-hero__actions">
          <Button variant="secondary" size="sm" onClick={() => openModal('task')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={13} /> New Task
          </Button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', gap: '2px' }}>
          {[
            { id: 'today', label: 'Today', count: tasks.filter((t) => !t.completed && (!t.dueDate || t.dueDate === todayStr)).length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length },
            { id: 'all', label: 'All Open', count: tasks.filter((t) => !t.completed).length },
            { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.completed).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '5px 11px',
                borderRadius: 'var(--r-pill)',
                fontSize: 'var(--text-xs)',
                fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-tertiary)',
                border: '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 80ms ease',
              }}
            >
              {tab.label}
              <span style={{ marginLeft: '5px', opacity: 0.7 }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '160px',
                padding: '5px 8px 5px 26px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-white)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-input"
            style={{ width: 'auto', padding: '5px 28px 5px 8px', fontSize: 'var(--text-xs)' }}
          >
            <option value="all">Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Inline Quick Add */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '9px 12px',
          background: 'var(--bg-white)',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--border)',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <Plus size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Quick add — press Enter..."
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && quickTaskTitle.trim()) {
              e.preventDefault()
              addTask({
                title: quickTaskTitle.trim(),
                priority: 'medium',
                category: 'personal',
                completed: false,
                dueDate: todayStr,
              })
              setQuickTaskTitle('')
            }
          }}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            fontSize: 'var(--text-base)',
            color: 'var(--text-primary)',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        {quickTaskTitle.trim() && (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => {
              addTask({
                title: quickTaskTitle.trim(),
                priority: 'medium',
                category: 'personal',
                completed: false,
                dueDate: todayStr,
              })
              setQuickTaskTitle('')
            }}
          >
            Add
          </Button>
        )}
      </div>

      {/* Tasks List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-state__mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="32" height="4" fill="currentColor" />
              <rect x="8" y="22" width="24" height="4" fill="currentColor" />
              <rect x="8" y="32" width="16" height="4" fill="currentColor" />
            </svg>
            <div className="empty-state__title">No tasks here</div>
            <div className="empty-state__desc">
              {searchQuery || priorityFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add tasks to get started, or use the quick add bar above.'}
            </div>
            {!searchQuery && priorityFilter === 'all' && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Plan top 3 priorities', '90-min deep work block', 'Review notes'].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => addTask({ title: sug, priority: 'medium', category: 'personal', completed: false, dueDate: todayStr })}
                    className="filter-chip"
                  >
                    <Plus size={10} /> {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed
            const isExpanded = !!expandedTasks[task.id]

            return (
              <div key={task.id} className={`data-row ${task.completed ? 'data-row--done' : ''}`} style={{ borderLeft: isOverdue ? '2px solid var(--status-red)' : undefined }}>
                <div style={{ marginTop: '3px', flexShrink: 0 }}>
                  <Checkbox checked={task.completed} onChange={() => toggleTask(task.id)} />
                </div>

                <div className="data-row__content">
                  <div className="data-row__title" style={{ fontWeight: task.priority === 'urgent' || task.priority === 'high' ? 500 : 400 }}>
                    {task.title}
                    {isOverdue && (
                      <span style={{ marginLeft: '8px', fontSize: 'var(--text-xs)', color: 'var(--status-red)', fontWeight: 600 }}>
                        <AlertCircle size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '2px' }} />
                        Overdue
                      </span>
                    )}
                  </div>

                  <div className="data-row__meta">
                    {task.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} /> {task.dueDate}{task.dueTime ? ` · ${task.dueTime}` : ''}
                      </span>
                    )}
                    {task.category && <span style={{ textTransform: 'capitalize' }}>{task.category}</span>}
                    {task.tags && task.tags.map((tg, i) => (
                      <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Tag size={10} /> {tg}
                      </span>
                    ))}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(task.id) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '2px', padding: 0 }}
                      >
                        {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      </button>
                    )}
                  </div>

                  {task.description && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>{task.description}</div>
                  )}

                  {isExpanded && task.subtasks && (
                    <div style={{ marginTop: '8px', paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {task.subtasks.map((st) => (
                        <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Checkbox checked={st.completed} onChange={() => toggleSubtask(task.id, st.id)} />
                          <span style={{ fontSize: 'var(--text-sm)', textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecorationColor: 'var(--border-hover)' }}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="data-row__actions">
                  {task.priority !== 'low' && task.priority !== 'medium' && (
                    <Badge variant={task.priority === 'urgent' ? 'red' : 'amber'}>{task.priority}</Badge>
                  )}
                  <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--r-xs)' }} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
