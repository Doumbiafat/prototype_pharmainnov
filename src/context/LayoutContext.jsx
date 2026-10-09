import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

const LayoutContext = createContext(null)

export function LayoutProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), [])

  // Close drawer on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close on Escape
  useEffect(() => {
    if (!sidebarOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (!sidebarOpen) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sidebarOpen])

  const value = useMemo(
    () => ({ sidebarOpen, openSidebar, closeSidebar, toggleSidebar }),
    [sidebarOpen, openSidebar, closeSidebar, toggleSidebar]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
