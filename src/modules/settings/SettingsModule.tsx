import React, { useState, useRef } from 'react'
import {
  User,
  Sun,
  Moon,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export const SettingsModule: React.FC = () => {
  const { profile, updateProfile, resetToOnboarding, showToast } = useApp()
  const { theme, toggleTheme } = useTheme()

  const [name, setName] = useState(profile.name)
  const [title, setTitle] = useState(profile.title)
  const [semester, setSemester] = useState(profile.semester || 'Semester 5')
  const [wakeTime, setWakeTime] = useState(profile.wakeTime || '06:30')
  const [sleepTime, setSleepTime] = useState(profile.sleepTime || '23:00')

  // Import / Export states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<Record<string, string> | null>(null)
  const [isConfirmImportOpen, setIsConfirmImportOpen] = useState(false)
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateProfile({ name, title, semester, wakeTime, sleepTime })
      showToast('Profile preferences saved! ✅')
    } catch {
      showToast('Could not save profile preferences. Check your connection and try again.')
    }
  }

  const handleExportData = () => {
    const backup: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('jid_')) {
        const value = localStorage.getItem(key)
        if (value !== null) backup[key] = value
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `just_do_it_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported successfully as JSON! 📦')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const parsed = JSON.parse(text)
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('Invalid JSON format')
        }
        const entries = Object.entries(parsed)
        if (entries.some(([key, value]) => (!key.startsWith('jid_v1_') && key !== 'jid_theme_preference') || typeof value !== 'string')) {
          throw new Error('Unsupported backup content')
        }
        setPendingImport(Object.fromEntries(entries) as Record<string, string>)
        setIsConfirmImportOpen(true)
      } catch {
        showToast('Error: Failed to read backup file. Invalid JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirmImport = () => {
    if (!pendingImport) return
    try {
      for (const [key, val] of Object.entries(pendingImport)) {
        localStorage.setItem(key, val)
      }
      showToast('Backup restored successfully! Reloading workspace...')
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch {
      showToast('Error restoring backup into local storage.')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '760px' }} className="animate-in">
      {/* ── Page Anatomy Header ─────────────────────────────────────────── */}
      <div>
        <div className="page-meta">System Configuration · Preferences & Safety</div>
        <h1 className="page-title">Settings & Preferences</h1>
      </div>

      {/* Profile Form */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <User size={16} style={{ color: 'var(--text-primary)' }} />
          <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text-primary)' }}>Personal Identity</h2>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Professional Title / Persona"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Input
              label="Academic Semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
            <Input
              label="Wake Up Time"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
            <Input
              label="Sleep Target"
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <Button variant="primary" type="submit">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>

      {/* Appearance & Theme */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Interface Theme
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Currently in <strong>{theme}</strong> mode (Apple/Linear restrained monochrome palette).
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={toggleTheme}
          leftIcon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        >
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </Button>
      </div>

      {/* Setup & Onboarding */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Re-run Setup Wizard
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Reconfigure your academic subjects, career roadmap, and habits.
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Sparkles size={14} />}
          onClick={() => setIsConfirmResetOpen(true)}
        >
          Re-run Setup
        </Button>
      </div>

      {/* Data Safety: Backup & Restore */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Data Safety & Backup
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            This exports and restores legacy browser storage only. It does not include data saved to your signed-in account on the server.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportData}
          >
            Export JSON Backup
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON Backup
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* ── Confirmation Dialogs ────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={isConfirmImportOpen}
        title="Restore Data Backup"
        message="Restoring this backup will replace current workspace items with the contents of the backup file. Are you sure you want to proceed?"
        confirmLabel="Restore & Reload"
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setIsConfirmImportOpen(false)
          setPendingImport(null)
        }}
      />

      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        title="Re-run Setup Wizard"
        message="Launching the setup wizard will allow you to generate fresh personalized recommendations for your workspace. Proceed?"
        confirmLabel="Continue to Setup"
        isDestructive={false}
        onConfirm={() => {
          setIsConfirmResetOpen(false)
          resetToOnboarding()
        }}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </div>
  )
}
