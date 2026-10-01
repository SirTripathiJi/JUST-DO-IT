import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Dumbbell,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Trophy,
  Clock,
  Flame,
  Activity,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  X,
  Timer,
  Zap,
  RotateCcw,
  Save,
  ChevronLeft,
  FileText,
  Award,
  Sparkles,
  Edit3,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString, formatLocalDate } from '../../data/seedData'
import { Checkbox } from '../../components/ui/Checkbox'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import type { WorkoutSession, Exercise, ExerciseSet } from '../../types'

// ─── Constants & Catalogs ───────────────────────────────────────────────────

export interface SportActivityItem {
  id: string
  name: string
  category: 'sport' | 'recovery' | 'cardio'
  tracksDistance?: boolean
  icon: string
  defaultDuration?: number
  defaultDistance?: number
}

export const SPORT_ACTIVITIES: SportActivityItem[] = [
  { id: 'football', name: 'Football', category: 'sport', tracksDistance: true, icon: '⚽', defaultDuration: 60, defaultDistance: 5.0 },
  { id: 'badminton', name: 'Badminton', category: 'sport', tracksDistance: false, icon: '🏸', defaultDuration: 60 },
  { id: 'cricket', name: 'Cricket / Net Practice', category: 'sport', tracksDistance: false, icon: '🏏', defaultDuration: 90 },
  { id: 'walking', name: 'Walking', category: 'recovery', tracksDistance: true, icon: '🚶', defaultDuration: 30, defaultDistance: 2.5 },
  { id: 'running', name: 'Running', category: 'cardio', tracksDistance: true, icon: '🏃', defaultDuration: 30, defaultDistance: 5.0 },
  { id: 'cycling', name: 'Cycling', category: 'cardio', tracksDistance: true, icon: '🚴', defaultDuration: 45, defaultDistance: 15.0 },
  { id: 'stretching', name: 'Stretching', category: 'recovery', tracksDistance: false, icon: '🧘', defaultDuration: 20 },
  { id: 'mobility', name: 'Mobility', category: 'recovery', tracksDistance: false, icon: '🤸', defaultDuration: 25 },
  { id: 'basketball', name: 'Basketball', category: 'sport', tracksDistance: false, icon: '🏀', defaultDuration: 60 },
  { id: 'tennis', name: 'Tennis', category: 'sport', tracksDistance: false, icon: '🎾', defaultDuration: 60 },
  { id: 'swimming', name: 'Swimming', category: 'cardio', tracksDistance: true, icon: '🏊', defaultDuration: 40, defaultDistance: 1.0 },
  { id: 'yoga', name: 'Yoga', category: 'recovery', tracksDistance: false, icon: '🧘', defaultDuration: 45 },
]

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Abs', 'Cardio', 'Full Body',
  'Mobility', 'Active Recovery', 'Sport', 'Custom',
]

const WORKOUT_TYPE_MAP: Record<string, WorkoutSession['workoutType']> = {
  'Chest': 'strength', 'Back': 'strength', 'Shoulders': 'strength',
  'Biceps': 'strength', 'Triceps': 'strength', 'Legs': 'strength',
  'Glutes': 'strength', 'Abs': 'strength', 'Full Body': 'strength',
  'Cardio': 'cardio', 'Mobility': 'mobility', 'Active Recovery': 'recovery',
  'Sport': 'sports', 'Custom': 'custom',
}

const RATING_LABELS: Record<number, string> = {
  1: 'Rough · High Fatigue',
  2: 'Fair · Below Average',
  3: 'Solid · Good Effort',
  4: 'Great · High Output',
  5: 'Phenomenal · Peak Performance',
}

const ENERGY_OPTIONS = [
  { level: 1 as const, label: 'Exhausted', desc: 'Drained / Low reserves' },
  { level: 2 as const, label: 'Low', desc: 'Sluggish start' },
  { level: 3 as const, label: 'Moderate', desc: 'Steady & balanced' },
  { level: 4 as const, label: 'High', desc: 'Strong & energized' },
  { level: 5 as const, label: 'Peak', desc: 'Unstoppable drive' },
]

const DIFFICULTY_OPTIONS = [
  { level: 1 as const, label: 'Very Easy', desc: 'Active recovery' },
  { level: 2 as const, label: 'Easy', desc: 'Comfortable pace' },
  { level: 3 as const, label: 'Moderate', desc: 'Target effort' },
  { level: 4 as const, label: 'Hard', desc: 'Pushed close to limit' },
  { level: 5 as const, label: 'Max Effort', desc: 'Extreme push / Failure' },
]

