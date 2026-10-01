import React from 'react'
import { Check } from 'lucide-react'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: React.ReactNode
  variant?: 'default' | 'success'
  disabled?: boolean
  className?: string
  id?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  variant = 'default',
  disabled = false,
  className = '',
  id,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!disabled) onChange(!checked)
  }

  return (
    <label
      className={[
        'checkbox',
        checked ? 'checkbox--checked' : '',
        variant === 'success' ? 'checkbox--success' : '',
        disabled ? 'checkbox--disabled' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
          e.preventDefault()
          onChange(!checked)
        }
      }}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={() => {}}
        disabled={disabled}
        tabIndex={-1}
      />
      <div className="checkbox__box">
        <svg
          className="checkbox__check"
          viewBox="0 0 10 8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 4L3.8 7L9 1"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  )
}

// Re-export Check for backward compat
export { Check }
