import { motion } from 'framer-motion'
import { fadeUpItem } from './PageTransition'

export function StatusBadge({ status, labels }) {
  const meta = labels[status] || { label: status, className: 'bg-slate-100 text-slate-500' }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  )
}

export function KpiCard({ title, value, sub, subColor = 'text-pi-green', icon: Icon, iconBg = 'bg-pi-blue-light', iconColor = 'text-pi-blue' }) {
  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(0,0,0,0.08)' }}
      className="rounded-xl border border-pi-border/60 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-pi-muted">{title}</p>
          <p className="mt-2 truncate text-xl font-bold tracking-tight text-pi-text sm:text-2xl">{value}</p>
          {sub && <p className={`mt-1.5 text-xs font-medium ${subColor}`}>{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconBg}`}>
            <Icon size={20} className={iconColor} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <motion.div
      variants={fadeUpItem}
      className={`rounded-xl border border-pi-border/60 bg-white shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-pi-text sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-pi-muted">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-2.5">
          {actions}
        </div>
      )}
    </div>
  )
}

export function Btn({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const styles = {
    primary: 'bg-pi-orange text-white hover:bg-pi-orange-dark shadow-sm shadow-pi-orange/25',
    green: 'bg-pi-green text-white hover:bg-emerald-700 shadow-sm',
    outlineGreen: 'border border-pi-green bg-white text-pi-green hover:bg-pi-green-light',
    outline: 'border border-pi-border bg-white text-pi-text hover:bg-slate-50',
    ghost: 'bg-transparent text-pi-muted hover:bg-slate-100',
  }
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:px-4 sm:py-2.5 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function Avatar({ initials, color, size = 'md' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg font-bold text-white ${sizes[size]}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
