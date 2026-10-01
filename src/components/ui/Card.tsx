import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  ghost?: boolean
  children: React.ReactNode
  className?: string
}

/** Use Card only when content genuinely needs visual grouping */
export const Card: React.FC<CardProps> = ({ ghost, children, className = '', ...props }) => (
  <div
    className={['card', ghost ? 'card--ghost' : '', className].filter(Boolean).join(' ')}
    {...props}
  >
    {children}
  </div>
)

export const CardHeader: React.FC<{
  title?: React.ReactNode
  subtitle?: React.ReactNode
  icon?: React.ReactNode
  action?: React.ReactNode
  children?: React.ReactNode
  className?: string
}> = ({ title, subtitle, icon, action, children, className = '' }) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      gap: 12,
    }}
  >
    {children || (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {icon && (
            <span style={{ color: 'var(--text-tertiary)', display: 'flex', flexShrink: 0 }}>
              {icon}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
            )}
            {subtitle && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 1 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {action && <div style={{ flexShrink: 0 }}>{action}</div>}
      </>
    )}
  </div>
)

export const CardBody: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({
  children,
  className = '',
  style,
}) => (
  <div className={className} style={{ padding: '14px 16px', ...style }}>
    {children}
  </div>
)

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={className}
    style={{
      padding: '10px 16px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    {children}
  </div>
)
