import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Pill, Save } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { Card, Btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import {
  useWorkflow,
  FORMES,
  CLASSES_THERAPEUTIQUES,
} from '../context/WorkflowContext'

const fieldClass =
  'w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:border-pi-blue focus:ring-2 focus:ring-pi-blue/20'

export default function CreateMedicament() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { laboratories, createMedicament } = useWorkflow()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)
  const [form, setForm] = useState({
    name: '',
    dci: '',
    forme: FORMES[0],
    dosage: '',
    laboratoireId: '',
    classe: CLASSES_THERAPEUTIQUES[0],
    statutAmm: 'brouillon',
    dateExpirationAmm: '',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      const res = createMedicament(form, user)
      setSubmitting(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setCreated(res.medicament)
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
            <h1 className="text-2xl font-bold">Médicament enregistré</h1>
            <p className="mt-2 text-sm text-pi-muted">
              <strong>{created.name}</strong> est associé à <strong>{created.laboratoire}</strong>.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn variant="outline" onClick={() => navigate('/medicaments')}>
                Voir la liste
              </Btn>
              <Btn variant="primary" onClick={() => navigate('/apd/nouvelle')}>
                Créer une APD
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
          onClick={() => navigate('/medicaments')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Retour aux médicaments
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pi-blue-light">
            <Pill size={22} className="text-pi-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nouveau médicament</h1>
            <p className="mt-1 text-sm text-pi-muted">
              Chaque médicament doit être rattaché à un laboratoire partenaire.
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
                Nom commercial *
              </span>
              <input required value={form.name} onChange={set('name')} className={fieldClass} placeholder="Ex. Amoxicilline 500mg" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">DCI *</span>
                <input required value={form.dci} onChange={set('dci')} className={fieldClass} placeholder="Ex. Amoxicilline" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Dosage</span>
                <input value={form.dosage} onChange={set('dosage')} className={fieldClass} placeholder="Ex. 500mg" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Forme</span>
                <select value={form.forme} onChange={set('forme')} className={fieldClass}>
                  {FORMES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Classe thérapeutique</span>
                <select value={form.classe} onChange={set('classe')} className={fieldClass}>
                  {CLASSES_THERAPEUTIQUES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Statut AMM</span>
                <select value={form.statutAmm} onChange={set('statutAmm')} className={fieldClass}>
                  <option value="brouillon">Brouillon</option>
                  <option value="valide">AMM valide</option>
                  <option value="en_renouvellement">En renouvellement</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                  Expiration AMM
                </span>
                <input
                  value={form.dateExpirationAmm}
                  onChange={set('dateExpirationAmm')}
                  className={fieldClass}
                  placeholder="Ex. 15 Mar 2027"
                />
              </label>
            </div>

            {error && (
              <p className="rounded-lg bg-pi-red-light px-3 py-2 text-sm font-medium text-pi-red">{error}</p>
            )}

            <div className="flex justify-between gap-3 border-t border-pi-border pt-5">
              <Btn type="button" variant="outline" onClick={() => navigate('/medicaments')}>
                Annuler
              </Btn>
              <Btn type="submit" variant="primary" disabled={submitting}>
                <Save size={16} />
                {submitting ? 'Enregistrement...' : 'Enregistrer'}
              </Btn>
            </div>
          </Card>
        </form>
      </div>
    </PageTransition>
  )
}
