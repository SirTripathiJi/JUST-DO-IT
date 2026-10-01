import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Clock,
  Droplets,
  Flame,
  BookOpen,
  Briefcase,
  Heart,
  Palette,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { OnboardingData } from '../../types'
import { Button } from '../ui/Button'

export const OnboardingModal: React.FC = () => {
  const { modal, completeOnboarding, profile } = useApp()

  const [step, setStep] = useState<number>(1)
  const totalSteps = 5

  // Start with 100% EMPTY collections so the user only tracks what they actually want!
  const [formData, setFormData] = useState<OnboardingData>({
    name: profile.name || '',
    mainFocus: profile.dailyFocus || '',
    academicSubjects: [],
    semester: profile.semester || '',
    careerPaths: [],
    hobbies: [],
    wakeTime: profile.wakeTime || '07:00',
    sleepTime: profile.sleepTime || '23:00',
    habitsToBuild: [],
    supplements: [],
    dailyWaterTargetMl: profile.waterTargetMl || 2500,
  })

  // Sync profile name if profile updates
  useEffect(() => {
    if (profile.name) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.name,
        semester: prev.semester || profile.semester || '',
      }))
    }
  }, [profile.name, profile.semester])

  // Custom inline inputs for each step
  const [customHabit, setCustomHabit] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customCareer, setCustomCareer] = useState('')
  const [customHobby, setCustomHobby] = useState('')
  const [customSupplement, setCustomSupplement] = useState('')

  if (modal.type !== 'onboarding') return null

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    completeOnboarding(formData)
  }

  // Toggle item in array (add if not present, remove if present)
  const toggleItem = (field: keyof OnboardingData, item: string) => {
    const list = (formData[field] as string[]) || []
    if (list.includes(item)) {
      setFormData({
        ...formData,
        [field]: list.filter((i) => i !== item),
      })
    } else {
      setFormData({
        ...formData,
        [field]: [...list, item],
      })
    }
  }

  const addCustomItem = (field: keyof OnboardingData, value: string, clearFn: (s: string) => void) => {
    const trimmed = value.trim()
    if (!trimmed) return
    const list = (formData[field] as string[]) || []
    if (!list.includes(trimmed)) {
      setFormData({
        ...formData,
        [field]: [...list, trimmed],
      })
    }
    clearFn('')
  }

  const removeItem = (field: keyof OnboardingData, item: string) => {
    const list = (formData[field] as string[]) || []
    setFormData({
      ...formData,
      [field]: list.filter((i) => i !== item),
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'appleFadeIn 0.25s var(--ease-apple)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header & Progress Dots */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={14} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Setup Assistant
            </span>
          </div>

          {/* Step Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx + 1 === step ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx + 1 === step ? 'var(--color-accent)' : idx + 1 < step ? 'var(--color-text-secondary)' : 'var(--color-border-subtle)',
                  transition: 'all 200ms ease',
                }}
              />
            ))}
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginLeft: '6px' }}>
              {step}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* ── STEP 1: IDENTITY & SCHEDULE ── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Personal Identity & Daily Rhythm
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Let's configure your basic schedule and display name.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    What should we call you? *
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Wake & Sleep Times */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      <Clock size={12} /> Target Wake Time
                    </label>
                    <input
                      type="time"
                      value={formData.wakeTime}
                      onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      <Clock size={12} /> Target Sleep Time
                    </label>
                    <input
                      type="time"
                      value={formData.sleepTime}
                      onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: DAILY FOCUS & SEMESTER ── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Daily Anchor & Current Focus
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Define what matters most right now to guide your daily priorities.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    What is your primary focus / goal right now?
                  </label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Master software engineering and maintain daily consistency"
                    value={formData.mainFocus}
                    onChange={(e) => setFormData({ ...formData, mainFocus: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />

                  {/* 1-click inspiration pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {[
                      'Build unbroken daily momentum',
                      'Ace current semester exams',
                      'Ship high-impact portfolio projects',
                      'Prioritize health, fitness & wellness',
                    ].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormData({ ...formData, mainFocus: f })}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          background: formData.mainFocus === f ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                          color: formData.mainFocus === f ? '#ffffff' : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        + {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Current Semester / Academic Year <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Semester 5 or Year 2026"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: HABITS YOU WANT TO BUILD ── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} style={{ color: 'var(--color-warning)' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Habits You Want to Build
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Starts empty. Click suggestions below or add custom habits you actually want to track.
                </p>
              </div>

              {/* Selected Habits */}
              {formData.habitsToBuild.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Selected Habits ({formData.habitsToBuild.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {formData.habitsToBuild.map((habit) => (
                      <span
                        key={habit}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: 'var(--color-accent)',
                          fontSize: '12px',
                          fontWeight: 500,
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                        }}
                      >
                        {habit}
                        <button
                          type="button"
                          onClick={() => removeItem('habitsToBuild', habit)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: 'inherit',
                            display: 'flex',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 1-Click Suggestions */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>
                  Tap to Add (Minimal Typing):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    'Drink 500ml water upon waking',
                    '90-Minute deep work block',
                    'Daily exercise / workout',
                    'Read 20+ pages',
                    'Morning stretch & mobility',
                    '10-Minute meditation',
                    'Evening digital sunset',
                  ].map((preset) => {
                    const isSelected = formData.habitsToBuild.includes(preset)
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => toggleItem('habitsToBuild', preset)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          background: isSelected ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                          color: isSelected ? '#ffffff' : 'var(--color-text-secondary)',
                          border: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isSelected ? <Check size={12} strokeWidth={2.5} /> : <Plus size={12} />}
                        {preset}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Add Row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Or type a custom habit..."
                  value={customHabit}
                  onChange={(e) => setCustomHabit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomItem('habitsToBuild', customHabit, setCustomHabit)
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border-subtle)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => addCustomItem('habitsToBuild', customHabit, setCustomHabit)}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: ACADEMICS & HOBBIES ── */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Subjects, Career & Hobbies
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Add your courses or passions. Empty if not applicable.
                </p>
              </div>

              {/* Academic Subjects */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Academic Subjects ({formData.academicSubjects.length})
                </label>

                {formData.academicSubjects.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {formData.academicSubjects.map((sub) => (
                      <span
                        key={sub}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => removeItem('academicSubjects', sub)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Systems, Mathematics..."
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomItem('academicSubjects', customSubject, setCustomSubject)
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border-subtle)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                      outline: 'none',
                    }}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => addCustomItem('academicSubjects', customSubject, setCustomSubject)}
                  >
                    Add
                  </Button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {['Computer Science', 'Linear Algebra', 'Algorithms', 'Physics', 'Psychology'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleItem('academicSubjects', s)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        background: formData.academicSubjects.includes(s) ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: formData.academicSubjects.includes(s) ? '#ffffff' : 'var(--color-text-tertiary)',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hobbies & Crafts */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Hobbies & Craft Pursuits ({formData.hobbies.length})
                </label>

                {formData.hobbies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                    {formData.hobbies.map((hob) => (
                      <span
                        key={hob}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        {hob}
                        <button
                          type="button"
                          onClick={() => removeItem('hobbies', hob)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {['Acoustic Guitar', 'Chess Tactics', 'Writing / Essays', 'Photography', 'Running'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleItem('hobbies', h)}
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        background: formData.hobbies.includes(h) ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: formData.hobbies.includes(h) ? '#ffffff' : 'var(--color-text-tertiary)',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      + {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: HYDRATION & SUPPLEMENTS ── */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplets size={16} style={{ color: 'var(--color-accent)' }} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    Hydration & Health Protocols
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Set your daily water target and any vitamins or routines.
                </p>
              </div>

              {/* Water Target */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                  Daily Water Target: <strong>{formData.dailyWaterTargetMl} ml</strong> ({Math.round(formData.dailyWaterTargetMl / 250)} glasses)
                </label>

                {/* Preset quick buttons */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {[2000, 2500, 3000, 3500].map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setFormData({ ...formData, dailyWaterTargetMl: ml })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: formData.dailyWaterTargetMl === ml ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: formData.dailyWaterTargetMl === ml ? '#ffffff' : 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      {ml / 1000}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplements / Nutrition (Start Empty) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Supplements / Vitamins ({formData.supplements.length})
                </label>

                {formData.supplements.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {formData.supplements.map((sup) => (
                      <span
                        key={sup}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          background: 'var(--color-bg-secondary)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                          border: '1px solid var(--color-border-subtle)',
                        }}
                      >
                        {sup}
                        <button
                          type="button"
                          onClick={() => removeItem('supplements', sup)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Vitamin D3', 'Omega-3', 'Magnesium Glycinate', 'Creatine', 'Multivitamin'].map((sup) => (
                    <button
                      key={sup}
                      type="button"
                      onClick={() => toggleItem('supplements', sup)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        background: formData.supplements.includes(sup) ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                        color: formData.supplements.includes(sup) ? '#ffffff' : 'var(--color-text-tertiary)',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                      }}
                    >
                      + {sup}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--color-border-subtle)',
            background: 'var(--color-bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {step > 1 ? (
            <Button variant="ghost" size="sm" onClick={handleBack} leftIcon={<ArrowLeft size={14} />}>
              Back
            </Button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            {step < totalSteps && (
              <Button variant="ghost" size="sm" onClick={handleNext}>
                Skip Step
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={step < totalSteps ? <ArrowRight size={14} /> : <Check size={14} />}
            >
              {step < totalSteps ? 'Continue' : 'Finish & Open Workspace'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
