import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Eye, CheckCircle2 } from 'lucide-react'

const PreviewContext = createContext(null)

export function PreviewProvider({ children }) {
  const [preview, setPreview] = useState(null)

  const openPreview = useCallback((payload) => {
    setPreview({
      title: payload.title || 'Prévisualisation',
      subtitle: payload.subtitle || 'Aperçu de démonstration — fonctionnalité à venir',
      body: payload.body || null,
      rows: payload.rows || [],
      badge: payload.badge || 'Prototype',
      confirmLabel: payload.confirmLabel || 'Compris',
      onConfirm: payload.onConfirm || null,
    })
  }, [])

  const closePreview = useCallback(() => setPreview(null), [])

  const value = useMemo(() => ({ openPreview, closePreview }), [openPreview, closePreview])

  return (
    <PreviewContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {preview && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Fermer"
              className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
              onClick={closePreview}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-hidden rounded-t-2xl border border-pi-border bg-white shadow-2xl sm:rounded-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-pi-border bg-gradient-to-r from-pi-blue-light to-white px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pi-blue text-white">
                    <Eye size={18} />
                  </div>
                  <div>
                    <div className="mb-1 inline-flex rounded-full bg-pi-orange-light px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-pi-orange">
                      {preview.badge}
                    </div>
                    <h3 className="text-lg font-bold text-pi-text">{preview.title}</h3>
                    <p className="mt-0.5 text-sm text-pi-muted">{preview.subtitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-pi-text"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[55vh] overflow-y-auto px-5 py-4">
                {preview.body && (
                  <p className="mb-4 text-sm leading-relaxed text-pi-text">{preview.body}</p>
                )}
                {preview.rows?.length > 0 && (
                  <div className="space-y-2.5 rounded-xl border border-pi-border bg-slate-50 p-3">
                    {preview.rows.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-4 border-b border-pi-border/50 pb-2 text-sm last:border-0 last:pb-0"
                      >
                        <span className="text-pi-muted">{label}</span>
                        <span className="text-right font-semibold text-pi-text">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-pi-border bg-slate-50/80 px-5 py-3.5">
                <button
                  type="button"
                  onClick={closePreview}
                  className="rounded-lg border border-pi-border bg-white px-4 py-2 text-sm font-semibold text-pi-text hover:bg-slate-50"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    preview.onConfirm?.()
                    closePreview()
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-pi-orange px-4 py-2 text-sm font-semibold text-white hover:bg-pi-orange-dark"
                >
                  <CheckCircle2 size={15} />
                  {preview.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PreviewContext.Provider>
  )
}

export function usePreview() {
  const ctx = useContext(PreviewContext)
  if (!ctx) throw new Error('usePreview must be used within PreviewProvider')
  return ctx
}
