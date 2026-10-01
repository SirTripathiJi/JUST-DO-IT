import React, { useState } from 'react'
import {
  Palette,
  Plus,
  Clock,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export const HobbiesModule: React.FC = () => {
  const { hobbies, deleteHobby, logHobbySession, openModal } = useApp()
  const todayStr = getTodayDateString()

  const [activeSessionHobbyId, setActiveSessionHobbyId] = useState<string | null>(null)
  const [sessionMins, setSessionMins] = useState(30)
  const [sessionRating, setSessionRating] = useState(5)
  const [sessionNotes, setSessionNotes] = useState('')

  const handleLogSession = (hobbyId: string) => {
    logHobbySession(hobbyId, {
      date: todayStr,
      durationMinutes: Number(sessionMins),
      rating: Number(sessionRating),
      notes: sessionNotes.trim() || undefined,
    })
    setActiveSessionHobbyId(null)
    setSessionNotes('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Creative Mastery & Lifelong Craft</div>
          <h1 className="page-title">Hobbies & Creative Practice</h1>
        </div>
        <Button variant="primary" onClick={() => openModal('hobby')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> New Hobby
        </Button>
      </div>

      {/* Hobbies Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {hobbies.length === 0 ? (
          <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)', gridColumn: '1 / -1' }}>
            No hobbies registered yet. Click "+ New Hobby" to add your craft pursuits.
          </div>
        ) : (
          hobbies.map((hobby) => {
            const totalMins = hobby.sessions.reduce((acc, s) => acc + s.durationMinutes, 0)
            const isLogging = activeSessionHobbyId === hobby.id

            return (
              <div
                key={hobby.id}
                style={{
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Palette size={16} style={{ color: 'var(--color-accent)' }} />
                      <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{hobby.name}</h3>
                      <Badge variant="blue">{hobby.category}</Badge>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                      Target: {hobby.targetFrequency} ({hobby.targetMinutesPerWeek} mins/week)
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant="green">🔥 {hobby.currentStreak}d streak</Badge>
                    <button
                      onClick={() => deleteHobby(hobby.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <span>Total Time: <strong>{(totalMins / 60).toFixed(1)} hrs</strong></span>
                  <span>Sessions: <strong>{hobby.sessions.length} logged</strong></span>
                </div>

                {/* Inline Session Logger */}
                {isLogging ? (
                  <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-xs)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Log Practice Session</span>
                      <button
                        onClick={() => setActiveSessionHobbyId(null)}
                        style={{ background: 'none', border: 'none', fontSize: '11px', color: 'var(--color-text-tertiary)', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Duration (mins)</label>
                        <input
                          type="number"
                          className="input"
                          value={sessionMins}
                          onChange={(e) => setSessionMins(Number(e.target.value))}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Rating (1-5)</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          className="input"
                          value={sessionRating}
                          onChange={(e) => setSessionRating(Number(e.target.value))}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      className="input"
                      placeholder="Notes on what you practiced or learned..."
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      style={{ padding: '6px 8px', fontSize: '12px' }}
                    />

                    <Button size="sm" variant="primary" onClick={() => handleLogSession(hobby.id)}>
                      Save Session Log
                    </Button>
                  </div>
                ) : (
                  <Button size="xs" variant="secondary" onClick={() => setActiveSessionHobbyId(hobby.id)}>
                    <Clock size={12} /> Log Practice Session
                  </Button>
                )}

                {/* Session History */}
                {hobby.sessions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)' }}>Recent Logs</div>
                    {hobby.sessions.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 8px',
                          background: 'var(--color-bg-secondary)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '11px',
                        }}
                      >
                        <span>{s.date} · {s.durationMinutes} mins {s.notes ? `(${s.notes})` : ''}</span>
                        <span style={{ color: 'var(--color-warning)' }}>{'★'.repeat(s.rating)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
