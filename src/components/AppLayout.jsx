import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LayoutProvider } from '../context/LayoutContext'
import Sidebar from './Sidebar'
import Header from './Header'

const searchPlaceholders = {
  '/': 'Rechercher...',
  '/laboratoires': 'Rechercher des laboratoires...',
  '/medicaments': 'Rechercher un médicament...',
  '/journal': 'Rechercher...',
  '/apd': 'Rechercher une APD...',
  '/frais-ministeriels': 'Rechercher des frais...',
  '/comptes': 'Rechercher un compte...',
  '/creances': 'Rechercher une créance...',
  '/alertes': 'Rechercher une alerte...',
  '/rapports': 'Rechercher un rapport...',
}

function LayoutShell() {
  const location = useLocation()
  const isJournal = location.pathname === '/journal'
  const placeholder =
    Object.entries(searchPlaceholders).find(([path]) =>
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    )?.[1] || 'Rechercher...'

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-pi-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          searchPlaceholder={placeholder}
          showBrand={!isJournal}
          title={isJournal ? 'Journal des Activités' : undefined}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function AppLayout() {
  return (
    <LayoutProvider>
      <LayoutShell />
    </LayoutProvider>
  )
}
