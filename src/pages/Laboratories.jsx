import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FlaskConical,
  ClipboardList,
  ShieldCheck,
  Download,
  Building2,
  Search,
  ChevronDown,
  Eye,
  MoreHorizontal,
  FileDown,
} from 'lucide-react'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, Avatar, StatusBadge } from '../components/ui'
import { usePreview } from '../components/PreviewModal'
import { useWorkflow } from '../context/WorkflowContext'
import { statusLabels } from '../data/mockData'
import { downloadLaboratoriesPDF, downloadLaboratorySheetPDF } from '../utils/pdf'

export default function Laboratories() {
  const navigate = useNavigate()
  const { openPreview } = usePreview()
  const { laboratories, getSolde } = useWorkflow()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')

  const specialties = useMemo(
    () => [...new Set(laboratories.map((l) => l.specialty))].sort(),
    [laboratories]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return laboratories.filter((lab) => {
      if (statusFilter !== 'all' && lab.status !== statusFilter) return false
      if (specialtyFilter !== 'all' && lab.specialty !== specialtyFilter) return false
      if (!q) return true
      return (
        lab.name.toLowerCase().includes(q) ||
        lab.siret.toLowerCase().includes(q) ||
        lab.contractId.toLowerCase().includes(q) ||
        (lab.raisonSociale || '').toLowerCase().includes(q) ||
        statusLabels[lab.status]?.label.toLowerCase().includes(q)
      )
    })
  }, [laboratories, query, statusFilter, specialtyFilter])

  const actifs = laboratories.filter((l) => l.status === 'approved').length
  const enAttente = laboratories.filter((l) => l.status === 'review').length

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Laboratoires & Partenaires"
          subtitle="Gérez vos contrats, audits et relations avec les laboratoires partenaires."
          actions={
            <>
              <Btn
                variant="green"
                onClick={() => downloadLaboratoriesPDF(filtered.length ? filtered : laboratories)}
              >
                <Download size={16} />
                Exporter PDF
              </Btn>
              <Btn variant="primary" onClick={() => navigate('/laboratoires/nouveau')}>
                <Building2 size={16} />
                Nouveau Laboratoire
              </Btn>
            </>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard
            title="Laboratoires Actifs"
            value={String(actifs || laboratories.length)}
            icon={FlaskConical}
            iconBg="bg-pi-blue-light"
            iconColor="text-pi-blue"
          />
          <KpiCard
            title="Contrats en Attente"
            value={String(enAttente)}
            icon={ClipboardList}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
          <KpiCard
            title="Total portefeuille"
            value={String(laboratories.length)}
            icon={ShieldCheck}
            iconBg="bg-pi-green-light"
            iconColor="text-pi-green"
          />
        </motion.div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-pi-border px-5 py-4">
            <div className="relative min-w-[240px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer par nom, SIRET, ou statut..."
                className="w-full rounded-lg border border-pi-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-lg border border-pi-border bg-white py-2 pl-3 pr-8 text-sm text-pi-muted outline-none hover:bg-slate-50"
              >
                <option value="all">Tous les statuts</option>
                <option value="approved">Approuvé</option>
                <option value="review">En révision</option>
                <option value="draft">Brouillon</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="appearance-none rounded-lg border border-pi-border bg-white py-2 pl-3 pr-8 text-sm text-pi-muted outline-none hover:bg-slate-50"
              >
                <option value="all">Toutes spécialités</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">Nom du Laboratoire</th>
                  <th className="px-5 py-3 font-semibold">ID Contrat</th>
                  <th className="px-5 py-3 font-semibold">Spécialité</th>
                  <th className="px-5 py-3 font-semibold">Statut Conformité</th>
                  <th className="px-5 py-3 font-semibold">Dernier Audit</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-pi-muted">
                      Aucun laboratoire ne correspond aux filtres.
                    </td>
                  </tr>
                )}
                {filtered.map((lab) => (
                  <motion.tr
                    key={lab.id}
                    whileHover={{ backgroundColor: 'rgba(248,250,252,0.9)' }}
                    className="cursor-pointer border-b border-pi-border/70"
                    onClick={() => navigate(`/laboratoires/${lab.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={lab.initials} color={lab.color} />
                        <div>
                          <p className="font-semibold text-pi-text">{lab.name}</p>
                          <p className="text-xs text-pi-muted">{lab.siret}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-pi-muted">{lab.contractId}</td>
                    <td className="px-5 py-3.5 text-pi-muted">{lab.specialty}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lab.status} labels={statusLabels} />
                    </td>
                    <td className="px-5 py-3.5 text-pi-muted">{lab.lastAudit}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="Voir"
                          onClick={() => navigate(`/laboratoires/${lab.id}`)}
                          className="rounded-lg p-1.5 text-pi-blue hover:bg-pi-blue-light"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Export PDF fiche"
                          onClick={() => downloadLaboratorySheetPDF(lab, getSolde(lab.id))}
                          className="rounded-lg p-1.5 text-pi-green hover:bg-pi-green-light"
                        >
                          <FileDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openPreview({
                              title: lab.name,
                              subtitle: 'Actions rapides',
                              body: 'Menu contextuel du laboratoire partenaire.',
                              rows: [
                                ['Contrat', lab.contractId],
                                ['Spécialité', lab.specialty],
                                ['Dernier audit', lab.lastAudit],
                              ],
                              confirmLabel: 'Voir la fiche',
                              onConfirm: () => navigate(`/laboratoires/${lab.id}`),
                            })
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
