import React, { useState } from 'react'
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'

type AuthMode = 'login' | 'register'

export const LoginView: React.FC = () => {
  const { authError, signIn, signUp } = useApp()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      if (mode === 'register') await signUp(name.trim(), email.trim(), password, title.trim())
      else await signIn(email.trim(), password)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(ellipse at 50% 20%, rgba(59, 130, 246, 0.08) 0%, var(--color-bg-primary) 70%)',
      }}
    >
      <section style={{ width: '100%', maxWidth: '460px', animation: 'appleFadeIn 0.4s var(--ease-apple)' }}>
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-grid',
              placeItems: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #6366f1 100%)',
              color: '#fff',
              marginBottom: '14px',
            }}
          >
            <Zap size={24} strokeWidth={2.4} />
          </div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Just Do It</h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Your calm, unified personal operating system
          </p>
        </header>

        <div
          style={{
            padding: '28px 24px',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-bg-primary)',
            boxShadow: '0 12px 40px -10px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
            {(['login', 'register'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                style={{
                  flex: 1,
                  border: `1px solid ${mode === option ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '9px 12px',
                  background: mode === option ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  font: 'inherit',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {option === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={15} style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--color-text-primary)' }}>
                {mode === 'register' ? 'Create your account' : 'Welcome back'}
              </h2>
            </div>
            <p style={{ margin: '5px 0 0', fontSize: '12px', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
              {mode === 'register' ? 'Your workspace will be available wherever you sign in.' : 'Sign in to continue to your workspace.'}
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              style={{
                marginBottom: '16px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-danger)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '12px',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <label style={labelStyle}>
                Name
                <input autoComplete="name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
              </label>
            )}
            <label style={labelStyle}>
              Email
              <input autoComplete="email" type="email" required maxLength={320} value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Password
              <input
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                type="password"
                required
                minLength={mode === 'register' ? 12 : 1}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
              />
              {mode === 'register' && <span style={{ fontSize: '11px', fontWeight: 400 }}>Use 12–72 characters.</span>}
            </label>
            {mode === 'register' && (
              <label style={labelStyle}>
                Headline / role <span style={{ fontWeight: 400 }}>(optional)</span>
                <input maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} style={inputStyle} />
              </label>
            )}
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              rightIcon={<ArrowRight size={15} />}
            >
              {isSubmitting ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </Button>
          </form>
        </div>

        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
          <ShieldCheck size={13} style={{ color: 'var(--color-success)' }} />
          <span>Your data is protected by your account and an HttpOnly session cookie.</span>
        </div>
      </section>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: 'var(--color-text-secondary)',
  fontSize: '12px',
  fontWeight: 600,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg-secondary)',
  color: 'var(--color-text-primary)',
  font: 'inherit',
  fontSize: '14px',
  outline: 'none',
}
