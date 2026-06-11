import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authUse'     // 👈 correct filename
import api from '../api/axios'
import type { AuthResponse } from '../types/types'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter username and password')
      return
    }

    try {
      setLoading(true)
      const { data } = await api.post<AuthResponse>('/auth/login', {
        username,
        password,
      })
      login(data.token, data.username)
      navigate('/dashboard')
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body flex flex-col relative overflow-hidden">

      {/* Background blobs — hidden on mobile for performance */}
      <div className="hidden sm:block absolute -top-[10%] -right-[5%] w-[30rem] h-[30rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-[10%] -left-[5%] w-[30rem] h-[30rem] rounded-full bg-blue-100/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full flex items-center px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-2">
          <span className="text-primary text-2xl sm:text-3xl">≋</span>
          <span className="text-xl sm:text-2xl font-extrabold tracking-tighter text-on-surface">
            Horbax
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md z-10">
          <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-[0px_12px_32px_rgba(19,27,46,0.06)] border border-outline-variant/20">

            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-on-surface tracking-tighter mb-2">
                Welcome Back
              </h1>
              <p className="text-outline font-medium text-xs sm:text-sm">
                Sign in to manage your laundry shop
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-outline group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-11 pr-4 py-3 sm:py-4 bg-surface-container-low rounded-xl outline-none border border-transparent focus:border-primary/40 focus:bg-white transition-all duration-300 text-on-surface placeholder:text-outline/50 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-outline group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 sm:py-4 bg-surface-container-low rounded-xl outline-none border border-transparent focus:border-primary/40 focus:bg-white transition-all duration-300 text-on-surface placeholder:text-outline/50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs sm:text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-horbax-gradient text-white font-bold py-3 sm:py-4 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      <span>Login</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-center py-4 sm:py-6">
        <p className="text-xs sm:text-sm text-outline">
          © 2025 Horbax. All rights reserved.
        </p>
      </footer>

    </div>
  )
}

export default Login