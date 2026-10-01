import React, { useState } from 'react'
import {
  GraduationCap,
  Plus,
  BookOpen,
  FlaskConical,
  FileText,
  Calendar,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'
import { ProgressBar } from '../../components/ui/ProgressBar'

export const AcademicsModule: React.FC = () => {
  const {
    academics,
    toggleLectureSheet,
    toggleLabSheet,
    toggleAssignment,
    deleteSubject,
    openModal,
    profile,
  } = useApp()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(academics[0]?.id || '')

  const currentSubject = academics.find((s) => s.id === selectedSubjectId) || academics[0]

  // Calculate subject completion percentage
  const calculateSubjectProgress = (subj: typeof currentSubject) => {
    if (!subj) return 0
    let total = 0
    let done = 0

    subj.lectureSheets.forEach((ls) => {
      total++
      if (ls.completed) done++
    })

    subj.labSheets.forEach((lbs) => {
      total++
      if (lbs.completed) done++
    })

    subj.assignments.forEach((a) => {
      total++
      if (a.completed) done++
    })

    return total > 0 ? Math.round((done / total) * 100) : 0
  }

  // Calculate overall semester progress
  let overallTotal = 0
  let overallDone = 0
  academics.forEach((subj) => {
    subj.lectureSheets.forEach((ls) => {
      overallTotal++
      if (ls.completed) overallDone++
    })
    subj.labSheets.forEach((lbs) => {
      overallTotal++
      if (lbs.completed) overallDone++
    })
    subj.assignments.forEach((a) => {
      overallTotal++
      if (a.completed) overallDone++
    })
  })
  const overallSemesterProgress = overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">{profile.semester || 'Semester 5'} · Core Curriculum & Syllabi</div>
          <h1 className="page-title">Academics & Study Workspace</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => openModal('lecture_sheet', { subjectId: currentSubject?.id, nextNumber: (currentSubject?.lectureSheets.length ?? 0) + 1 })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Lecture Sheet
          </Button>
          <Button variant="secondary" onClick={() => openModal('lab_sheet', { subjectId: currentSubject?.id, nextNumber: (currentSubject?.labSheets.length ?? 0) + 1 })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Lab Sheet
          </Button>
          <Button variant="secondary" onClick={() => openModal('assignment', { subjectId: currentSubject?.id })} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Assignment
          </Button>
          <Button variant="primary" onClick={() => openModal('subject')} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={13} /> Subject
          </Button>
        </div>
      </div>

      {/* Overall Semester Progress Card */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Overall Semester Progress</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
              {overallSemesterProgress}% ({overallDone}/{overallTotal} deliverables)
            </span>
          </div>
          <ProgressBar progress={overallSemesterProgress} variant="blue" height={8} />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{academics.length}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Subjects</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {academics.reduce((acc, s) => acc + s.lectureSheets.length, 0)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Lecture Sheets</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>
              {academics.reduce((acc, s) => acc + s.labSheets.length, 0)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Lab Sheets</div>
          </div>
        </div>
      </div>

      {/* Subject Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {academics.map((subj) => {
          const isSelected = subj.id === currentSubject?.id
          const progress = calculateSubjectProgress(subj)
          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
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
                minWidth: '180px',
                textAlign: 'left',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{subj.code}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {subj.name}
                </div>
              </div>
              <Badge variant={progress === 100 ? 'green' : 'blue'}>{progress}%</Badge>
            </button>
          )
        })}
      </div>

      {/* Subject Detailed Workspace */}
      {currentSubject ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Subject Header */}
          <div
            style={{
              padding: '16px',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {currentSubject.code}: {currentSubject.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Instructor: {currentSubject.professor || 'Department Faculty'} · {currentSubject.semester}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="blue">Progress: {calculateSubjectProgress(currentSubject)}%</Badge>
              <button
                onClick={() => deleteSubject(currentSubject.id)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px' }}
                title="Delete Subject"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* 3-Column Structured Breakdown: Lecture Sheets / Lab Sheets / Assignments & Exams */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* 1. LECTURE SHEETS */}
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
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Lecture Sheets</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal('lecture_sheet', { subjectId: currentSubject.id, nextNumber: currentSubject.lectureSheets.length + 1 })}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Add Sheet
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentSubject.lectureSheets.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    No lecture sheets added yet.
                  </div>
                ) : (
                  currentSubject.lectureSheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-xs)',
                        background: sheet.completed ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        <Checkbox
                          checked={sheet.completed}
                          onChange={() => toggleLectureSheet(currentSubject.id, sheet.id)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: sheet.completed ? 'line-through' : 'none',
                          }}
                        >
                          Lecture Sheet #{sheet.number}: {sheet.title}
                        </div>
                        {sheet.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                            {sheet.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 2. LAB SHEETS */}
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
                  <FlaskConical size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Lab Sheets</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal('lab_sheet', { subjectId: currentSubject.id, nextNumber: currentSubject.labSheets.length + 1 })}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Add Lab
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentSubject.labSheets.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    No lab sheets added yet.
                  </div>
                ) : (
                  currentSubject.labSheets.map((lab) => (
                    <div
                      key={lab.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-xs)',
                        background: lab.completed ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        <Checkbox
                          checked={lab.completed}
                          onChange={() => toggleLabSheet(currentSubject.id, lab.id)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            textDecoration: lab.completed ? 'line-through' : 'none',
                          }}
                        >
                          Lab #{lab.number}: {lab.title}
                        </div>
                        {lab.notes && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                            {lab.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. ASSIGNMENTS & EXAMS */}
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
                  <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Assignments & Exams</h3>
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => openModal('assignment', { subjectId: currentSubject.id })}
                  style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Plus size={12} /> Add Assignment
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentSubject.assignments.map((as) => (
                  <div
                    key={as.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: as.completed ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      <Checkbox
                        checked={as.completed}
                        onChange={() => toggleAssignment(currentSubject.id, as.id)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          textDecoration: as.completed ? 'line-through' : 'none',
                        }}
                      >
                        {as.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                        Due: {as.dueDate} {as.weightPercentage ? `· Weight: ${as.weightPercentage}%` : ''}
                      </div>
                    </div>
                  </div>
                ))}

                {currentSubject.exams.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border-subtle)',
                      marginTop: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{ex.title}</span>
                      <Badge variant="amber">{ex.weightPercentage}% weight</Badge>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      Date: {ex.date} {ex.time ? `@ ${ex.time}` : ''} {ex.location ? `· ${ex.location}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
          No academic subjects found. Click "+ Subject" to add your first course.
        </div>
      )}
    </div>
  )
}
