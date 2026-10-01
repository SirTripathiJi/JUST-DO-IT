import React from 'react'

export type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  pill?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  pill = false,
  icon,
  children,
  className = '',
  ...props
}) => (
  <span
    className={['badge', `badge--${variant}`, pill ? 'badge--pill' : '', className]
      .filter(Boolean)
      .join(' ')}
    {...props}
  >
    {icon}
    {children}
  </span>
)
