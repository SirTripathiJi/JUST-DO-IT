import React from 'react'

export interface ProgressBarProps {
  progress: number
  variant?: 'blue' | 'green' | 'amber' | 'purple'
  height?: number
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'blue',
  height = 5,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress))
  const variantClass = variant !== 'blue' ? `progress-bar__fill--${variant}` : ''

  return (
    <div
      className={`progress-bar ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`progress-bar__fill ${variantClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
