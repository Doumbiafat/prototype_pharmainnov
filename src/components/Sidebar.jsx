import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Landmark,
  FileText,
  Wallet,
  HandCoins,
  Activity,
  Bell,
  BarChart3,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  Pill,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLayout } from '../context/LayoutContext'
import { usePreview } from './PreviewModal'

const mainNav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/laboratoires', label: 'Laboratoires & Contrats', icon: Building2 },
  { to: '/medicaments', label: 'Médicaments', icon: Pill },
  { to: '/frais-ministeriels', label: 'Frais Ministériels', icon: Landmark },
  { to: '/apd', label: 'APD & Facturation', icon: FileText },
  { to: '/comptes', label: 'Comptes & Trésorerie', icon: Wallet },
  { to: '/creances', label: 'Créances', icon: HandCoins },
  { to: '/journal', label: 'Journal des Activités', icon: Activity },
  { to: '/alertes', label: 'Alertes', icon: Bell },
  { to: '/rapports', label: 'Rapports', icon: BarChart3 },
]

function Logo() {
  return (
    <div className="mx-3 mt-4 mb-6 overflow-hidden rounded-lg bg-white px-2 py-2.5 shadow-sm">
      <img
        src="/logo-pharma-innov.jpg"
        alt="Pharma Innov Consulting"
        className="h-9 w-full object-contain object-left sm:h-10"
      />
    </div>
  )
}

function SidebarPanel({ onNavigate }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { openPreview } = usePreview()

  return (
    <div className="flex h-full w-[min(280px,85vw)] flex-col bg-pi-blue text-white lg:w-[260px]">
      <div className="flex items-start justify-between gap-2 pr-2 lg:pr-0">
        <div className="min-w-0 flex-1">
          <Logo />
        </div>
        <button
          type="button"
          onClick={onNavigate}
          className="mt-4 mr-2 rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
          aria-label="Fermer le menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-2">
        {mainNav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-pi-orange text-white shadow-sm'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                <span className="leading-tight">{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onNavigate?.()
            navigate('/apd/nouvelle')
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-pi-orange px-3 py-3 text-[13px] font-semibold text-white shadow-md shadow-pi-orange/30"
        >
          <Plus size={18} strokeWidth={2.5} />
          Nouvelle Demande
        </motion.button>

        {user && (
          <div className="mb-3 flex items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ backgroundColor: user.color }}
            >
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="truncate text-[10px] text-white/70 capitalize">{user.role}</p>
            </div>
            <button
              type="button"
              title="Déconnexion"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}

        <div className="space-y-0.5 border-t border-white/15 pt-3">
          <button
            type="button"
            onClick={() =>
              openPreview({
                title: 'Paramètres',
                subtitle: 'Configuration de la plateforme',
                body: 'Gestion des rôles, nomenclatures produits/activités, tarifs négociés et préférences de numérotation APD/factures.',
                rows: [
                  ['Rôles', 'Pharmacien · Comptabilité · Direction'],
                  ['Numérotation', 'APD-AAAA-XXXX / FAC-AAAA-XXXX'],
                  ['Devise', 'XOF'],
                ],
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/90 hover:bg-white/10"
          >
            <Settings size={18} strokeWidth={1.8} />
            Paramètres
          </button>
          <button
            type="button"
            onClick={() =>
              openPreview({
                title: 'Support',
                subtitle: 'Aide & assistance Pharma Innov',
                body: 'Contactez l’équipe support pour un accompagnement sur le workflow APD, la facturation ou les comptes d’acompte.',
                rows: [
                  ['Email', 'support@pharmainnov.ci'],
                  ['Horaires', 'Lun–Ven 8h–18h'],
                  ['SLA', 'Réponse < 4h'],
                ],
                confirmLabel: 'Ouvrir un ticket',
              })
            }
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/90 hover:bg-white/10"
          >
            <HelpCircle size={18} strokeWidth={1.8} />
            Support
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useLayout()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen shrink-0 lg:flex">
        <SidebarPanel />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
              onClick={closeSidebar}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="absolute inset-y-0 left-0 shadow-2xl"
            >
              <SidebarPanel onNavigate={closeSidebar} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
