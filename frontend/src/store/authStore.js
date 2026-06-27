import { create } from 'zustand'
import { loginUser, registerUser, getCurrentUser } from '../api/auth.api'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async ({ email, password }) => {
  set({ error: null, isLoading: false })
  const res = await loginUser({ email, password })
  const { token, user } = res.data.data        // ← .data.data
  localStorage.setItem('token', token)
  set({ user, token, isLoading: false })
},

register: async ({ name, email, password }) => {
  set({ error: null, isLoading: false })
  const res = await registerUser({ name, email, password })
  const { token, user } = res.data.data        // ← .data.data
  localStorage.setItem('token', token)
  set({ user, token, isLoading: false })
},

loadUser: async () => {
  const token = localStorage.getItem('token')
  if (!token) { set({ isLoading: false }); return }
  try {
    const res = await getCurrentUser()
    set({ user: res.data.data.user, token, isLoading: false })  // ← .data.data.user
  } catch {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoading: false })
  }
},
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoading: false })
  },

  setError: (error) => set({ error }),
}))

export default useAuthStore