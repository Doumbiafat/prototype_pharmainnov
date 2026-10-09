import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Building2, CheckCircle2, Save } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { Card, Btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useWorkflow, PAYS, SPECIALITES } from '../context/WorkflowContext'

const emptyForm = {
  name: '',
  raisonSociale: '',
  initials: '',
  identifiant: '',
  siret: '',
  contractId: '',
  specialty: SPECIALITES[0],
  status: 'draft',
  responsable: '',
  email: '',
  telephone: '',
  pays: PAYS[0],
  adresse: '',
  modalitePaiement: 'acompte',
  soldeInitial: '',
  lastAudit: '',
  notes: '',
  contratsEnCours: '0',
  contratsEnAttente: '0',
}

const fieldClass =
  'w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:border-pi-blue focus:ring-2 focus:ring-pi-blue/20'

export default function CreateLaboratory() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createLaboratory, formatAmount } = useWorkflow()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const previewInitials = useMemo(() => {
    if (form.initials.trim()) return form.initials.trim().toUpperCase().slice(0, 3)
    return form.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || 'LB'
  }, [form.initials, form.name])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      const res = createLaboratory(form, user)
      setSubmitting(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setCreated(res.laboratory)
    }, 450)
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
            <h1 className="text-2xl font-bold text-pi-text">Laboratoire créé</h1>
            <p className="mt-2 text-sm text-pi-muted">
              <strong>{created.name}</strong> a été ajouté au portefeuille partenaires.
            </p>
            <div className="mt-5 rounded-xl border border-pi-border bg-slate-50 p-4 text-left text-sm">
              <div className="flex justify-between gap-3 border-b border-pi-border/60 py-2">
                <span className="text-pi-muted">Contrat</span>
                <span className="font-semibold text-pi-blue">{created.contractId}</span>
              </div>
              <div className="flex justify-between gap-3 border-b border-pi-border/60 py-2">
                <span className="text-pi-muted">Email</span>
                <span className="font-semibold">{created.email}</span>
              </div>
              <div className="flex justify-between gap-3 py-2">
                <span className="text-pi-muted">Statut</span>
                <span className="font-semibold">{created.status}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn variant="outline" onClick={() => navigate('/laboratoires')}>
                Retour à la liste
              </Btn>
              <Btn variant="primary" onClick={() => navigate(`/laboratoires/${created.id}`)}>
                Voir la fiche
              </Btn>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl p-4 sm:p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate('/laboratoires')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Retour aux laboratoires
        </button>

        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pi-orange-light">
            <Building2 size={22} className="text-pi-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-pi-text">Nouveau laboratoire</h1>
            <p className="mt-1 text-sm text-pi-muted">
              Créez la fiche partenaire : identité, contrat, contacts et compte d&apos;acompte.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="space-y-6 p-6">
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-pi-blue">Identité</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Nom commercial *
                  </span>
                  <input required value={form.name} onChange={set('name')} className={fieldClass} placeholder="Ex. BioNova Afrique" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Raison sociale *
                  </span>
                  <input
                    required
                    value={form.raisonSociale}
                    onChange={set('raisonSociale')}
                    className={fieldClass}
                    placeholder="Ex. BioNova Afrique SA"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Initiales</span>
                  <div className="flex items-center gap-3">
                    <input
                      value={form.initials}
                      onChange={set('initials')}
                      maxLength={3}
                      className={fieldClass}
                      placeholder="Auto"
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pi-blue text-xs font-bold text-white">
                      {previewInitials}
                    </div>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Identifiant national
                  </span>
                  <input value={form.identifiant} onChange={set('identifiant')} className={fieldClass} placeholder="CI-XXXXXX-XX" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">SIRET / RCCM</span>
                  <input value={form.siret} onChange={set('siret')} className={fieldClass} placeholder="832 491 203" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Spécialité</span>
                  <select value={form.specialty} onChange={set('specialty')} className={fieldClass}>
                    {SPECIALITES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="border-t border-pi-border pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-pi-blue">Contrat & statut</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    N° Contrat (auto si vide)
                  </span>
                  <input value={form.contractId} onChange={set('contractId')} className={fieldClass} placeholder="CTR-2026-XXXX" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Statut conformité</span>
                  <select value={form.status} onChange={set('status')} className={fieldClass}>
                    <option value="draft">Brouillon</option>
                    <option value="review">En révision</option>
                    <option value="approved">Approuvé</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Dernier audit</span>
                  <input value={form.lastAudit} onChange={set('lastAudit')} className={fieldClass} placeholder="Non audité" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Modalité de paiement</span>
                  <select value={form.modalitePaiement} onChange={set('modalitePaiement')} className={fieldClass}>
                    <option value="acompte">Compte d&apos;acompte</option>
                    <option value="prefinancement">Préfinancement Pharma Innov</option>
                    <option value="mixte">Mixte</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Solde acompte initial (XOF)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={form.soldeInitial}
                    onChange={set('soldeInitial')}
                    className={fieldClass}
                    placeholder="0"
                  />
                  {form.soldeInitial && (
                    <p className="mt-1 text-xs text-pi-muted">
                      Aperçu : {formatAmount(Number(form.soldeInitial) || 0)} XOF
                    </p>
                  )}
                </label>
              </div>
            </section>

            <section className="border-t border-pi-border pt-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-pi-blue">Contacts</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Responsable légal *
                  </span>
                  <input required value={form.responsable} onChange={set('responsable')} className={fieldClass} placeholder="Dr. Nom Prénom" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Email *</span>
                  <input required type="email" value={form.email} onChange={set('email')} className={fieldClass} placeholder="contact@labo.ci" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Téléphone</span>
                  <input value={form.telephone} onChange={set('telephone')} className={fieldClass} placeholder="+225 07 00 00 00 00" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Pays</span>
                  <select value={form.pays} onChange={set('pays')} className={fieldClass}>
                    {PAYS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                    Adresse siège *
                  </span>
                  <textarea
                    required
                    rows={2}
                    value={form.adresse}
                    onChange={set('adresse')}
                    className={fieldClass}
                    placeholder="Adresse complète"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Notes</span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={set('notes')}
                    className={fieldClass}
                    placeholder="Tarifs négociés, conditions particulières..."
                  />
                </label>
              </div>
            </section>

            {error && (
              <p className="rounded-lg bg-pi-red-light px-3 py-2 text-sm font-medium text-pi-red">{error}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-pi-border pt-5">
              <Btn type="button" variant="outline" onClick={() => navigate('/laboratoires')}>
                Annuler
              </Btn>
              <Btn type="submit" variant="primary" disabled={submitting}>
                <Save size={16} />
                {submitting ? 'Enregistrement...' : 'Créer le laboratoire'}
              </Btn>
            </div>
          </Card>
        </form>
      </div>
    </PageTransition>
  )
}
