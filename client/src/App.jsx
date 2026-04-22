import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import MainLayout from './components/MainLayout'
import TitleBar from './components/TitleBar'
import { initSocket, disconnectSocket } from './utils/socket'

// Проверить, запущено ли в Tauri
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверить сохранённый токен при загрузке
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Инициализировать Socket.io
      initSocket(savedToken)
    }

    setLoading(false)
  }, [])

  const handleLogin = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    // Инициализировать Socket.io после входа
    initSocket(userToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
    // Отключить Socket.io
    disconnectSocket()
  }

  if (loading) {
    return (
      <div className="h-screen bg-bg-main flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-purple to-accent-red glow-purple animate-pulse" />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {isTauri && <TitleBar />}
      <div className="flex-1 overflow-hidden">
        {token && user ? (
          <MainLayout user={user} token={token} onLogout={handleLogout} />
        ) : (
          <AuthPage onLogin={handleLogin} />
        )}
      </div>
    </div>
  )
}

export default App
