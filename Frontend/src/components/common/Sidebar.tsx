import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { id: 'vendors', label: 'Vendors', icon: '🏢', path: '/vendors' },
  { id: 'rfqs', label: 'RFQs', icon: '📄', path: '/rfqs' },
  { id: 'quotations', label: 'Quotations', icon: '💬', path: '/quotations' },
  { id: 'approvals', label: 'Approvals', icon: '✅', path: '/approvals' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: '🛒', path: '/purchase-orders' },
  { id: 'invoices', label: 'Invoices', icon: '💳', path: '/invoices' },
  { id: 'reports', label: 'Reports & Analytics', icon: '📈', path: '/reports' },
  { id: 'activity-logs', label: 'Activity Logs', icon: '📋', path: '/activity-logs' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
]

export const Sidebar = () => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface border-r border-outline-variant flex flex-col p-stack-md z-40 dark:bg-inverse-surface">
      {/* Logo */}
      <div className="mb-stack-lg px-3">
        <h1 className="font-title-md text-title-md font-bold text-on-surface flex items-center gap-2">
          🏬 VendorBridge
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">
          Enterprise Procurement
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-body-sm text-body-sm',
              isActive(item.path)
                ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t border-outline-variant pt-stack-md">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container-low dark:bg-surface-container-high">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
              {user.firstName.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-body-sm font-semibold text-on-surface">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-on-surface-variant">{user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
