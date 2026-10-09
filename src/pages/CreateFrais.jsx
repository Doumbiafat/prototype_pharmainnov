import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Landmark, Save } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { Card, Btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useWorkflow, PAYS, TYPES_FRAIS } from '../context/WorkflowContext'

const fieldClass =
  'w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:border-pi-blue focus:ring-2 focus:ring-pi-blue/20'

export default function CreateFrais() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { laboratories, getMedicamentsByLab, createFrais, formatAmount } = useWorkflow()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)
  const [form, setForm] = useState({
    laboratoireId: '',
    medicamentId: '',
    type: TYPES_FRAIS[0],
    pays: PAYS[0],
    montant: '',
    statut: 'en_attente',
    date: '',
    notes: '',
  })

  const set = (key) => (e) => {
    const value = e.target.value
    setForm((f) => {
      if (key === 'laboratoireId') {
        return { ...f, laboratoireId: value, medicamentId: '' }
      }
      return { ...f, [key]: value }
    })
  }

  const meds = useMemo(
    () => (form.laboratoireId ? getMedicamentsByLab(form.laboratoireId) : []),
    [form.laboratoireId, getMedicamentsByLab]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      const res = createFrais(form, user)
      setSubmitting(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setCreated(res.frais)
    }, 400)
  }

  if (created) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-xl p-4 sm:p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-pi-border bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pi-green-light">
              <CheckCircle2 size={32} className="text-pi-green" />
            </div>
            <h1 className="text-2xl font-bold">Frais enregistré</h1>
            <p className="mt-2 text-sm text-pi-muted">
              {created.type} — {created.lab} · {created.montant} XOF
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Btn variant="primary" onClick={() => navigate('/frais-ministeriels')}>
                Voir la liste
              </Btn>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl p-4 sm:p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate('/frais-ministeriels')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Retour aux frais
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pi-orange-light">
            <Landmark size={22} className="text-pi-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nouveau frais ministériel</h1>
            <p className="mt-1 text-sm text-pi-muted">
              Saisie d&apos;un frais d&apos;autorité rattaché à un laboratoire et un médicament.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="space-y-5 p-6">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                Laboratoire *
              </span>
              <select required value={form.laboratoireId} onChange={set('laboratoireId')} className={fieldClass}>
                <option value="">Sélectionner un laboratoire</option>
                {laboratories.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                Médicament
              </span>
              <select
                value={form.medicamentId}
                onChange={set('medicamentId')}
                disabled={!form.laboratoireId}
                className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}
              >
                <option value="">
                  {!form.laboratoireId
                    ? 'Choisir d’abord un laboratoire'
                    : meds.length
                      ? 'Sélectionner un médicament'
                      : 'Aucun médicament pour ce laboratoire'}
                </option>
                {meds.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — {m.dci}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Type *</span>
                <select required value={form.type} onChange={set('type')} className={fieldClass}>
                  {TYPES_FRAIS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Pays *</span>
                <select required value={form.pays} onChange={set('pays')} className={fieldClass}>
                  {PAYS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                  Montant (XOF) *
                </span>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.montant}
                  onChange={set('montant')}
                  className={fieldClass}
                  placeholder="450000"
                />
                {form.montant && (
                  <p className="mt-1 text-xs text-pi-muted">
                    Aperçu : {formatAmount(Number(form.montant) || 0)} XOF
                  </p>
                )}
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Statut</span>
                <select value={form.statut} onChange={set('statut')} className={fieldClass}>
                  <option value="en_attente">En attente</option>
                  <option value="paye">Payé</option>
                  <option value="planifie">Planifié</option>
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                  Date (optionnel)
                </span>
                <input
                  value={form.date}
                  onChange={set('date')}
                  className={fieldClass}
                  placeholder="Ex. 09 Jul 2026 — laissez vide pour aujourd’hui"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Notes</span>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={set('notes')}
                  className={fieldClass}
                  placeholder="Référence autorité, reçu, etc."
                />
              </label>
            </div>

            {error && (
              <p className="rounded-lg bg-pi-red-light px-3 py-2 text-sm font-medium text-pi-red">{error}</p>
            )}

            <div className="flex justify-between gap-3 border-t border-pi-border pt-5">
              <Btn type="button" variant="outline" onClick={() => navigate('/frais-ministeriels')}>
                Annuler
              </Btn>
              <Btn type="submit" variant="primary" disabled={submitting}>
                <Save size={16} />
                {submitting ? 'Enregistrement...' : 'Enregistrer le frais'}
              </Btn>
            </div>
          </Card>
        </form>
      </div>
    </PageTransition>
  )
}
