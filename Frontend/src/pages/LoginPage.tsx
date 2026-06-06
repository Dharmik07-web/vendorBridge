import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/common'
import { mockUsers } from '@/mock/data'
import { toast } from 'sonner'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock authentication
      const user = mockUsers.find((u) => u.email === email)
      if (user && password === 'password') {
        login(user, 'mock-token-' + user.id)
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        toast.error('Invalid email or password')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login not yet implemented`)
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Side: Branding */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-margin-desktop bg-inverse-surface overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(#22c55e 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          ></div>
        </div>

        <div className="relative z-10 flex items-center gap-stack-sm">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <span className="text-2xl">🏬</span>
          </div>
          <span className="font-title-md text-title-md font-bold text-inverse-on-surface">
            VendorBridge
          </span>
        </div>

        <div className="relative z-10 space-y-stack-md max-w-lg">
          <h1 className="font-display-lg text-display-lg text-inverse-on-surface leading-tight">
            Scale your procurement <span className="text-primary-fixed">with precision.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-surface-variant/80">
            The enterprise ecosystem for vendor management, streamlined RFQs, and automated
            purchase orders in one secure vault.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-gutter">
          <div className="p-stack-md glass-card rounded-xl">
            <div className="text-primary-fixed font-bold text-title-md">99.9%</div>
            <div className="text-surface-variant font-label-caps uppercase tracking-wider">
              Uptime SLA
            </div>
          </div>
          <div className="p-stack-md glass-card rounded-xl">
            <div className="text-primary-fixed font-bold text-title-md">256-bit</div>
            <div className="text-surface-variant font-label-caps uppercase tracking-wider">
              AES Encryption
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-[#0f172a]">
        <div className="w-full max-w-md space-y-stack-lg">
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-stack-sm mb-stack-lg">
            <span className="text-3xl">🏬</span>
            <span className="font-title-md text-title-md font-bold text-white">VendorBridge</span>
          </div>

          <div className="space-y-stack-sm">
            <h2 className="font-headline-lg text-headline-lg text-white">Sign In</h2>
            <p className="font-body-sm text-body-sm text-secondary-fixed-dim">
              Welcome back to your procurement management platform.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-stack-md">
            {/* Email */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-surface-variant/70 block px-1">
                Business Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-fixed-dim group-focus-within:text-primary transition-colors">
                  ✉️
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-inverse-surface border border-outline-variant/20 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-surface-variant/30 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-label-caps text-label-caps text-surface-variant/70 block px-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-secondary-fixed-dim group-focus-within:text-primary transition-colors">
                  🔒
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-inverse-surface border border-outline-variant/20 text-white rounded-xl py-3.5 pl-11 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-surface-variant/30 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-secondary-fixed-dim hover:text-white transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-outline-variant/20 bg-inverse-surface text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-body-sm text-secondary-fixed-dim">Remember me</span>
              </label>
              <a href="#" className="text-body-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Demo Info */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-200">
              <strong>Demo Credentials:</strong> Use any email from mockUsers with password "password"
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-stack-md"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/10"></div>
            <span className="flex-shrink mx-4 font-label-caps text-label-caps text-surface-variant/30">
              Or continue with
            </span>
            <div className="flex-grow border-t border-outline-variant/10"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-stack-md">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-2 py-3 px-4 glass-card rounded-xl hover:bg-white/10 transition-colors text-white"
            >
              <span>🔵</span>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('LinkedIn')}
              className="flex items-center justify-center gap-2 py-3 px-4 glass-card rounded-xl hover:bg-white/10 transition-colors text-white"
            >
              <span>🔗</span>
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-secondary-fixed-dim text-body-sm">
            © 2024 VendorBridge Inc. Secure Infrastructure.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
