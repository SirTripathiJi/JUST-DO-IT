import React from 'react'
import {
  Pill,
  Plus,
  Clock,
  Trash2,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getTodayDateString } from '../../data/seedData'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Checkbox } from '../../components/ui/Checkbox'

export const SupplementsModule: React.FC = () => {
  const { supplements, toggleSupplement, deleteSupplement, openModal, metrics } = useApp()
  const todayStr = getTodayDateString()

  // Group supplements by timing
  const timings = ['morning', 'noon', 'evening', 'bedtime'] as const

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Nutrition · Daily Vitamins & Protocols</div>
          <h1 className="page-title">Supplements & Protocols</h1>
        </div>
        <Button variant="primary" onClick={() => openModal('supplement')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> Add Supplement
        </Button>
      </div>

      {/* Adherence Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div
          style={{
            padding: '16px',
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Taken Today</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>
            {metrics.supplementsTakenToday} / {metrics.totalSupplements}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '2px' }}>
            {metrics.totalSupplements > 0 ? Math.round((metrics.supplementsTakenToday / metrics.totalSupplements) * 100) : 0}% Daily Protocol Adherence
          </div>
        </div>

        <div
          style={{
            padding: '16px',
            background: 'var(--color-bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Active Protocols</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '2px' }}>
            {supplements.length} items
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
            Timed Morning to Bedtime
          </div>
        </div>
      </div>

      {/* Grouped Timing Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {timings.map((timing) => {
          const items = supplements.filter((s) => s.timing === timing || (timing === 'morning' && s.timing === 'with-meal'))
          return (
            <div
              key={timing}
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
                  <Clock size={15} style={{ color: 'var(--color-accent)' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>
                    {timing} Protocol
                  </h3>
                </div>
                <Badge variant="gray">{items.length} items</Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    No supplements scheduled for {timing}.
                  </div>
                ) : (
                  items.map((sup) => (
                    <div
                      key={sup.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        background: sup.takenToday ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Checkbox
                          checked={sup.takenToday}
                          onChange={() => toggleSupplement(sup.id)}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              textDecoration: sup.takenToday ? 'line-through' : 'none',
                              color: sup.takenToday ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                            }}
                          >
                            {sup.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                            {sup.dosage} {sup.unit} {sup.notes ? `· ${sup.notes}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {sup.currentStreak > 0 && (
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-warning)' }}>
                            🔥 {sup.currentStreak}d
                          </span>
                        )}
                        <button
                          onClick={() => deleteSupplement(sup.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '2px' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
