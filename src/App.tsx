import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import PublicEventsPage from './pages/PublicEventsPage'

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  // Check localStorage on component mount
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth === 'true') {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = () => {
    setIsLoggedIn(true)
    navigate('/dashboard/activities')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<PublicEventsPage />} />
      <Route path="/login" element={
        isLoggedIn ? <Navigate to="/dashboard/activities" replace /> : <LoginPage onLogin={handleLogin} />
      } />
      <Route path="/dashboard/*" element={
        isLoggedIn ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
