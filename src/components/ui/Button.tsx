import React from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const cls = [
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      icon ? 'btn--icon' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} className={cls} {...props}>
        {leftIcon && <span className="btn__icon">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="btn__icon">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
