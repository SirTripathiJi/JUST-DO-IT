import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightAction?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, rightAction, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className="field">
        {label && <label htmlFor={inputId} className="field__label">{label}</label>}
        <div className="input-wrap">
          {leftIcon && (
            <span className="input-wrap__right" style={{ left: 10, right: 'auto', pointerEvents: 'none' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`input ${className}`}
            style={leftIcon ? { paddingLeft: 32 } : undefined}
            {...props}
          />
          {(rightIcon || rightAction) && (
            <span className={`input-wrap__right ${rightAction ? 'input-wrap__right--interactive' : ''}`}>
              {rightIcon || rightAction}
            </span>
          )}
        </div>
        {error && <span className="field__error">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
