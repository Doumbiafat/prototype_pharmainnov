import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pill, Plus, Search, ChevronDown } from 'lucide-react'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, StatusBadge } from '../components/ui'
import { useWorkflow } from '../context/WorkflowContext'
import { statusLabels } from '../data/mockData'

export default function Medicaments() {
  const navigate = useNavigate()
  const { medicaments, laboratories } = useWorkflow()
  const [query, setQuery] = useState('')
  const [labFilter, setLabFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return medicaments.filter((m) => {
      if (labFilter !== 'all' && m.laboratoireId !== labFilter) return false
      if (statusFilter !== 'all' && m.statutAmm !== statusFilter) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.dci.toLowerCase().includes(q) ||
        m.laboratoire.toLowerCase().includes(q) ||
        m.classe.toLowerCase().includes(q)
      )
    })
  }, [medicaments, query, labFilter, statusFilter])

  const valides = medicaments.filter((m) => m.statutAmm === 'valide').length
  const aRenouveler = medicaments.filter((m) => m.statutAmm === 'en_renouvellement').length

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Médicaments"
          subtitle="Nomenclature des produits associés aux laboratoires partenaires."
          actions={
            <Btn variant="primary" onClick={() => navigate('/medicaments/nouveau')}>
              <Plus size={16} />
              Nouveau médicament
            </Btn>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard title="Médicaments" value={String(medicaments.length)} icon={Pill} />
          <KpiCard
            title="AMM valides"
            value={String(valides)}
            icon={Pill}
            iconBg="bg-pi-green-light"
            iconColor="text-pi-green"
          />
          <KpiCard
            title="À renouveler"
            value={String(aRenouveler)}
            icon={Pill}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
        </motion.div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-pi-border px-5 py-4">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filtrer par nom, DCI, laboratoire..."
                className="w-full rounded-lg border border-pi-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
              />
            </div>
            <div className="relative">
              <select
                value={labFilter}
                onChange={(e) => setLabFilter(e.target.value)}
                className="appearance-none rounded-lg border border-pi-border bg-white py-2 pl-3 pr-8 text-sm text-pi-muted outline-none"
              >
                <option value="all">Tous les laboratoires</option>
                {laboratories.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-lg border border-pi-border bg-white py-2 pl-3 pr-8 text-sm text-pi-muted outline-none"
              >
                <option value="all">Tous les statuts AMM</option>
                <option value="valide">AMM valide</option>
                <option value="en_renouvellement">En renouvellement</option>
                <option value="brouillon">Brouillon</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">Médicament</th>
                  <th className="px-5 py-3 font-semibold">DCI</th>
                  <th className="px-5 py-3 font-semibold">Forme / Dosage</th>
                  <th className="px-5 py-3 font-semibold">Laboratoire</th>
                  <th className="px-5 py-3 font-semibold">Classe</th>
                  <th className="px-5 py-3 font-semibold">Statut AMM</th>
                  <th className="px-5 py-3 font-semibold">Expiration</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-pi-muted">
                      Aucun médicament trouvé.
                    </td>
                  </tr>
                )}
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-pi-border/70 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-semibold text-pi-text">{m.name}</td>
                    <td className="px-5 py-3.5 text-pi-muted">{m.dci}</td>
                    <td className="px-5 py-3.5 text-pi-muted">{m.forme} · {m.dosage}</td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/laboratoires/${m.laboratoireId}`)}
                        className="font-medium text-pi-blue hover:underline"
                      >
                        {m.laboratoire}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-pi-muted">{m.classe}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={m.statutAmm} labels={statusLabels} />
                    </td>
                    <td className="px-5 py-3.5 text-pi-muted">{m.dateExpirationAmm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
