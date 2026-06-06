import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

export const Header = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [showMenu, setShowMenu] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const toggleDarkMode = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    setIsDark(!isDark)
    localStorage.setItem('theme', isDark ? 'light' : 'dark')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-64 right-0 bg-surface border-b border-outline-variant h-16 flex items-center justify-between px-margin-desktop z-30 dark:bg-inverse-surface">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search quotations, vendors or RFQs..."
          className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-body-sm placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-inverse-surface dark:border-outline-variant/50"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notification Bell */}
        <button className="relative text-on-surface hover:text-primary transition-colors">
          <span className="text-xl">🔔</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-on-surface hover:text-primary transition-colors text-xl"
          title="Toggle dark mode"
        >
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container text-sm">
              {user?.firstName.charAt(0)}
            </div>
            <span className="text-body-sm text-on-surface">{user?.firstName}</span>
            <span className="text-xs">▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 glass-card shadow-glass-lg">
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-high"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full text-left px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-high"
              >
                👤 Profile
              </button>
              <hr className="my-2 border-outline-variant/20" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-body-sm text-error hover:bg-red-50 dark:hover:bg-red-950 rounded-b-lg"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
