import React, { useState } from 'react'
import {
  Droplets,
  Plus,
  RotateCcw,
  Clock,
  TrendingUp,
  Settings,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'

export const WaterModule: React.FC = () => {
  const { waterLog, logWater, resetWater, setWaterTarget, openModal, metrics } = useApp()
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetDraft, setTargetDraft] = useState(waterLog.targetMl)

  const handleSaveTarget = () => {
    if (targetDraft >= 500) {
      setWaterTarget(targetDraft)
    }
    setIsEditingTarget(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="page-meta">Vitals & Cellular Hydration</div>
          <h1 className="page-title">Water Tracker</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" onClick={resetWater} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={13} /> Reset Day
          </Button>
          <Button variant="primary" onClick={() => openModal('water')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Log Water
          </Button>
        </div>
      </div>

      {/* Hero Hydration Progress Card */}
      <div
        style={{
          padding: '24px',
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--color-accent)' }}>
          {(waterLog.currentMl / 1000).toFixed(2)}{' '}
          <span style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            / {(waterLog.targetMl / 1000).toFixed(2)} Litres
          </span>
        </div>

        <div style={{ width: '100%', maxWidth: '480px' }}>
          <ProgressBar progress={metrics.waterPercentage} variant="blue" height={10} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge variant={metrics.waterPercentage >= 100 ? 'green' : 'blue'}>
            {metrics.waterPercentage}% of Daily Target Reached
          </Badge>
          <button
            onClick={() => {
              setTargetDraft(waterLog.targetMl)
              setIsEditingTarget(!isEditingTarget)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {isEditingTarget ? 'Close' : 'Adjust Target'}
          </button>
        </div>

        {isEditingTarget && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
            <input
              type="number"
              step={250}
              value={targetDraft}
              onChange={(e) => setTargetDraft(Number(e.target.value))}
              style={{
                width: '120px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
              }}
            />
            <Button size="xs" variant="primary" onClick={handleSaveTarget}>
              Save
            </Button>
          </div>
        )}
      </div>

      {/* One-Tap Quick Log Container Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Glass', amount: 250, desc: 'Small cup / water glass' },
          { label: 'Mug', amount: 350, desc: 'Coffee mug / large glass' },
          { label: 'Bottle', amount: 500, desc: 'Standard water bottle' },
          { label: 'Flask', amount: 750, desc: 'Sports hydration flask' },
          { label: 'Jug', amount: 1000, desc: 'Large 1 Litre bottle' },
        ].map((container) => (
          <button
            key={container.amount}
            onClick={() => logWater(container.amount, container.label)}
            style={{
              padding: '16px',
              background: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 120ms ease, border-color 120ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border-subtle)')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                +{container.amount} ml
              </span>
              <Droplets size={16} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-accent)', marginTop: '4px' }}>
              {container.label}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
              {container.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Timeline of Intake Entries */}
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-subtle)',
          padding: '18px 20px',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Today's Intake Timeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {waterLog.entries.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '12px' }}>
              No water logged yet today. Click one of the bottle presets above to log.
            </div>
          ) : (
            waterLog.entries.map((entry) => (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Droplets size={14} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>+{entry.amountMl} ml</span>
                  {entry.containerName && (
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      ({entry.containerName})
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
