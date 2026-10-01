import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { AlertTriangle } from 'lucide-react'

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDestructive && <AlertTriangle size={18} style={{ color: 'var(--color-danger, #b06868)' }} />}
          {title}
        </span>
      }
      maxWidth="420px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm()
              onCancel()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.5 }}>
        {message}
      </p>
    </Modal>
  )
}
