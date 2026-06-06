import { getStatusColor } from '@/lib/utils'

interface BadgeProps {
  status: string
  label?: string
  small?: boolean
}

export const Badge = ({ status, label, small = false }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center rounded-full font-label-caps text-label-caps font-semibold ${getStatusColor(
        status
      )} ${small ? 'px-2 py-1 text-xs' : 'px-3 py-1.5'}`}
    >
      {label || status.replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}

export default Badge
