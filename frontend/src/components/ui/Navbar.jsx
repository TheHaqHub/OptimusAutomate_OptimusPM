import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OP'

  return (
    <header className="bg-white border-b border-[#E4E4E7] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/boards" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#7C3AED] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">OP</span>
          </div>
          <span className="font-bold text-[#18181B] text-sm">OptimusPM</span>
        </Link>

        {/* User menu */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 hover:bg-[#F8FAFC] rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <span className="text-sm font-medium text-[#18181B] hidden sm:block">{user?.name}</span>
            <svg className="w-3.5 h-3.5 text-[#71717A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E4E4E7] rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-[#E4E4E7]">
                <p className="text-xs font-semibold text-[#18181B] truncate">{user?.name}</p>
                <p className="text-xs text-[#71717A] truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-[#EF4444] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}