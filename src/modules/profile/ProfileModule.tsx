import React, { useState } from 'react'
import {
  User,
  Shield,
  Sparkles,
  Download,
  LogOut,
  Check,
  Clock,
  Droplets,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
]

export const ProfileModule: React.FC = () => {
  const {
    profile,
    updateProfile,
    logout,
    resetToOnboarding,
    showToast,
    tasks,
    habits,
    academics,
    goals,
  } = useApp()

  const { theme, setTheme } = useTheme()

  // Form edit states
  const [name, setName] = useState(profile.name)
  const [title, setTitle] = useState(profile.title)
  const [email, setEmail] = useState(profile.email || '')
  const [dailyFocus, setDailyFocus] = useState(profile.dailyFocus)
  const [semester, setSemester] = useState(profile.semester || '')
  const [wakeTime, setWakeTime] = useState(profile.wakeTime || '07:00')
  const [sleepTime, setSleepTime] = useState(profile.sleepTime || '23:00')
  const [waterTarget, setWaterTarget] = useState(profile.waterTargetMl || 2500)
  const [selectedColor, setSelectedColor] = useState(profile.avatarColor || '#3b82f6')
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast('Name cannot be empty', undefined, undefined)
      return
    }

    const initials = name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .substring(0, 2) || 'U'

    await updateProfile({
      name: name.trim(),
      title: title.trim(),
      dailyFocus: dailyFocus.trim(),
      semester: semester.trim(),
      wakeTime,
      sleepTime,
      waterTargetMl: Number(waterTarget) || 2500,
      avatarColor: selectedColor,
      avatarInitials: initials,
    })

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
    showToast('Profile preferences updated')
  }

  // Export full account data as JSON file
  const handleExportData = () => {
    const dataToExport = {
      exportDate: new Date().toISOString(),
      profile,
      tasks,
      habits,
      academics,
      goals,
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `just_do_it_backup_${profile.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('Personal data exported successfully')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* ── HEADER ── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-meta">Personal Space · Identity & Settings</div>
        <h1 className="page-title">Profile</h1>
      </div>

      {/* ── PROFILE HERO CARD ── */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: selectedColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '22px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              flexShrink: 0,
            }}
          >
            {profile.avatarInitials}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {profile.name}
              </h2>
              <Badge variant="blue">Active Profile</Badge>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              {profile.title || 'Personal Workspace'}
            </p>
            {profile.email && (
              <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
                {profile.email}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={resetToOnboarding}
            leftIcon={<Sparkles size={14} />}
          >
            Re-run Setup
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut size={14} />}
          >
            Switch / Log Out
          </Button>
        </div>
      </div>

      {/* ── EDIT PROFILE DETAILS FORM ── */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          padding: '24px',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Personal Details & Preferences
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Customize how your dashboard, routines, and identity are displayed.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Avatar Color Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Avatar Accent Color
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: color,
                    border: selectedColor === color ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'transform 120ms ease',
                  }}
                >
                  {selectedColor === color && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Headline row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Headline / Role
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Student & Engineer"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Email & Academic Semester row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Academic Semester / Year
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Semester 5 or Year 2026"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Daily Anchor Focus */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Daily Anchor / Primary Focus
            </label>
            <input
              type="text"
              value={dailyFocus}
              onChange={(e) => setDailyFocus(e.target.value)}
              placeholder="e.g. Build momentum and execute daily deep work block."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          {/* Routine & Targets (Wake, Sleep, Water) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Sleep Time
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Daily Water Goal (ml)
              </label>
              <input
                type="number"
                step={50}
                value={waterTarget}
                onChange={(e) => setWaterTarget(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Theme preference */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              Appearance Theme
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['system', 'light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    border: '1px solid var(--color-border-subtle)',
                    background: theme === t ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                    color: theme === t ? '#ffffff' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="primary" size="md" type="submit">
              {isSaved ? 'Saved ✓' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* ── ACCOUNT ── */}
      <div style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-subtle)', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Signed-in account</h3>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '6px 0 14px' }}>
          {profile.email} · Your account can be used on other devices.
        </p>
        <Button variant="ghost" size="sm" onClick={() => void logout()} leftIcon={<LogOut size={14} />}>
          Sign out
        </Button>
      </div>

      {/* ── DATA MANAGEMENT & PRIVACY ── */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          padding: '24px',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Data Privacy & Export
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Your workspace is associated with your signed-in account. Use the export file to keep a personal copy.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            leftIcon={<Download size={14} />}
          >
            Export All Data (JSON)
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetToOnboarding}
            leftIcon={<RotateCcw size={14} />}
          >
            Run Setup Assistant
          </Button>
        </div>
      </div>
    </div>
  )
}
