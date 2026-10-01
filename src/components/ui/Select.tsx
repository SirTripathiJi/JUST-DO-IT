import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption { value: string; label: string }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

    return (
      <div className="field">
        {label && <label htmlFor={selectId} className="field__label">{label}</label>}
        <div className="input-wrap">
          <select ref={ref} id={selectId} className={`select-input input ${className}`} {...props}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="input-wrap__right">
            <ChevronDown size={14} />
          </span>
        </div>
        {error && <span className="field__error">{error}</span>}
      </div>
    )
  }
)
Select.displayName = 'Select'
