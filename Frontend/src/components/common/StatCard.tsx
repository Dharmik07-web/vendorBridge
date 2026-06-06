import { type ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  subtitle?: string
  onClick?: () => void
}

export const StatCard = ({
  icon,
  label,
  value,
  trend,
  trendValue,
  subtitle,
  onClick,
}: StatCardProps) => {
  return (
    <div
      onClick={onClick}
      className="glass-card p-stack-md cursor-pointer hover:shadow-glass-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-stack-md">
        <div className="text-primary-container text-2xl">{icon}</div>
        {trend && (
          <div
            className={`text-label-caps font-bold ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                  ? 'text-red-600'
                  : 'text-yellow-600'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue || '+0%'}
          </div>
        )}
      </div>
      <p className="text-body-sm text-on-surface-variant mb-1">{label}</p>
      <p className="text-title-md text-on-surface font-bold">{value}</p>
      {subtitle && <p className="text-body-sm text-on-surface-variant mt-1">{subtitle}</p>}
    </div>
  )
}

export default StatCard
