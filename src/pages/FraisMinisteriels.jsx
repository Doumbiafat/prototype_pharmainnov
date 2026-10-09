import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Landmark, Download, Plus } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, StatusBadge } from '../components/ui'
import { fraisChartData, statusLabels } from '../data/mockData'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadFraisPDF } from '../utils/pdf'

const barColors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#0ea5e9', '#1e3a5f']

export default function FraisMinisteriels() {
  const navigate = useNavigate()
  const { fraisList, formatAmount } = useWorkflow()

  const totals = useMemo(() => {
    const paye = fraisList
      .filter((f) => f.statut === 'paye')
      .reduce((s, f) => s + (f.montantNum || 0), 0)
    const enAttente = fraisList
      .filter((f) => f.statut === 'en_attente')
      .reduce((s, f) => s + (f.montantNum || 0), 0)
    const planifie = fraisList
      .filter((f) => f.statut === 'planifie')
      .reduce((s, f) => s + (f.montantNum || 0), 0)
    return { paye, enAttente, planifie }
  }, [fraisList])

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Frais Ministériels"
          subtitle="Suivi des frais d'enregistrement, renouvellement et variation auprès des autorités."
          actions={
            <>
              <Btn variant="outlineGreen" onClick={() => downloadFraisPDF(fraisList)}>
                <Download size={16} />
                Exporter PDF
              </Btn>
              <Btn variant="primary" onClick={() => navigate('/frais-ministeriels/nouveau')}>
                <Plus size={16} />
                Nouveau frais
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
          <KpiCard title="Frais payés" value={`XOF ${formatAmount(totals.paye)}`} icon={Landmark} />
          <KpiCard
            title="En attente"
            value={`XOF ${formatAmount(totals.enAttente)}`}
            subColor="text-pi-orange"
            sub={`${fraisList.filter((f) => f.statut === 'en_attente').length} dossier(s)`}
            icon={Landmark}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
          <KpiCard
            title="Planifiés"
            value={`XOF ${formatAmount(totals.planifie)}`}
            icon={Landmark}
            iconBg="bg-pi-blue-light"
            iconColor="text-pi-blue"
          />
        </motion.div>

        <div className="mt-6 grid gap-5 lg:grid-cols-5">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 text-base font-bold">Évolution mensuelle</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fraisChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} unit="M" />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v) => [`${v}M XOF`, 'Montant']}
                  />
                  <Bar dataKey="montant" radius={[6, 6, 0, 0]}>
                    {fraisChartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden lg:col-span-3">
            <div className="border-b border-pi-border px-5 py-4">
              <h2 className="text-base font-bold">Détail des frais</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                    <th className="px-5 py-3 font-semibold">Pays</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Laboratoire</th>
                    <th className="px-5 py-3 font-semibold">Médicament</th>
                    <th className="px-5 py-3 font-semibold">Montant</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {fraisList.map((f) => (
                    <tr key={f.id} className="border-b border-pi-border/70 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-medium">{f.pays}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{f.type}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{f.lab}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{f.medicament || '—'}</td>
                      <td className="px-5 py-3.5 font-semibold">{f.montant} XOF</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={f.statut} labels={statusLabels} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
