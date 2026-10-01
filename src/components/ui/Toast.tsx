import React, { useEffect } from 'react'
import { CheckCircle2, RotateCcw, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useApp()

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      dismissToast()
    }, toast.durationMs || 5000)
    return () => clearTimeout(timer)
  }, [toast, dismissToast])

  if (!toast) return null

  return (
    <div className="toast-container" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'var(--color-bg-elevated)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      padding: '10px 16px',
      fontSize: '13px',
      fontWeight: 500,
      animation: 'toastSlideUp 200ms ease-out',
    }}>
      <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
      <span style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {toast.message}
      </span>
      {toast.undoAction && (
        <button
          onClick={() => {
            toast.undoAction?.()
            dismissToast()
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-accent)',
            cursor: 'pointer',
            marginLeft: '4px',
          }}
        >
          <RotateCcw size={11} />
          {toast.undoLabel || 'Undo'}
        </button>
      )}
      <button
        onClick={dismissToast}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-tertiary)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  )
}
