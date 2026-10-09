import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Wallet,
  Banknote,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Download,
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { Card, Btn, Avatar } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useWorkflow, ACTIVITES, PAYS } from '../context/WorkflowContext'
import { downloadInvoicePDF, downloadAPDPDF } from '../utils/pdf'

const STEPS = [
  { id: 1, label: 'Laboratoire' },
  { id: 2, label: 'Activité' },
  { id: 3, label: 'Financement' },
  { id: 4, label: 'Confirmation' },
]

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
}

export default function CreateAPD() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { laboratories, getSolde, formatAmount, createAPD, getMedicamentsByLab } = useWorkflow()

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const [form, setForm] = useState({
    laboratoireId: '',
    activite: ACTIVITES[1],
    medicamentId: '',
    pays: PAYS[0],
    montant: '',
    description: '',
    financement: '',
  })

  const selectedLab = useMemo(
    () => laboratories.find((l) => l.id === form.laboratoireId),
    [laboratories, form.laboratoireId]
  )
  const labMedicaments = useMemo(
    () => (form.laboratoireId ? getMedicamentsByLab(form.laboratoireId) : []),
    [form.laboratoireId, getMedicamentsByLab]
  )
  const selectedMed = useMemo(
    () => labMedicaments.find((m) => m.id === form.medicamentId),
    [labMedicaments, form.medicamentId]
  )
  const solde = selectedLab ? getSolde(selectedLab.id) : 0
  const montantNum = Number(String(form.montant).replace(/\s/g, '')) || 0
  const soldeOk = solde >= montantNum && montantNum > 0

  const go = (next) => {
    setError('')
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const canNext = () => {
    if (step === 1) return !!form.laboratoireId
    if (step === 2) {
      return !!form.activite && !!form.medicamentId && montantNum > 0 && !!form.pays
    }
    if (step === 3) {
      if (!form.financement) return false
      if (form.financement === 'acompte' && !soldeOk) return false
      return true
    }
    return true
  }

  const handleSubmit = () => {
    setError('')
    setSubmitting(true)
    setTimeout(() => {
      const res = createAPD(form, user)
      setSubmitting(false)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setResult(res)
      setDir(1)
      setStep(5)
    }, 700)
  }

  if (result && step === 5) {
    return (
      <PageTransition>
        <div className="mx-auto max-w-2xl p-4 sm:p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-pi-border bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pi-green-light">
              <CheckCircle2 size={32} className="text-pi-green" />
            </div>
            <h1 className="text-2xl font-bold text-pi-text">APD créée & facturée</h1>
            <p className="mt-2 text-sm text-pi-muted">
              Numérotation automatique appliquée. Les documents sont prêts au téléchargement.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-pi-border bg-slate-50 p-4 text-left">
                <p className="text-xs font-semibold uppercase text-pi-muted">APD</p>
                <p className="mt-1 text-lg font-bold text-pi-blue">{result.apd.id}</p>
                <p className="text-xs text-pi-muted">{result.apd.financement}</p>
              </div>
              <div className="rounded-xl border border-pi-border bg-slate-50 p-4 text-left">
                <p className="text-xs font-semibold uppercase text-pi-muted">Facture</p>
                <p className="mt-1 text-lg font-bold text-pi-orange">{result.invoice.id}</p>
                <p className="text-xs text-pi-muted">{formatAmount(result.invoice.total)} XOF</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Btn variant="outline" onClick={() => downloadAPDPDF(result.apd, result.invoice)}>
                <Download size={16} />
                PDF APD
              </Btn>
              <Btn variant="primary" onClick={() => downloadInvoicePDF(result.invoice)}>
                <Download size={16} />
                PDF Facture
              </Btn>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn variant="outline" onClick={() => navigate(`/factures/${result.invoice.id}`)}>
                Voir la facture
              </Btn>
              <Btn variant="outlineGreen" onClick={() => navigate('/apd')}>
                Retour à la liste
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
          onClick={() => navigate('/apd')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Annuler
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pi-text">Nouvelle Autorisation Préalable de Dépense</h1>
          <p className="mt-1 text-sm text-pi-muted">
            Pharmacien : <strong>{user?.name}</strong> — la facture sera générée automatiquement à la validation.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  step >= s.id ? 'bg-pi-orange text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`hidden text-xs font-semibold sm:block ${step >= s.id ? 'text-pi-text' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${step > s.id ? 'bg-pi-orange' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="overflow-hidden p-6">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 1 && (
                <div>
                  <h2 className="mb-1 text-lg font-bold">Choisir le laboratoire</h2>
                  <p className="mb-5 text-sm text-pi-muted">Sélectionnez le client pour lequel l&apos;activité est demandée.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {laboratories.map((lab) => {
                      const s = getSolde(lab.id)
                      const active = form.laboratoireId === lab.id
                      return (
                        <button
                          key={lab.id}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              laboratoireId: lab.id,
                              medicamentId: '',
                            }))
                          }
                          className={`rounded-xl border-2 p-4 text-left transition ${
                            active
                              ? 'border-pi-orange bg-pi-orange-light/40 shadow-sm'
                              : 'border-pi-border hover:border-pi-blue/40 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar initials={lab.initials} color={lab.color} />
                            <div className="min-w-0">
                              <p className="font-semibold text-pi-text">{lab.name}</p>
                              <p className="truncate text-xs text-pi-muted">{lab.specialty}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-xs text-pi-muted">
                            Solde acompte :{' '}
                            <strong className={s < 500000 ? 'text-pi-red' : 'text-pi-green'}>
                              {formatAmount(s)} XOF
                            </strong>
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="mb-1 text-lg font-bold">Détails de l&apos;activité</h2>
                  <p className="mb-5 text-sm text-pi-muted">
                    Laboratoire : <strong>{selectedLab?.name}</strong>
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Type d&apos;activité</span>
                      <select
                        value={form.activite}
                        onChange={(e) => setForm((f) => ({ ...f, activite: e.target.value }))}
                        className="w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
                      >
                        {ACTIVITES.map((a) => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">
                        Médicament *
                      </span>
                      <select
                        value={form.medicamentId}
                        onChange={(e) => setForm((f) => ({ ...f, medicamentId: e.target.value }))}
                        className="w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
                      >
                        <option value="">
                          {labMedicaments.length
                            ? 'Sélectionner un médicament'
                            : 'Aucun médicament pour ce laboratoire'}
                        </option>
                        {labMedicaments.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} — {m.dci} ({m.forme})
                          </option>
                        ))}
                      </select>
                      {!labMedicaments.length && (
                        <p className="mt-2 text-xs text-pi-orange">
                          Ajoutez d’abord un médicament pour ce laboratoire via l’onglet Médicaments.
                          <button
                            type="button"
                            onClick={() => navigate('/medicaments/nouveau')}
                            className="ml-1 font-semibold underline"
                          >
                            Créer un médicament
                          </button>
                        </p>
                      )}
                      {selectedMed && (
                        <p className="mt-2 text-xs text-pi-muted">
                          Classe : {selectedMed.classe} · AMM : {selectedMed.statutAmm} · Exp. {selectedMed.dateExpirationAmm}
                        </p>
                      )}
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Pays</span>
                      <select
                        value={form.pays}
                        onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
                        className="w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
                      >
                        {PAYS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Montant (XOF)</span>
                      <input
                        type="number"
                        min="1"
                        value={form.montant}
                        onChange={(e) => setForm((f) => ({ ...f, montant: e.target.value }))}
                        placeholder="1250000"
                        className="w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
                      />
                    </label>
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-semibold uppercase text-pi-muted">Description (optionnel)</span>
                      <textarea
                        rows={3}
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        placeholder="Précisions sur le dossier..."
                        className="w-full rounded-xl border border-pi-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="mb-1 text-lg font-bold">Mode de financement</h2>
                  <p className="mb-5 text-sm text-pi-muted">
                    Montant : <strong>{formatAmount(montantNum)} XOF</strong> — Solde acompte{' '}
                    <strong className={soldeOk ? 'text-pi-green' : 'text-pi-red'}>
                      {formatAmount(solde)} XOF
                    </strong>
                  </p>

                  <div className="grid gap-4">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, financement: 'acompte' }))}
                      disabled={!soldeOk}
                      className={`rounded-xl border-2 p-5 text-left transition ${
                        form.financement === 'acompte'
                          ? 'border-pi-blue bg-pi-blue-light/50'
                          : soldeOk
                            ? 'border-pi-border hover:border-pi-blue/40'
                            : 'cursor-not-allowed border-pi-border opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pi-blue-light">
                          <Wallet size={22} className="text-pi-blue" />
                        </div>
                        <div>
                          <p className="font-bold text-pi-text">Compte d&apos;acompte (fond de caisse)</p>
                          <p className="mt-1 text-sm text-pi-muted">
                            Le laboratoire a déjà déposé des fonds. Le montant sera prélevé sur son solde.
                          </p>
                          {!soldeOk && (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-pi-red">
                              <AlertTriangle size={13} />
                              Solde insuffisant pour cette APD
                            </p>
                          )}
                          {soldeOk && form.financement === 'acompte' && (
                            <p className="mt-2 text-xs font-semibold text-pi-green">
                              Solde après prélèvement : {formatAmount(solde - montantNum)} XOF
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, financement: 'prefinancement' }))}
                      className={`rounded-xl border-2 p-5 text-left transition ${
                        form.financement === 'prefinancement'
                          ? 'border-pi-orange bg-pi-orange-light/50'
                          : 'border-pi-border hover:border-pi-orange/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pi-orange-light">
                          <Banknote size={22} className="text-pi-orange" />
                        </div>
                        <div>
                          <p className="font-bold text-pi-text">Préfinancement Pharma Innov</p>
                          <p className="mt-1 text-sm text-pi-muted">
                            Le cabinet avance les fonds (courses / décaissement), puis facture et recouvre auprès du laboratoire.
                          </p>
                          {form.financement === 'prefinancement' && (
                            <p className="mt-2 text-xs font-semibold text-pi-orange">
                              Une créance sera ouverte automatiquement
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="mb-1 text-lg font-bold">Confirmation</h2>
                  <p className="mb-5 text-sm text-pi-muted">
                    Vérifiez les informations. La facture sera générée avec une numérotation automatique.
                  </p>

                  <div className="space-y-3 rounded-xl border border-pi-border bg-slate-50 p-4 text-sm">
                    {[
                      ['Laboratoire', selectedLab?.name],
                      ['Activité', form.activite],
                      ['Médicament', selectedMed?.name || '—'],
                      ['DCI', selectedMed?.dci || '—'],
                      ['Pays', form.pays],
                      ['Montant', `${formatAmount(montantNum)} XOF`],
                      [
                        'Financement',
                        form.financement === 'acompte'
                          ? 'Prélèvement sur acompte'
                          : 'Préfinancement Pharma Innov',
                      ],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-4 border-b border-pi-border/60 pb-2 last:border-0 last:pb-0">
                        <span className="text-pi-muted">{k}</span>
                        <span className="text-right font-semibold text-pi-text">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-pi-blue-light/60 px-4 py-3 text-sm text-pi-blue">
                    <FileText size={18} className="mt-0.5 shrink-0" />
                    <p>
                      À la validation, une APD numérotée et une facture liée seront créées. Vous pourrez télécharger les PDF immédiatement.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <p className="mt-4 rounded-lg bg-pi-red-light px-3 py-2 text-sm font-medium text-pi-red">{error}</p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-pi-border pt-5">
            <Btn
              variant="outline"
              disabled={step === 1}
              onClick={() => go(step - 1)}
            >
              <ArrowLeft size={16} />
              Précédent
            </Btn>

            {step < 4 ? (
              <Btn variant="primary" disabled={!canNext()} onClick={() => go(step + 1)}>
                Suivant
                <ArrowRight size={16} />
              </Btn>
            ) : (
              <Btn variant="primary" disabled={submitting} onClick={handleSubmit}>
                {submitting ? 'Génération...' : 'Valider & facturer'}
                <Building2 size={16} />
              </Btn>
            )}
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
