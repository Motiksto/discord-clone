import { useState } from 'react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export default function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register'
      const response = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Сохранить токен и данные пользователя
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      onLogin(data.user, data.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-text-main mb-2">Welcome Back</h1>
          <p className="text-text-muted">
            {isLogin ? 'Login to continue' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-bg-panel rounded-2xl p-8 border-2 border-transparent hover:border-accent-purple hover:glow-purple-sm transition-all">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-bg-sidebar rounded-lg text-text-main placeholder-text-muted
                         border-2 border-transparent
                         focus:outline-none focus:border-accent-purple focus:glow-purple-sm
                         transition-all"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-text-main mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg-sidebar rounded-lg text-text-main placeholder-text-muted
                         border-2 border-transparent
                         focus:outline-none focus:border-accent-purple focus:glow-purple-sm
                         transition-all"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-lg p-3">
                <p className="text-accent-red text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white
                       bg-gradient-to-r from-accent-purple to-accent-red
                       hover:glow-purple active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all"
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-text-muted hover:text-accent-purple transition-colors"
            >
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span className="font-semibold text-accent-purple">
                {isLogin ? 'Register' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
