import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = [
  {
    email: 'pharmacien@pharmainnov.ci',
    password: 'demo123',
    name: 'Dr. Rousseau',
    role: 'pharmacien',
    initials: 'DR',
    color: '#0096d6',
  },
  {
    email: 'dr.kone@pharmainnov.ci',
    password: 'demo123',
    name: 'Dr. Awa Koné',
    role: 'pharmacien',
    initials: 'AK',
    color: '#22a06b',
  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('pi_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = (email, password) => {
    const found = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!found) return { ok: false, error: 'Identifiants incorrects' }
    const { password: _, ...safe } = found
    setUser(safe)
    sessionStorage.setItem('pi_user', JSON.stringify(safe))
    return { ok: true, user: safe }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('pi_user')
  }

  const value = useMemo(() => ({ user, login, logout, isAuthenticated: !!user }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { DEMO_USERS }
