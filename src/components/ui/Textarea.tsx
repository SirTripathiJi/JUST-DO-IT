import React from 'react'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const tId = id || (label ? `ta-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
    return (
      <div className="field">
        {label && <label htmlFor={tId} className="field__label">{label}</label>}
        <textarea ref={ref} id={tId} className={`textarea ${className}`} {...props} />
        {error && <span className="field__error">{error}</span>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
