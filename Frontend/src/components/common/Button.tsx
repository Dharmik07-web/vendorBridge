import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  isLoading?: boolean
  children: ReactNode
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-primary-container hover:bg-[#16a34a] text-on-primary-container shadow-glass active:scale-95',
    secondary:
      'bg-transparent border-2 border-outline-variant text-on-surface hover:bg-surface-container-high dark:border-outline dark:hover:bg-surface-container-high',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container-high',
    danger: 'bg-error hover:bg-red-700 text-on-error shadow-glass active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-2 text-body-sm',
    md: 'px-4 py-3 text-body-sm',
    lg: 'px-6 py-4 text-title-md',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="animate-spin">⏳</span>}
      {icon}
      {children}
    </button>
  )
}

export default Button
