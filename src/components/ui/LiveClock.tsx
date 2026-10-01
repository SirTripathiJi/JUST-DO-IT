import React, { useState, useEffect } from 'react'

export interface LiveClockProps {
  className?: string
  showTimezone?: boolean
  showSecondsProgress?: boolean
}

export const LiveClock: React.FC<LiveClockProps> = ({
  className = '',
  showTimezone = true,
  showSecondsProgress = true,
}) => {
  const [now, setNow] = useState(new Date())
  const [is24Hour, setIs24Hour] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const hoursRaw = now.getHours()
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const period = hoursRaw >= 12 ? 'PM' : 'AM'
  const hours12 = hoursRaw % 12 || 12
  const hours = is24Hour ? String(hoursRaw).padStart(2, '0') : String(hours12).padStart(2, '0')

  const secondsProgress = (now.getSeconds() / 60) * 100

  // Timezone identifier or city
  let tzLabel = 'Local'
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    tzLabel = tz.includes('/') ? tz.split('/')[1].replace(/_/g, ' ') : tz
  } catch {
    tzLabel = 'Local'
  }

  return (
    <div
      onClick={() => setIs24Hour((p) => !p)}
      title="Click to toggle 12h / 24h format"
      className={`aesthetic-clock-card ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minWidth: '250px',
        padding: '12px 24px',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-subtle)',
        boxShadow: '0 4px 18px -2px rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Top micro row: Live indicator & Timezone spaced across full breadth */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
              animation: 'pulseLive 2s infinite ease-in-out',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
            }}
          >
            LIVE
          </span>
        </div>
        {showTimezone && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--color-text-tertiary)',
              maxWidth: '140px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'right',
            }}
          >
            {tzLabel}
          </span>
        )}
      </div>

      {/* Main Clock: Tabular HH:MM :SS AM/PM */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'baseline',
          gap: '4px',
          width: '100%',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontSize: '30px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          {hours}:{minutes}
        </span>
        <span
          style={{
            fontSize: '19px',
            fontWeight: 600,
            color: 'var(--color-accent)',
            lineHeight: 1,
          }}
        >
          :{seconds}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: is24Hour ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
            background: 'var(--bg-subtle)',
            padding: '2px 5px',
            borderRadius: 'var(--r-xs)',
            border: '1px solid var(--border)',
            marginLeft: '5px',
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          {is24Hour ? '24H' : period}
        </span>
      </div>

      {/* Micro Seconds Progress Track */}
      {showSecondsProgress && (
        <div
          style={{
            width: '100%',
            height: '3px',
            background: 'var(--color-border-subtle)',
            borderRadius: '999px',
            marginTop: '10px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${secondsProgress}%`,
              background: 'linear-gradient(90deg, var(--color-accent) 0%, #60a5fa 100%)',
              transition: 'width 0.25s linear',
            }}
          />
        </div>
      )}
    </div>
  )
}
