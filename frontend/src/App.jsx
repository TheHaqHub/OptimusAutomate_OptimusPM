import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Boards from './pages/Boards'
import BoardDetail from './pages/BoardDetail'

function PrivateRoute({ children }) {
  const { token, isLoading } = useAuthStore()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-8 h-8 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin" /></div>
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token } = useAuthStore()
  return token ? <Navigate to="/boards" replace /> : children
}

export default function App() {
  const { loadUser } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/boards" element={<PrivateRoute><Boards /></PrivateRoute>} />
        <Route path="/boards/:id" element={<PrivateRoute><BoardDetail /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}