const PRESET_TEMPLATES: Array<{
  name: string
  muscles: string[]
  exercises: string[]
  sportActivity?: string
  workoutType?: WorkoutSession['workoutType']
  defaultDuration?: number
  defaultDistance?: number
}> = [
  { name: 'Chest & Triceps', muscles: ['Chest', 'Triceps'], exercises: ['Bench Press', 'Incline Dumbbell Press', 'Cable Fly', 'Tricep Pushdown', 'Overhead Tricep Extension'] },
  { name: 'Back & Biceps', muscles: ['Back', 'Biceps'], exercises: ['Deadlift', 'Barbell Row', 'Lat Pulldown', 'Cable Row', 'Barbell Curl', 'Hammer Curl'] },
  { name: 'Shoulders & Cardio', muscles: ['Shoulders', 'Cardio'], exercises: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Treadmill Run'] },
  { name: 'Legs & Abs', muscles: ['Legs', 'Glutes', 'Abs'], exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Lunges', 'Calf Raise', 'Plank', 'Crunches'] },
  { name: 'Full Body', muscles: ['Full Body'], exercises: ['Squat', 'Bench Press', 'Barbell Row', 'Overhead Press', 'Deadlift'] },
  { name: 'Push Day', muscles: ['Chest', 'Shoulders', 'Triceps'], exercises: ['Bench Press', 'Overhead Press', 'Incline Press', 'Lateral Raise', 'Tricep Pushdown'] },
  { name: 'Pull Day', muscles: ['Back', 'Biceps'], exercises: ['Deadlift', 'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Bicep Curl'] },
  // Active Recovery & Sports Presets
  { name: 'Football Match / Training', muscles: ['Sport'], exercises: [], sportActivity: 'Football', workoutType: 'sports', defaultDuration: 60, defaultDistance: 5.0 },
  { name: 'Badminton Session', muscles: ['Sport'], exercises: [], sportActivity: 'Badminton', workoutType: 'sports', defaultDuration: 60 },
  { name: 'Cricket / Net Practice', muscles: ['Sport'], exercises: [], sportActivity: 'Cricket / Net Practice', workoutType: 'sports', defaultDuration: 90 },
  { name: 'Outdoor Run', muscles: ['Cardio', 'Sport'], exercises: [], sportActivity: 'Running', workoutType: 'cardio', defaultDuration: 30, defaultDistance: 5.0 },
  { name: 'Cycling Ride', muscles: ['Cardio', 'Sport'], exercises: [], sportActivity: 'Cycling', workoutType: 'cardio', defaultDuration: 45, defaultDistance: 15.0 },
  { name: 'Active Recovery Walk', muscles: ['Active Recovery'], exercises: [], sportActivity: 'Walking', workoutType: 'recovery', defaultDuration: 35, defaultDistance: 3.0 },
  { name: 'Stretching & Mobility Flow', muscles: ['Mobility', 'Active Recovery'], exercises: ['Dynamic Hip & Spine Warmup', 'Hamstring Openers', 'Thoracic Spine Rotations', 'Ankle & Shoulder Mobility'], sportActivity: 'Mobility', workoutType: 'mobility', defaultDuration: 25 },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function genId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function makeSet(num: number): ExerciseSet {
  return { id: genId('set'), setNumber: num, reps: 0, weightKg: 0, completed: false }
}

function makeExercise(name: string, muscle: string): Exercise {
  return {
    id: genId('ex'),
    name,
    targetMuscle: muscle,
    sets: [makeSet(1), makeSet(2), makeSet(3)],
    notes: '',
  }
}

function calcVolume(session: WorkoutSession): number {
  return session.exercises.reduce((total, ex) =>
    total + ex.sets.reduce((s, set) => s + (set.completed ? set.weightKg * set.reps : 0), 0), 0)
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function autoTitle(muscles: string[], date: string, sportActivity?: string): string {
  const d = new Date(date + 'T12:00:00')
  const day = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
  if (sportActivity) {
    return `${sportActivity} · ${day}`
  }
  if (muscles.length === 0) return `Workout · ${day}`
  const groups = muscles.slice(0, 2).join(' & ')
  return `${groups} · ${day}`
}

// ─── Star Rating Component ──────────────────────────────────────────────────

const StarRating: React.FC<{
  value: number
  onChange: (v: number) => void
  label?: string
  size?: number
}> = ({ value, onChange, label, size = 20 }) => {
  const [hoverVal, setHoverVal] = useState(0)
  const activeVal = hoverVal || value

  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
            {label}
          </span>
          {activeVal > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {RATING_LABELS[activeVal] || ''}
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHoverVal(n)}
            onMouseLeave={() => setHoverVal(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              color: n <= activeVal ? 'var(--text-primary)' : 'var(--border-strong)',
              fontSize: `${size}px`,
              lineHeight: 1,
              transition: 'all 80ms ease',
              transform: n <= activeVal ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Set Row ────────────────────────────────────────────────────────────────

const SetRow: React.FC<{
  set: ExerciseSet
  onChange: (updated: ExerciseSet) => void
  onDelete: () => void
  prevWeight?: number
  prevReps?: number
}> = ({ set, onChange, onDelete, prevWeight, prevReps }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', width: '18px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
      {set.setNumber}
    </span>

    {prevWeight && prevReps ? (
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', width: '56px', fontVariantNumeric: 'tabular-nums' }}>
        {prevWeight}×{prevReps}
      </span>
    ) : (
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--border-strong)', width: '56px' }}>— prev</span>
    )}

    <input
      type="number"
      min="0"
      placeholder="kg"
      value={set.weightKg === 0 ? '' : set.weightKg}
      onChange={(e) => onChange({ ...set, weightKg: parseFloat(e.target.value) || 0 })}
      style={{
        width: '58px', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
        background: 'var(--bg-white)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
        textAlign: 'center', outline: 'none',
      }}
    />
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>kg</span>

    <input
      type="number"
      min="0"
      placeholder="reps"
      value={set.reps === 0 ? '' : set.reps}
      onChange={(e) => onChange({ ...set, reps: parseInt(e.target.value) || 0 })}
      style={{
        width: '52px', padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
        background: 'var(--bg-white)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)',
        textAlign: 'center', outline: 'none',
      }}
    />
    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>reps</span>

    <div style={{ marginLeft: 'auto' }}>
      <Checkbox
        checked={set.completed}
        onChange={() => onChange({ ...set, completed: !set.completed })}
      />
    </div>

    <button
      onClick={onDelete}
      style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px', borderRadius: 'var(--r-xs)' }}
    >
      <X size={12} />
    </button>
  </div>
)

// ─── Exercise Block ─────────────────────────────────────────────────────────

const ExerciseBlock: React.FC<{
  exercise: Exercise
  onChange: (ex: Exercise) => void
  onDelete: () => void
  prWeight?: number
}> = ({ exercise, onChange, onDelete, prWeight }) => {
  const updateSet = (setId: string, updated: ExerciseSet) => {
    onChange({ ...exercise, sets: exercise.sets.map((s) => s.id === setId ? updated : s) })
  }
  const deleteSet = (setId: string) => {
    onChange({ ...exercise, sets: exercise.sets.filter((s) => s.id !== setId).map((s, i) => ({ ...s, setNumber: i + 1 })) })
  }
  const addSet = () => {
    onChange({ ...exercise, sets: [...exercise.sets, makeSet(exercise.sets.length + 1)] })
  }

  const completedSets = exercise.sets.filter((s) => s.completed).length

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', marginBottom: '12px', background: 'var(--bg-white)' }}>
      {/* Exercise Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => onChange({ ...exercise, name: e.target.value })}
          placeholder="Exercise name (e.g. Bench Press, Shuttle Runs)..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontSize: 'var(--text-base)', fontWeight: 500, color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
        />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', flexShrink: 0 }}>
          {completedSets}/{exercise.sets.length} sets
        </span>
        {prWeight && prWeight > 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Trophy size={10} /> {prWeight}kg PR
          </span>
        )}
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px', borderRadius: 'var(--r-xs)' }}>
          <Trash2 size={13} />
        </button>
      </div>

      {/* Sets */}
      <div style={{ padding: '0 14px 8px' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '6px 0 2px', marginBottom: '2px' }}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', width: '18px', textAlign: 'center', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>#</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', width: '56px', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>Prev</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>Weight</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', marginLeft: '28px' }}>Reps</span>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', marginLeft: 'auto', letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>✓</span>
        </div>

        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onChange={(updated) => updateSet(set.id, updated)}
            onDelete={() => deleteSet(set.id)}
          />
        ))}

        <button
          onClick={addSet}
          style={{
            marginTop: '8px', background: 'none', border: '1px dashed var(--border)',
            borderRadius: 'var(--r-xs)', padding: '4px 10px', fontSize: 'var(--text-xs)',
            color: 'var(--text-tertiary)', cursor: 'pointer', width: '100%',
            transition: 'border-color 80ms ease, color 80ms ease',
          }}
        >
          + Add Set
        </button>
      </div>
    </div>
  )
}

// ─── Reusable Workout Review Form ───────────────────────────────────────────

interface WorkoutReviewData {
  rating: number
  energyLevel: 1 | 2 | 3 | 4 | 5 | undefined
  difficulty: 1 | 2 | 3 | 4 | 5 | undefined
  notes: string
  reflection: string
}

const WorkoutReviewFields: React.FC<{
  data: WorkoutReviewData
  onChange: (patch: Partial<WorkoutReviewData>) => void
}> = ({ data, onChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1-5 Star Rating */}
      <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
        <StarRating
          label="Session Rating (1–5 Stars)"
          value={data.rating}
          onChange={(v) => onChange({ rating: v })}
          size={24}
        />
      </div>

      {/* Energy Level */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
            Energy Level
          </span>
          {data.energyLevel && (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {ENERGY_OPTIONS.find((e) => e.level === data.energyLevel)?.label} · {ENERGY_OPTIONS.find((e) => e.level === data.energyLevel)?.desc}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {ENERGY_OPTIONS.map((opt) => {
            const active = data.energyLevel === opt.level
            return (
              <button
                key={opt.level}
                type="button"
                onClick={() => onChange({ energyLevel: opt.level })}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--r-sm)',
                  border: active ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                  background: active ? 'var(--text-primary)' : 'var(--bg-white)',
                  color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 80ms ease',
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, lineHeight: 1.2 }}>{opt.level}</div>
                <div style={{ fontSize: 'var(--text-2xs)', marginTop: '2px', opacity: active ? 0.9 : 0.7 }}>{opt.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
            Difficulty
          </span>
          {data.difficulty && (
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {DIFFICULTY_OPTIONS.find((d) => d.level === data.difficulty)?.label} · {DIFFICULTY_OPTIONS.find((d) => d.level === data.difficulty)?.desc}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {DIFFICULTY_OPTIONS.map((opt) => {
            const active = data.difficulty === opt.level
            return (
              <button
                key={opt.level}
                type="button"
                onClick={() => onChange({ difficulty: opt.level })}
                style={{
                  padding: '8px 4px',
                  borderRadius: 'var(--r-sm)',
                  border: active ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                  background: active ? 'var(--text-primary)' : 'var(--bg-white)',
                  color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 80ms ease',
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, lineHeight: 1.2 }}>{opt.level}</div>
                <div style={{ fontSize: 'var(--text-2xs)', marginTop: '2px', opacity: active ? 0.9 : 0.7 }}>{opt.label}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* “How did I feel?” reflection */}
      <div className="field">
        <label className="field__label" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={12} /> “How did I feel?” Reflection
        </label>
        <textarea
          className="textarea"
          value={data.reflection}
          onChange={(e) => onChange({ reflection: e.target.value })}
          placeholder="Reflect on your physical sensations, mental clarity, mindset, recovery needs, or proud moments..."
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="field">
        <label className="field__label">Session Notes (optional)</label>
        <textarea
          className="textarea"
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Specific cues, gear, weights, weather, partners, or sets details..."
          rows={2}
        />
      </div>
    </div>
  )
}

// ─── Dedicated Workout Review Modal (for reviewing any session) ─────────────

const WorkoutReviewModal: React.FC<{
  session: WorkoutSession | null
  onClose: () => void
  onSave: (updated: WorkoutSession) => void
}> = ({ session, onClose, onSave }) => {
  const [form, setForm] = useState<WorkoutReviewData>({
    rating: session?.rating || 0,
    energyLevel: session?.energyLevel,
    difficulty: session?.difficulty,
    notes: session?.notes || '',
    reflection: session?.reflection || '',
  })

  useEffect(() => {
    if (session) {
      setForm({
        rating: session.rating || 0,
        energyLevel: session.energyLevel,
        difficulty: session.difficulty,
        notes: session.notes || '',
        reflection: session.reflection || '',
      })
    }
  }, [session])

  if (!session) return null

  const handleSave = () => {
    onSave({
      ...session,
      rating: form.rating,
      energyLevel: form.energyLevel,
      difficulty: form.difficulty,
      notes: form.notes || undefined,
      reflection: form.reflection || undefined,
      completed: true,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={!!session}
      onClose={onClose}
      title="Workout Review"
      maxWidth="540px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} leftIcon={<Save size={13} />}>
            Save Review
          </Button>
        </>
      }
    >
      <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{session.title}</div>
        <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '4px', flexWrap: 'wrap' }}>
          <span>{session.date}</span>
          {session.durationMinutes > 0 && <span>{session.durationMinutes} min</span>}
          {session.distance && <span>{session.distance} km</span>}
          {session.sportActivity && <span>Activity: {session.sportActivity}</span>}
          {session.exercises.length > 0 && <span>{session.exercises.length} exercises</span>}
        </div>
      </div>

      <WorkoutReviewFields
        data={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      />
    </Modal>
  )
}

// ─── Workout Builder (multi-step inline form) ───────────────────────────────

type BuilderStep = 'focus' | 'exercises' | 'details' | 'review'

interface BuilderState {
  step: BuilderStep
  focusMode: 'gym' | 'sport'
  selectedMuscles: string[]
  sportActivity: string
  customSportName: string
  exercises: Exercise[]
  title: string
  date: string
  durationMinutes: number
  timerSecs: number
  timerRunning: boolean
  rating: number
  energyLevel: 1 | 2 | 3 | 4 | 5 | undefined
  difficulty: 1 | 2 | 3 | 4 | 5 | undefined
  notes: string
  reflection: string
  distance: number
  workoutType: WorkoutSession['workoutType']
}

const WorkoutBuilder: React.FC<{
  onSave: (session: Omit<WorkoutSession, 'id' | 'createdAt'>) => void
  onCancel: () => void
  personalRecords: Record<string, any>
  templateExercises?: Exercise[]
  templateMuscles?: string[]
  templateTitle?: string
  initialSportActivity?: string
}> = ({
  onSave,
  onCancel,
  personalRecords,
  templateExercises,
  templateMuscles,
  templateTitle,
  initialSportActivity,
}) => {
  const today = getTodayDateString()
  const isSportInitial = !!initialSportActivity || (templateMuscles && (templateMuscles.includes('Sport') || templateMuscles.includes('Active Recovery')))

  const [state, setState] = useState<BuilderState>({
    step: templateExercises ? 'exercises' : 'focus',
    focusMode: isSportInitial ? 'sport' : 'gym',
    selectedMuscles: templateMuscles || [],
    sportActivity: initialSportActivity || '',
    customSportName: '',
    exercises: templateExercises || [],
    title: templateTitle || '',
    date: today,
    durationMinutes: 0,
    timerSecs: 0,
    timerRunning: false,
    rating: 0,
    energyLevel: undefined,
    difficulty: undefined,
    notes: '',
    reflection: '',
    distance: 0,
    workoutType: isSportInitial ? 'sports' : 'strength',
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.timerRunning) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, timerSecs: prev.timerSecs + 1 }))
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [state.timerRunning])

  const update = (patch: Partial<BuilderState>) => setState((prev) => ({ ...prev, ...patch }))

  const toggleMuscle = (m: string) => {
    const next = state.selectedMuscles.includes(m)
      ? state.selectedMuscles.filter((x) => x !== m)
      : [...state.selectedMuscles, m]
    update({ selectedMuscles: next })
  }

  const selectSport = (sport: SportActivityItem) => {
    const currentActivity = state.sportActivity === sport.name ? '' : sport.name
    const isSelected = currentActivity === sport.name
    const nextMuscles = isSelected
      ? (sport.category === 'recovery' ? ['Active Recovery'] : sport.category === 'cardio' ? ['Cardio'] : ['Sport'])
      : []
    const nextType: WorkoutSession['workoutType'] = isSelected
      ? (sport.category === 'recovery' ? 'recovery' : sport.category === 'cardio' ? 'cardio' : 'sports')
      : 'sports'

    update({
      sportActivity: currentActivity,
      selectedMuscles: nextMuscles,
      workoutType: nextType,
      durationMinutes: isSelected && sport.defaultDuration ? sport.defaultDuration : state.durationMinutes,
      distance: isSelected && sport.defaultDistance ? sport.defaultDistance : state.distance,
      title: isSelected ? autoTitle(nextMuscles, state.date, currentActivity) : state.title,
    })
  }

  const loadTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    const exs = tpl.exercises.map((name, i) =>
      makeExercise(name, tpl.muscles[Math.min(i, tpl.muscles.length - 1)] || 'Custom')
    )
    const isSport = !!tpl.sportActivity || tpl.muscles.includes('Sport') || tpl.muscles.includes('Active Recovery')
    update({
      focusMode: isSport ? 'sport' : 'gym',
      selectedMuscles: tpl.muscles,
      sportActivity: tpl.sportActivity || '',
      exercises: exs,
      title: tpl.name,
      workoutType: tpl.workoutType || (WORKOUT_TYPE_MAP[tpl.muscles[0]] || 'custom'),
      durationMinutes: tpl.defaultDuration || 0,
      distance: tpl.defaultDistance || 0,
      step: exs.length > 0 ? 'exercises' : 'details',
    })
  }

  const proceedToExercises = () => {
    const isSport = state.focusMode === 'sport'
    const finalSport = state.sportActivity === 'Custom' ? (state.customSportName.trim() || 'Custom Activity') : state.sportActivity
    const muscles = isSport
      ? (state.selectedMuscles.length > 0 ? state.selectedMuscles : ['Sport'])
      : state.selectedMuscles

    const wtype = isSport
      ? (state.workoutType || 'sports')
      : (muscles.length > 0 ? (WORKOUT_TYPE_MAP[muscles[0]] || 'custom') : 'custom')

    const generatedTitle = autoTitle(muscles, state.date, isSport ? finalSport : undefined)
    update({
      workoutType: wtype,
      selectedMuscles: muscles,
      title: generatedTitle,
      step: 'exercises',
    })
  }

  const proceedToDetails = () => update({ step: 'details' })

  const proceedToReview = () => {
    const elapsed = Math.round(state.timerSecs / 60)
    update({
      step: 'review',
      durationMinutes: state.durationMinutes || elapsed || 0,
      timerRunning: false,
    })
  }

  const handleSave = () => {
    const isSport = state.focusMode === 'sport'
    const finalSport = state.sportActivity === 'Custom'
      ? (state.customSportName.trim() || 'Custom Activity')
      : (state.sportActivity || undefined)

    const session: Omit<WorkoutSession, 'id' | 'createdAt'> = {
      date: state.date,
      title: state.title || autoTitle(state.selectedMuscles, state.date, finalSport),
      workoutType: state.workoutType,
      muscleGroups: state.selectedMuscles,
      sportActivity: finalSport,
      exercises: state.exercises,
      durationMinutes: state.durationMinutes,
      rating: state.rating,
      energyLevel: state.energyLevel,
      difficulty: state.difficulty,
      notes: state.notes || undefined,
      reflection: state.reflection || undefined,
      distance: state.distance || undefined,
      completed: true,
    }
    onSave(session)
  }

  const isSportOrRecovery =
    state.focusMode === 'sport' ||
    state.selectedMuscles.includes('Active Recovery') ||
    state.selectedMuscles.includes('Sport') ||
    !!state.sportActivity

  const totalSetsCompleted = state.exercises.reduce((t, ex) => t + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = state.exercises.reduce((t, ex) => t + ex.sets.length, 0)
  const totalVolume = state.exercises.reduce((t, ex) =>
    t + ex.sets.reduce((s, set) => s + (set.completed ? set.weightKg * set.reps : 0), 0), 0)

  // ── Step 1: Focus & Activity Selection ────────────────────────────────────
  if (state.step === 'focus') {
    return (
      <div className="animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)' }}>Step 1 of 4</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginTop: '2px' }}>What's today's focus?</h2>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode switcher: Gym vs Active Recovery & Sports */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', padding: '4px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => update({ focusMode: 'gym' })}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none',
              background: state.focusMode === 'gym' ? 'var(--bg-white)' : 'transparent',
              color: state.focusMode === 'gym' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: state.focusMode === 'gym' ? 'var(--shadow-sm)' : 'none',
              fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 80ms ease',
            }}
          >
            <Dumbbell size={14} /> Gym & Strength Splits
          </button>
          <button
            type="button"
            onClick={() => update({ focusMode: 'sport' })}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none',
              background: state.focusMode === 'sport' ? 'var(--bg-white)' : 'transparent',
              color: state.focusMode === 'sport' ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: state.focusMode === 'sport' ? 'var(--shadow-sm)' : 'none',
              fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              transition: 'all 80ms ease',
            }}
          >
            <Activity size={14} /> Active Recovery & Sports
          </button>
        </div>

        {/* Focus Mode: GYM */}
        {state.focusMode === 'gym' && (
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
              Select one or more muscle groups for today's workout:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginBottom: '28px' }}>
              {MUSCLE_GROUPS.map((m) => {
                const active = state.selectedMuscles.includes(m)
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMuscle(m)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--r-md)',
                      border: active ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                      background: active ? 'var(--text-primary)' : 'var(--bg-white)',
                      color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 100ms ease',
                      textAlign: 'center',
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Focus Mode: ACTIVE RECOVERY & SPORTS */}
        {state.focusMode === 'sport' && (
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
              Select an activity (Football, Badminton, Cricket, Walking, Running, Cycling, Mobility, or Custom):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '16px' }}>
              {SPORT_ACTIVITIES.map((sport) => {
                const active = state.sportActivity === sport.name
                return (
                  <button
                    key={sport.id}
                    type="button"
                    onClick={() => selectSport(sport)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--r-md)',
                      border: active ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                      background: active ? 'var(--text-primary)' : 'var(--bg-white)',
                      color: active ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 100ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{sport.icon}</span>
                    <span>{sport.name}</span>
                    {sport.tracksDistance && (
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>tracks distance</span>
                    )}
                  </button>
                )
              })}

              {/* Custom Activity Tile */}
              <button
                type="button"
                onClick={() => update({ sportActivity: 'Custom', workoutType: 'custom', selectedMuscles: ['Sport'] })}
                style={{
                  padding: '12px 10px',
                  borderRadius: 'var(--r-md)',
                  border: state.sportActivity === 'Custom' ? '1.5px solid var(--text-primary)' : '1px solid var(--border)',
                  background: state.sportActivity === 'Custom' ? 'var(--text-primary)' : 'var(--bg-white)',
                  color: state.sportActivity === 'Custom' ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: state.sportActivity === 'Custom' ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 100ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '18px' }}>⚡</span>
                <span>Custom Activity</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>enter any name</span>
              </button>
            </div>

            {state.sportActivity === 'Custom' && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  value={state.customSportName}
                  onChange={(e) => update({ customSportName: e.target.value })}
                  placeholder="e.g. Net Practice, Rock Climbing, Kayaking..."
                  className="input"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}

        {/* Quick templates */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)', marginBottom: '10px' }}>
            Suggested Quick Templates
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PRESET_TEMPLATES
              .filter((tpl) => state.focusMode === 'sport' ? (tpl.sportActivity || tpl.muscles.includes('Sport') || tpl.muscles.includes('Active Recovery')) : !tpl.sportActivity)
              .map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => loadTemplate(tpl)}
                  style={{
                    padding: '5px 12px', borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--border)', background: 'var(--bg-white)',
                    color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 80ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                >
                  {tpl.name}
                </button>
              ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onCancel} className="btn btn--ghost btn--md">Cancel</button>
          <button
            onClick={proceedToExercises}
            disabled={state.focusMode === 'gym' ? state.selectedMuscles.length === 0 : !state.sportActivity}
            className="btn btn--primary btn--md"
            style={{ opacity: (state.focusMode === 'gym' ? state.selectedMuscles.length === 0 : !state.sportActivity) ? 0.4 : 1 }}
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Exercises & Drills ────────────────────────────────────────────
  if (state.step === 'exercises') {
    return (
      <div className="animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => update({ step: 'focus' })} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)' }}>Step 2 of 4</div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                {isSportOrRecovery ? 'Exercises & Drills (Optional)' : 'Log your exercises'}
              </h2>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Focus label & live timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', marginBottom: '16px', border: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '1px' }}>Focus Activity</div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
              {state.sportActivity ? `${state.sportActivity} (${state.selectedMuscles.join(' · ') || 'Activity'})` : state.selectedMuscles.join(' · ') || 'Custom'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {formatDuration(state.timerSecs)}
            </span>
            <button
              onClick={() => update({ timerRunning: !state.timerRunning })}
              style={{
                background: state.timerRunning ? 'var(--text-primary)' : 'var(--bg-white)',
                color: state.timerRunning ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                padding: '4px 10px', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              <Timer size={11} /> {state.timerRunning ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => update({ timerSecs: 0, timerRunning: false })} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
              <RotateCcw size={12} />
            </button>
          </div>
        </div>

        {/* Sport/Recovery helper banner */}
        {isSportOrRecovery && (
          <div style={{ padding: '12px 14px', background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Active recovery and sports sessions track duration, distance, and reviews. Adding individual exercise sets is entirely optional.
            </div>
            <button
              onClick={proceedToDetails}
              className="btn btn--secondary btn--sm"
              style={{ flexShrink: 0 }}
            >
              Skip to Details →
            </button>
          </div>
        )}

        {/* Live stats */}
        {totalSets > 0 && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            <span>{totalSetsCompleted}/{totalSets} sets done</span>
            {totalVolume > 0 && <span>{totalVolume.toLocaleString()} kg volume</span>}
          </div>
        )}

        {/* Exercise blocks */}
        <div>
          {state.exercises.map((ex) => (
            <ExerciseBlock
              key={ex.id}
              exercise={ex}
              onChange={(updated) => update({ exercises: state.exercises.map((e) => e.id === updated.id ? updated : e) })}
              onDelete={() => update({ exercises: state.exercises.filter((e) => e.id !== ex.id) })}
              prWeight={personalRecords[ex.name.toLowerCase().trim()]?.weightKg}
            />
          ))}
        </div>

        {/* Add exercise */}
        <button
          onClick={() => {
            const defaultMuscle = state.selectedMuscles[0] || state.sportActivity || 'Custom'
            update({ exercises: [...state.exercises, makeExercise('', defaultMuscle)] })
          }}
          style={{
            width: '100%', padding: '11px', marginBottom: '20px',
            border: '1px dashed var(--border)', borderRadius: 'var(--r-md)',
            background: 'transparent', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <Plus size={14} /> Add {isSportOrRecovery ? 'Drill or Exercise' : 'Exercise'}
        </button>

        {!isSportOrRecovery && state.exercises.length === 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Quick add from your focus:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {PRESET_TEMPLATES
                .filter((t) => t.muscles.some((m) => state.selectedMuscles.includes(m)))
                .flatMap((t) => t.exercises)
                .filter((v, i, a) => a.indexOf(v) === i)
                .slice(0, 8)
                .map((name) => (
                  <button
                    key={name}
                    onClick={() => update({ exercises: [...state.exercises, makeExercise(name, state.selectedMuscles[0] || 'Custom')] })}
                    style={{
                      padding: '4px 10px', borderRadius: 'var(--r-pill)', border: '1px solid var(--border)',
                      background: 'var(--bg-white)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                    }}
                  >
                    + {name}
                  </button>
                ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={() => update({ step: 'focus' })} className="btn btn--ghost btn--md">Back</button>
          <button onClick={proceedToDetails} className="btn btn--primary btn--md">
            Continue →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 3: Session Details ───────────────────────────────────────────────
  if (state.step === 'details') {
    return (
      <div className="animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => update({ step: 'exercises' })} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)' }}>Step 3 of 4</div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Duration & Details</h2>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="field">
            <label className="field__label">Session Title</label>
            <input
              className="input"
              type="text"
              value={state.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Session title..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="field">
              <label className="field__label">Date</label>
              <input className="input" type="date" value={state.date} onChange={(e) => update({ date: e.target.value })} />
            </div>
            <div className="field">
              <label className="field__label">Duration (minutes)</label>
              <input
                className="input"
                type="number"
                min="0"
                placeholder={state.timerSecs > 0 ? `${Math.round(state.timerSecs / 60)} (from timer)` : 'e.g. 45'}
                value={state.durationMinutes === 0 ? '' : state.durationMinutes}
                onChange={(e) => update({ durationMinutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Quick duration chips */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Presets:</span>
            {[20, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => update({ durationMinutes: mins })}
                style={{
                  padding: '3px 8px', borderRadius: 'var(--r-pill)',
                  border: state.durationMinutes === mins ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  background: state.durationMinutes === mins ? 'var(--text-primary)' : 'var(--bg-white)',
                  color: state.durationMinutes === mins ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  fontSize: 'var(--text-xs)', cursor: 'pointer',
                }}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Distance field */}
          <div className="field">
            <label className="field__label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Distance (km, optional)</span>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)', textTransform: 'none' }}>
                Ideal for Running, Cycling, Walking, Football
              </span>
            </label>
            <input
              className="input"
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 5.2"
              value={state.distance === 0 ? '' : state.distance}
              onChange={(e) => update({ distance: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="field">
            <label className="field__label">Session Notes (optional)</label>
            <textarea
              className="textarea"
              value={state.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Specific drills, court/pitch conditions, intensity, or workout notes..."
              rows={2}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
          <button onClick={() => update({ step: 'exercises' })} className="btn btn--ghost btn--md">Back</button>
          <button onClick={proceedToReview} className="btn btn--primary btn--md">
            Review Session →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 4: Workout Review ────────────────────────────────────────────────
  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => update({ step: 'details' })} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-tertiary)' }}>Step 4 of 4</div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Workout Review</h2>
          </div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '6px' }}>
          <X size={18} />
        </button>
      </div>

      {/* Session summary strip */}
      <div style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: '24px', background: 'var(--bg-subtle)' }}>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>{state.title}</div>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} /> {state.durationMinutes || Math.round(state.timerSecs / 60)} min
          </span>
          {state.distance > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={11} /> {state.distance} km
            </span>
          )}
          {state.sportActivity && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Activity: {state.sportActivity}
            </span>
          )}
          {state.exercises.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Dumbbell size={11} /> {state.exercises.length} exercises ({totalSetsCompleted}/{totalSets} sets)
            </span>
          )}
          {totalVolume > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BarChart3 size={11} /> {totalVolume.toLocaleString()} kg volume
            </span>
          )}
        </div>
      </div>

      {/* Review Form Fields */}
      <WorkoutReviewFields
        data={{
          rating: state.rating,
          energyLevel: state.energyLevel,
          difficulty: state.difficulty,
          notes: state.notes,
          reflection: state.reflection,
        }}
        onChange={(patch) => update(patch)}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '28px' }}>
        <button onClick={() => update({ step: 'details' })} className="btn btn--ghost btn--md">Back</button>
        <button onClick={handleSave} className="btn btn--primary btn--md" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Save size={14} /> Save Session & Review
        </button>
      </div>
    </div>
  )
}

// ─── Session Card Component ─────────────────────────────────────────────────

const SessionCard: React.FC<{
  session: WorkoutSession
  onDelete: () => void
  onSaveTemplate: () => void
  onOpenReview: (session: WorkoutSession) => void
  expanded?: boolean
  onToggleExpand?: () => void
}> = ({ session, onDelete, onSaveTemplate, onOpenReview, expanded, onToggleExpand }) => {
  const volume = calcVolume(session)
  const completedSets = session.exercises.reduce((t, ex) => t + ex.sets.filter((s) => s.completed).length, 0)
  const totalSets = session.exercises.reduce((t, ex) => t + ex.sets.length, 0)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-white)', transition: 'border-color 80ms ease' }}>
      {/* Header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: onToggleExpand ? 'pointer' : 'default' }}
        onClick={onToggleExpand}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {session.title}
            </span>
            {session.sportActivity && (
              <span style={{ fontSize: 'var(--text-2xs)', padding: '2px 7px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--r-pill)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {session.sportActivity}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CalendarDays size={11} /> {session.date}
            </span>
            {session.durationMinutes > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} /> {session.durationMinutes}m
              </span>
            )}
            {session.distance && session.distance > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Activity size={11} /> {session.distance} km
              </span>
            )}
            {session.exercises.length > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Dumbbell size={11} /> {session.exercises.length} exercises
              </span>
            )}
            {volume > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <BarChart3 size={11} /> {volume.toLocaleString()}kg
              </span>
            )}
          </div>
        </div>

        {/* Badges & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {session.rating > 0 && (
            <span style={{ fontSize: 'var(--text-xs)', display: 'flex', gap: '1px', color: 'var(--text-primary)' }}>
              {'★'.repeat(session.rating)}
            </span>
          )}
          {session.energyLevel && (
            <span style={{ fontSize: 'var(--text-2xs)', padding: '2px 6px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-xs)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              ⚡ {session.energyLevel}/5
            </span>
          )}
          {session.difficulty && (
            <span style={{ fontSize: 'var(--text-2xs)', padding: '2px 6px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-xs)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              🔥 {session.difficulty}/5
            </span>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onOpenReview(session) }}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
              padding: '3px 8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
            }}
            title="Review session"
          >
            <Edit3 size={11} /> {session.rating > 0 || session.reflection ? 'Review' : '+ Review'}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onSaveTemplate() }}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--r-xs)' }}
            title="Save as template"
          >
            <Save size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', borderRadius: 'var(--r-xs)' }}
            title="Delete session"
          >
            <Trash2 size={13} />
          </button>
          {onToggleExpand && (expanded ? <ChevronDown size={15} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronRight size={15} style={{ color: 'var(--text-tertiary)' }} />)}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg-subtle)' }}>
          {session.exercises.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              {session.exercises.map((ex) => (
                <div key={ex.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '10px', background: 'var(--bg-white)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{ex.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 400 }}>{ex.targetMuscle}</span>
                  </div>
                  {ex.sets.map((set) => (
                    <div key={set.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: '1px solid var(--border)', fontSize: 'var(--text-xs)' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Set {set.setNumber}</span>
                      <span style={{ color: set.completed ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: set.completed ? 600 : 400 }}>
                        {set.weightKg}kg × {set.reps}
                      </span>
                      {set.completed && <CheckCircle2 size={11} style={{ color: 'var(--text-secondary)' }} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Review Card */}
          <div style={{ padding: '14px 16px', background: 'var(--bg-white)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>
                Session Review & Reflection
              </span>
              <button
                onClick={() => onOpenReview(session)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
              >
                <Edit3 size={11} /> Edit Review
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '10px', fontSize: 'var(--text-xs)' }}>
              {session.rating > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Rating:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{'★'.repeat(session.rating)} ({session.rating}/5)</span>
                </div>
              )}
              {session.energyLevel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Energy:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.energyLevel}/5 ({ENERGY_OPTIONS.find((e) => e.level === session.energyLevel)?.label})</span>
                </div>
              )}
              {session.difficulty && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Difficulty:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{session.difficulty}/5 ({DIFFICULTY_OPTIONS.find((d) => d.level === session.difficulty)?.label})</span>
                </div>
              )}
            </div>

            {session.reflection && (
              <div style={{ marginTop: '8px', padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-xs)', borderLeft: '3px solid var(--text-primary)' }}>
                <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                  “How did I feel?”
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{session.reflection}"
                </p>
              </div>
            )}

            {session.notes && (
              <div style={{ marginTop: '8px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>Notes: </span>
                {session.notes}
              </div>
            )}

            {!session.rating && !session.reflection && !session.notes && !session.energyLevel && !session.difficulty && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                No review logged for this session yet. Click "Edit Review" to add star rating, energy level, difficulty, and reflection.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Fitness Module ────────────────────────────────────────────────────

type Tab = 'dashboard' | 'log' | 'templates' | 'history' | 'records'

export const FitnessModule: React.FC = () => {
  const { workouts, personalRecords, addWorkout, updateWorkout, deleteWorkout, saveWorkoutTemplate } = useApp()
  const todayStr = getTodayDateString()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({})
  const [reviewingSession, setReviewingSession] = useState<WorkoutSession | null>(null)
  const [builderTemplate, setBuilderTemplate] = useState<{
    exercises?: Exercise[]
    muscles?: string[]
    title?: string
    sportActivity?: string
  } | null>(null)

  const toggleExpand = (id: string) => setExpandedSessions((prev) => ({ ...prev, [id]: !prev[id] }))

  const actualWorkouts = useMemo(() => workouts.filter((w) => !w.isTemplate), [workouts])
  const templates = useMemo(() => workouts.filter((w) => w.isTemplate), [workouts])

  // Dashboard stats
  const totalSessions = actualWorkouts.length
  const totalVolume = actualWorkouts.reduce((t, w) => t + calcVolume(w), 0)

  // Weekly sessions (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return formatLocalDate(d)
  })
  const workoutDays = new Set(actualWorkouts.map((w) => w.date))
  const weeklyCount = last7Days.filter((d) => workoutDays.has(d)).length

  // Streak
  const streak = useMemo(() => {
    const daysSet = new Set(actualWorkouts.map((w) => w.date))
    let count = 0
    const today = new Date(todayStr)
    for (let i = 0; i < 365; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (daysSet.has(formatLocalDate(d))) count++
      else if (i > 0) break
    }
    return count
  }, [actualWorkouts, todayStr])

  const prList = useMemo(() =>
    Object.values(personalRecords).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [personalRecords]
  )

  const handleSaveSession = async (session: Omit<WorkoutSession, 'id' | 'createdAt'>) => {
    await addWorkout(session)
    setActiveTab('dashboard')
    setBuilderTemplate(null)
  }

  const handleUseTemplate = (tpl: WorkoutSession) => {
    setBuilderTemplate({
      exercises: tpl.exercises.map((ex) => ({
        ...ex,
        id: genId('ex'),
        sets: ex.sets.map((s) => ({ ...s, id: genId('set'), completed: false })),
      })),
      muscles: tpl.muscleGroups,
      title: tpl.templateName || tpl.title,
      sportActivity: tpl.sportActivity,
    })
    setActiveTab('log')
  }

  const handleUsePresetTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    const exercises = tpl.exercises.map((name, i) =>
      makeExercise(name, tpl.muscles[Math.min(i, tpl.muscles.length - 1)] || 'Custom')
    )
    setBuilderTemplate({
      exercises,
      muscles: tpl.muscles,
      title: tpl.name,
      sportActivity: tpl.sportActivity,
    })
    setActiveTab('log')
  }

  const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={13} /> },
    { id: 'log', label: 'Log Workout', icon: <Plus size={13} /> },
    { id: 'templates', label: 'Templates', icon: <FileText size={13} /> },
    { id: 'history', label: 'History', icon: <Clock size={13} /> },
    { id: 'records', label: 'Records', icon: <Trophy size={13} /> },
  ]

  return (
    <div className="animate-in">
      {/* Module Hero */}
      <div className="module-hero">
        <div className="module-hero__left">
          <div className="module-hero__eyebrow">Physical</div>
          <h1 className="module-hero__title">Workouts & Gym</h1>
          <p className="module-hero__subtitle">Flexible routines, sports tracking & workout reflections</p>
        </div>
        <div className="module-hero__actions">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus size={13} />}
            onClick={() => { setBuilderTemplate(null); setActiveTab('log') }}
          >
            Log Workout
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '32px', paddingBottom: '14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: 'var(--r-pill)',
              fontSize: 'var(--text-xs)', fontWeight: activeTab === tab.id ? 600 : 400,
              background: activeTab === tab.id ? 'var(--text-primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-inverse)' : 'var(--text-tertiary)',
              border: '1px solid transparent', cursor: 'pointer',
              transition: 'all 80ms ease',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────── DASHBOARD TAB ─────────────── */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Stats strip */}
          <div className="vitals-strip" style={{ marginBottom: '32px' }}>
            {[
              { label: 'Sessions', value: String(totalSessions) },
              { label: 'This week', value: String(weeklyCount) },
              { label: 'Streak', value: `${streak}d` },
              { label: 'Total volume', value: totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : String(totalVolume), sub: 'kg' },
            ].map(({ label, value, sub }) => (
              <div key={label} className="vital-stat" style={{ border: 'none' }}>
                <div>
                  <span className="vital-stat__label">{label}</span>
                  <span className="vital-stat__num">
                    {value}
                    {sub && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-tertiary)' }}> {sub}</span>}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly consistency */}
          <div className="section" style={{ marginBottom: '32px' }}>
            <div className="section-header" style={{ marginBottom: '12px' }}>
              <span className="section-title"><CalendarDays size={13} /> Weekly Consistency</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {last7Days.map((dateStr) => {
                const hasWorkout = workoutDays.has(dateStr)
                const isToday = dateStr === todayStr
                const label = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
                const dayNum = new Date(dateStr + 'T12:00:00').getDate()
                return (
                  <div
                    key={dateStr}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      flex: 1, minWidth: '36px',
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: isToday ? 600 : 400 }}>
                      {label}
                    </span>
                    <div
                      style={{
                        width: '32px', height: '32px', borderRadius: 'var(--r-sm)',
                        background: hasWorkout ? 'var(--text-primary)' : 'var(--bg-hover)',
                        border: isToday ? '2px solid var(--border-strong)' : '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: hasWorkout ? 'var(--text-inverse)' : 'var(--text-tertiary)' }}>
                        {dayNum}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Log for Active Recovery & Sports */}
          <div style={{ marginBottom: '32px', padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>Quick Start Active Recovery & Sports</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Log activities with duration, distance, and reflections</div>
              </div>
              <button
                onClick={() => { setBuilderTemplate(null); setActiveTab('log') }}
                className="btn btn--secondary btn--xs"
              >
                Custom Routine →
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SPORT_ACTIVITIES.slice(0, 8).map((act) => (
                <button
                  key={act.id}
                  onClick={() => {
                    const tpl = PRESET_TEMPLATES.find((p) => p.sportActivity === act.name)
                    if (tpl) {
                      handleUsePresetTemplate(tpl)
                    } else {
                      setBuilderTemplate({
                        muscles: [act.category === 'recovery' ? 'Active Recovery' : act.category === 'cardio' ? 'Cardio' : 'Sport'],
                        title: `${act.name} · ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}`,
                        sportActivity: act.name,
                      })
                      setActiveTab('log')
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-secondary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 80ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-primary)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                  }}
                >
                  <span>{act.icon}</span>
                  <span>{act.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent workouts */}
          <div className="section">
            <div className="section-header" style={{ marginBottom: '12px' }}>
              <span className="section-title"><Flame size={13} /> Recent Sessions</span>
              {actualWorkouts.length > 0 && (
                <button onClick={() => setActiveTab('history')} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  All <ChevronRight size={11} />
                </button>
              )}
            </div>

            {actualWorkouts.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-state__mark" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="22" width="28" height="4" fill="currentColor" />
                  <rect x="22" y="10" width="4" height="28" fill="currentColor" />
                  <rect x="6" y="18" width="4" height="12" rx="2" fill="currentColor" opacity="0.5" />
                  <rect x="38" y="18" width="4" height="12" rx="2" fill="currentColor" opacity="0.5" />
                </svg>
                <div className="empty-state__title">No workouts yet</div>
                <div className="empty-state__desc">Log your first session or active recovery to track progress, duration, personal bests, and reviews.</div>
                <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setBuilderTemplate(null); setActiveTab('log') }}>
                  Log First Workout
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {actualWorkouts.slice(0, 3).map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={() => deleteWorkout(session.id)}
                    onSaveTemplate={() => saveWorkoutTemplate(session)}
                    onOpenReview={(s) => setReviewingSession(s)}
                    expanded={!!expandedSessions[session.id]}
                    onToggleExpand={() => toggleExpand(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────── LOG TAB ─────────────── */}
      {activeTab === 'log' && (
        <WorkoutBuilder
          personalRecords={personalRecords}
          templateExercises={builderTemplate?.exercises}
          templateMuscles={builderTemplate?.muscles}
          templateTitle={builderTemplate?.title}
          initialSportActivity={builderTemplate?.sportActivity}
          onSave={handleSaveSession}
          onCancel={() => { setActiveTab('dashboard'); setBuilderTemplate(null) }}
        />
      )}

      {/* ─────────────── TEMPLATES TAB ─────────────── */}
      {activeTab === 'templates' && (
        <div>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <span className="section-title"><FileText size={13} /> Your Templates</span>
          </div>

          {templates.length === 0 ? (
            <div className="empty-state" style={{ marginBottom: '40px' }}>
              <div className="empty-state__title">No saved templates</div>
              <div className="empty-state__desc">After logging a session, click the save icon to keep it as a reusable template.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
              {templates.map((tpl) => (
                <div key={tpl.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg-white)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 500 }}>{tpl.templateName || tpl.title}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      {tpl.sportActivity ? `Activity: ${tpl.sportActivity}` : `${tpl.exercises.length} exercises`} · {tpl.muscleGroups.join(', ')}
                    </div>
                  </div>
                  <button onClick={() => handleUseTemplate(tpl)} className="btn btn--secondary btn--sm">
                    Use
                  </button>
                  <button onClick={() => deleteWorkout(tpl.id)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="section-header" style={{ marginBottom: '12px' }}>
            <span className="section-title"><Zap size={13} /> Preset Templates & Sports</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
            {PRESET_TEMPLATES.map((tpl) => (
              <div
                key={tpl.name}
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px 16px', background: 'var(--bg-white)', cursor: 'pointer', transition: 'background 80ms ease' }}
                onClick={() => handleUsePresetTemplate(tpl)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-white)' }}
              >
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '4px' }}>{tpl.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                  {tpl.sportActivity
                    ? `Activity: ${tpl.sportActivity} · ${tpl.defaultDuration || 45} min`
                    : tpl.exercises.length > 0 ? tpl.exercises.slice(0, 3).join(', ') + (tpl.exercises.length > 3 ? '...' : '') : 'Flexible — add your own'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────── HISTORY TAB ─────────────── */}
      {activeTab === 'history' && (
        <div>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <span className="section-title"><Clock size={13} /> All Sessions</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{actualWorkouts.length} total</span>
          </div>

          {actualWorkouts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">No sessions logged</div>
              <div className="empty-state__desc">Your workout history and reflections will appear here.</div>
              <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setBuilderTemplate(null); setActiveTab('log') }}>
                Log First Session
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {actualWorkouts.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onDelete={() => deleteWorkout(session.id)}
                  onSaveTemplate={() => saveWorkoutTemplate(session)}
                  onOpenReview={(s) => setReviewingSession(s)}
                  expanded={!!expandedSessions[session.id]}
                  onToggleExpand={() => toggleExpand(session.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────── RECORDS TAB ─────────────── */}
      {activeTab === 'records' && (
        <div>
          <div className="section-header" style={{ marginBottom: '20px' }}>
            <span className="section-title"><Award size={13} /> Personal Records</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{prList.length} exercises tracked</span>
          </div>

          {prList.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state__mark" viewBox="0 0 48 48" fill="none">
                <polygon points="24,6 30,18 44,20 34,30 36,44 24,37 12,44 14,30 4,20 18,18" fill="currentColor" />
              </svg>
              <div className="empty-state__title">No records yet</div>
              <div className="empty-state__desc">Complete sets with weight and reps data. Personal bests are detected automatically.</div>
              <Button variant="secondary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setBuilderTemplate(null); setActiveTab('log') }}>
                Start Tracking
              </Button>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-white)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px auto', gap: '0', borderBottom: '1px solid var(--border)', padding: '8px 16px', background: 'var(--bg-subtle)' }}>
                {['Exercise', 'Best Weight', 'Best Reps', 'Volume', 'Date'].map((h) => (
                  <span key={h} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)' }}>{h}</span>
                ))}
              </div>
              {prList.map((pr, i) => (
                <div
                  key={pr.exerciseName}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px auto',
                    padding: '10px 16px', borderBottom: i < prList.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 80ms ease',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Trophy size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{pr.exerciseName}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{pr.weightKg}kg</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>{pr.reps}</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontVariantNumeric: 'tabular-nums', color: 'var(--text-tertiary)' }}>{pr.volume}kg</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{pr.date}</span>
                </div>
              ))}
            </div>
          )}

          {prList.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>How PRs are tracked:</strong> When you complete a set with a higher weight × reps volume than your previous best for that exercise, a new PR is recorded automatically. PRs are per exercise name (case-insensitive).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal for reviewing/editing past sessions */}
      <WorkoutReviewModal
        session={reviewingSession}
        onClose={() => setReviewingSession(null)}
        onSave={(updated) => updateWorkout(updated)}
      />
    </div>
  )
}
