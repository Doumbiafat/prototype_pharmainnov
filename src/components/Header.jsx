import { Mail, Search, User, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLayout } from '../context/LayoutContext'
import { usePreview } from './PreviewModal'

export default function Header({ searchPlaceholder = 'Rechercher...', showBrand = true, title }) {
  const { user, logout } = useAuth()
  const { openPreview } = usePreview()
  const { openSidebar } = useLayout()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-pi-border bg-white px-3 sm:h-16 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={openSidebar}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-pi-text hover:bg-slate-100 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu size={20} />
      </button>

      {title ? (
        <h1 className="max-w-[40%] shrink-0 truncate text-base font-bold text-pi-blue sm:max-w-none sm:text-xl">
          {title}
        </h1>
      ) : showBrand ? (
        <div className="hidden shrink-0 text-lg font-bold text-pi-blue sm:block">Pharma Innov</div>
      ) : null}

      <div className="mx-auto flex min-w-0 w-full max-w-xl items-center">
        <div className="relative w-full">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:left-3.5"
          />
          <input
            type="search"
            placeholder={searchPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const q = e.currentTarget.value.trim()
                openPreview({
                  title: 'Recherche globale',
                  subtitle: q ? `Résultats pour « ${q} »` : 'Prévisualisation du moteur de recherche',
                  body: 'Dans la version finale, cette barre permettra de rechercher laboratoires, APD, factures, produits et alertes en temps réel.',
                  rows: [
                    ['Requête', q || '(vide)'],
                    ['Périmètre', 'Laboratoires · APD · Factures · Alertes'],
                    ['Raccourci', 'Entrée pour rechercher'],
                  ],
                })
              }
            }}
            className="w-full rounded-full border-0 bg-[#eef1f6] py-2 pl-9 pr-3 text-sm text-pi-text outline-none ring-0 placeholder:text-slate-400 focus:bg-[#e8ecf3] focus:ring-2 focus:ring-pi-blue/20 sm:py-2.5 sm:pl-10 sm:pr-4"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() =>
            openPreview({
              title: 'Messages & notifications',
              subtitle: 'Boîte de réception — aperçu',
              body: 'Les alertes AMM, soldes critiques et validations APD apparaîtront ici.',
              rows: [
                ['Non lus', '3 messages'],
                ['Dernier', 'APD-2023-0847 validée'],
                ['Priorité', '1 alerte critique'],
              ],
              confirmLabel: 'Marquer comme lu',
            })
          }
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <Mail size={18} strokeWidth={1.8} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-pi-orange ring-2 ring-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() =>
            openPreview({
              title: 'Profil utilisateur',
              subtitle: user?.name || 'Pharmacien',
              body: 'Gestion du compte, préférences et déconnexion.',
              rows: [
                ['Rôle', user?.role || 'pharmacien'],
                ['Email', user?.email || '—'],
                ['Session', 'Active'],
              ],
              confirmLabel: 'Se déconnecter',
              onConfirm: () => {
                logout()
                navigate('/login')
              },
            })
          }
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <User size={18} strokeWidth={1.8} />
        </motion.button>
      </div>
    </header>
  )
}
