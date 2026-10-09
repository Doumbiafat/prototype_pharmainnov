import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Microscope, CheckCircle2, Pencil, Save, Download } from 'lucide-react'
import PageTransition, { staggerContainer, fadeUpItem } from '../components/PageTransition'
import { PageHeader, Card, Btn } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadLaboratorySheetPDF } from '../utils/pdf'

const fieldClass =
  'w-full rounded-lg border border-pi-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20'

export default function LaboratoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { laboratories, getSolde, formatAmount, updateLaboratory } = useWorkflow()
  const lab = laboratories.find((l) => l.id === id)

  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [form, setForm] = useState(null)

  const current = form || lab
  const solde = lab ? getSolde(lab.id) : 0
  const total = current ? (current.contratsEnCours || 0) + (current.contratsEnAttente || 0) : 0
  const pct = total ? Math.round(((current.contratsEnCours || 0) / total) * 100) : 0

  const startEdit = () => {
    if (!lab) return
    setForm({
      raisonSociale: lab.raisonSociale || '',
      responsable: lab.responsable || '',
      email: lab.email || '',
      telephone: lab.telephone || '',
      adresse: lab.adresse || '',
      specialty: lab.specialty || '',
      status: lab.status || 'draft',
      lastAudit: lab.lastAudit || '',
      notes: lab.notes || '',
    })
    setEditing(true)
    setSavedFlash(false)
  }

  const cancelEdit = () => {
    setEditing(false)
    setForm(null)
  }

  const saveEdit = () => {
    if (!lab || !form) return
    updateLaboratory(lab.id, form, user)
    setEditing(false)
    setForm(null)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  if (!lab) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <p className="text-pi-muted">Laboratoire introuvable.</p>
          <Btn variant="outline" className="mt-4" onClick={() => navigate('/laboratoires')}>
            Retour
          </Btn>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate('/laboratoires')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Retour aux laboratoires
        </button>

        <PageHeader
          title={`Laboratoire ${lab.name}`}
          subtitle="Détails et informations contractuelles"
          actions={
            <>
              <Btn variant="outline" onClick={() => downloadLaboratorySheetPDF(lab, solde)}>
                <Download size={16} />
                PDF
              </Btn>
              {!editing ? (
                <Btn variant="outlineGreen" onClick={startEdit}>
                  <Pencil size={16} />
                  Modifier
                </Btn>
              ) : (
                <Btn variant="outline" onClick={cancelEdit}>
                  Annuler
                </Btn>
              )}
              <Btn variant="primary" onClick={editing ? saveEdit : () => downloadLaboratorySheetPDF(lab, solde)}>
                <Save size={16} />
                {editing ? 'Sauvegarder' : 'Exporter fiche'}
              </Btn>
            </>
          }
        />

        {savedFlash && (
          <div className="mb-4 rounded-xl bg-pi-green-light px-4 py-3 text-sm font-semibold text-pi-green">
            Modifications enregistrées.
          </div>
        )}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-5 lg:grid-cols-3"
        >
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
                  <Microscope size={22} className="text-violet-600" />
                </div>
                <h2 className="text-lg font-bold text-pi-text">Informations Générales</h2>
              </div>
              <span className="rounded-full bg-pi-green-light px-3 py-1 text-xs font-semibold text-pi-green">
                {lab.status === 'approved' ? 'Actif' : lab.status === 'review' ? 'En révision' : 'Brouillon'}
              </span>
            </div>

            {!editing ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  ['Raison Sociale', lab.raisonSociale],
                  ['Identifiant National', lab.identifiant],
                  ['Responsable Légal', lab.responsable],
                  ['Email Contact', lab.email],
                  ['Téléphone', lab.telephone || '—'],
                  ['Pays', lab.pays || '—'],
                ].map(([label, value]) => (
                  <motion.div key={label} variants={fadeUpItem}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">{label}</p>
                    <p className="mt-1.5 text-sm font-semibold text-pi-text">{value}</p>
                  </motion.div>
                ))}
                <motion.div variants={fadeUpItem} className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">Adresse Siège</p>
                  <p className="mt-1.5 text-sm font-semibold text-pi-text">{lab.adresse}</p>
                </motion.div>
                {lab.notes && (
                  <motion.div variants={fadeUpItem} className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">Notes</p>
                    <p className="mt-1.5 text-sm text-pi-text">{lab.notes}</p>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Raison sociale</span>
                  <input className={fieldClass} value={form.raisonSociale} onChange={(e) => setForm((f) => ({ ...f, raisonSociale: e.target.value }))} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Responsable</span>
                  <input className={fieldClass} value={form.responsable} onChange={(e) => setForm((f) => ({ ...f, responsable: e.target.value }))} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Email</span>
                  <input className={fieldClass} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Téléphone</span>
                  <input className={fieldClass} value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Statut</span>
                  <select className={fieldClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Brouillon</option>
                    <option value="review">En révision</option>
                    <option value="approved">Approuvé</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Adresse</span>
                  <textarea className={fieldClass} rows={2} value={form.adresse} onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))} />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase text-pi-muted">Notes</span>
                  <textarea className={fieldClass} rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </label>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pi-green-light">
                <CheckCircle2 size={20} className="text-pi-green" />
              </div>
              <h2 className="text-base font-bold text-pi-text">Status Contrats (AMM)</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-pi-muted">En cours</span>
                <span className="text-lg font-bold text-pi-text">{lab.contratsEnCours}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  className="h-full rounded-full bg-pi-green"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-pi-muted">En attente</span>
                <span className="text-lg font-bold text-pi-text">{lab.contratsEnAttente}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 border-t border-pi-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">Contrat</p>
              <p className="text-sm font-semibold text-pi-blue">{lab.contractId}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">Spécialité</p>
              <p className="text-sm font-semibold">{lab.specialty}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-pi-muted">Dernier audit</p>
              <p className="text-sm font-semibold">{lab.lastAudit}</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-5 grid gap-5 lg:grid-cols-2"
        >
          <Card className="p-6">
            <h3 className="mb-4 text-base font-bold">Compte d&apos;acompte</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase text-pi-muted">Solde disponible</p>
                <p className="mt-2 text-xl font-bold text-pi-green">{formatAmount(solde)}</p>
                <p className="text-[10px] text-pi-muted">XOF</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-pi-muted">
              Traçabilité APD → décaissement → facturation disponible dans le module APD & Facturation.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="mb-4 text-base font-bold">Export</h3>
            <p className="mb-4 text-sm text-pi-muted">
              Téléchargez la fiche complète du laboratoire au format PDF (identité, contrat, contacts, solde).
            </p>
            <Btn variant="primary" onClick={() => downloadLaboratorySheetPDF(lab, solde)}>
              <Download size={16} />
              Télécharger la fiche PDF
            </Btn>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
