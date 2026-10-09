import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuth, DEMO_USERS } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('pharmacien@pharmainnov.ci')
  const [password, setPassword] = useState('demo123')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const res = login(email, password)
      setLoading(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      navigate(from, { replace: true })
    }, 600)
  }

  return (
    <div className="relative flex min-h-[100dvh] overflow-hidden bg-pi-bg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(0,150,214,0.12),_transparent_50%),radial-gradient(ellipse_at_bottom_right,_rgba(242,101,34,0.08),_transparent_45%)]" />

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Panneau bleu — desktop uniquement */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-1 flex-col justify-center bg-pi-blue px-8 py-12 text-white lg:flex lg:max-w-md xl:max-w-lg xl:px-12"
        >
          <img
            src="/logo-pharma-innov.jpg"
            alt="Pharma Innov Consulting"
            className="mb-10 h-12 w-auto self-start rounded-md bg-white object-contain p-2 shadow-sm"
          />
          <h1 className="text-3xl font-bold leading-tight tracking-tight">
            Espace Pharmacien
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            Créez vos Autorisations Préalables de Dépense, suivez le financement
            (acompte ou préfinancement) et générez automatiquement les factures.
          </p>

          <div className="mt-10 space-y-3">
            {[
              'Numérotation automatique APD & factures',
              'Prélèvement acompte ou préfinancement',
              'Export PDF instantané',
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pi-orange text-[10px] font-bold">
                  ✓
                </span>
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Formulaire — mobile + desktop */}
        <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:min-h-0 lg:py-12">
          {/* Logo mobile uniquement */}
          <motion.img
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            src="/logo-pharma-innov.jpg"
            alt="Pharma Innov Consulting"
            className="mb-8 h-11 w-auto rounded-md bg-white object-contain p-2 shadow-sm lg:hidden"
          />

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl border border-pi-border bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-8"
          >
            <h2 className="text-xl font-bold text-pi-text">Connexion</h2>
            <p className="mt-1 text-sm text-pi-muted">Accédez à votre espace réglementaire</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-pi-muted">
                  Email
                </span>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-pi-border bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-pi-blue focus:bg-white focus:ring-2 focus:ring-pi-blue/20"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-pi-muted">
                  Mot de passe
                </span>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-pi-border bg-slate-50 py-3 pl-10 pr-11 text-sm outline-none focus:border-pi-blue focus:bg-white focus:ring-2 focus:ring-pi-blue/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pi-text"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-lg bg-pi-red-light px-3 py-2 text-sm font-medium text-pi-red"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pi-orange py-3.5 text-sm font-bold text-white shadow-lg shadow-pi-orange/25 disabled:opacity-70"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
              {!loading && <ArrowRight size={16} />}
            </motion.button>

            <div className="mt-6 rounded-xl border border-dashed border-pi-border bg-slate-50 p-3 text-xs text-pi-muted">
              <p className="font-semibold text-pi-text">Compte démo pharmacien</p>
              <p className="mt-1">{DEMO_USERS[0].email}</p>
              <p>Mot de passe : demo123</p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
