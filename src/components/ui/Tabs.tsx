import React from 'react'

export interface TabOption<T extends string = string> {
  id: T
  label: React.ReactNode
  count?: number | string
}

export interface TabsProps<T extends string = string> {
  options: TabOption<T>[]
  activeId: T
  onChange: (id: T) => void
  className?: string
}

export function Tabs<T extends string = string>({
  options,
  activeId,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div className={`tabs ${className}`} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          role="tab"
          aria-selected={option.id === activeId}
          className={`tab-item ${option.id === activeId ? 'tab-item--active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count !== undefined && (
            <span style={{ opacity: 0.6, fontSize: '11px' }}>{option.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}
