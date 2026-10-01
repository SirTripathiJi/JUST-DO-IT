import React from 'react'

export interface ProgressRingProps {
  radius?: number
  strokeWidth?: number
  progress: number
  color?: string
  children?: React.ReactNode
  className?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  radius = 22,
  strokeWidth = 3.5,
  progress,
  color,
  children,
  className = '',
}) => {
  const norm = radius - strokeWidth / 2
  const circ = norm * 2 * Math.PI
  const clamped = Math.min(100, Math.max(0, progress))
  const offset = circ - (clamped / 100) * circ

  return (
    <div
      className={`progress-ring ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
    >
      <svg
        className="progress-ring__svg"
        width={radius * 2}
        height={radius * 2}
        aria-label={`${clamped}% complete`}
      >
        <circle
          className="progress-ring__track"
          fill="none"
          strokeWidth={strokeWidth}
          r={norm}
          cx={radius}
          cy={radius}
        />
        <circle
          className="progress-ring__fill"
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circ} ${circ}`}
          style={{
            strokeDashoffset: offset,
            stroke: color || 'var(--accent)',
          }}
          r={norm}
          cx={radius}
          cy={radius}
        />
      </svg>
      {children && <div className="progress-ring__label">{children}</div>}
    </div>
  )
}
