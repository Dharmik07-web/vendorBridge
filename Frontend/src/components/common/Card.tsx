import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  border?: boolean
}

export const Card = ({ children, className, glass = true, border = true }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl p-stack-md',
        glass && 'glass-card',
        !glass && 'bg-surface-container-low dark:bg-surface-container-high',
        border && 'border border-outline-variant/20',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children?: ReactNode
}

export const CardHeader = ({ title, subtitle, action, children }: CardHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-stack-md pb-stack-md border-b border-outline-variant/20">
      <div>
        {title && <h3 className="font-title-md text-title-md text-on-surface">{title}</h3>}
        {subtitle && <p className="text-body-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {children}
    </div>
  )
}

export const CardBody = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn('space-y-stack-md', className)}>{children}</div>
}

export const CardFooter = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 pt-stack-md border-t border-outline-variant/20',
        className
      )}
    >
      {children}
    </div>
  )
}
