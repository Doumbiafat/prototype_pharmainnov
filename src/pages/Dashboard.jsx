import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileCheck,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Download,
  Plus,
  MoreVertical,
} from 'lucide-react'
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
import PageTransition, { staggerContainer, fadeUpItem } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, StatusBadge } from '../components/ui'
import { usePreview } from '../components/PreviewModal'
import {
  fraisChartData,
  approvals,
  dossiersPrioritaires,
  statusLabels,
} from '../data/mockData'
import { downloadDashboardPDF } from '../utils/pdf'

const barColors = ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#0ea5e9', '#1e3a5f']

const approvalIcons = {
  success: { Icon: CheckCircle2, bg: 'bg-pi-green-light', color: 'text-pi-green' },
  process: { Icon: RefreshCw, bg: 'bg-pi-blue-light', color: 'text-pi-blue' },
  pending: { Icon: Clock, bg: 'bg-pi-orange-light', color: 'text-pi-orange' },
}

export default function Dashboard() {
  const { openPreview } = usePreview()
  const navigate = useNavigate()

  const exportDashboard = () => {
    downloadDashboardPDF({
      kpis: [
        { title: 'Revenus Q3', value: 'XOF 4.2M', sub: '+12.5% vs Q2' },
        { title: 'Contrats actifs', value: '142', sub: '+3 nouveaux ce mois' },
        { title: 'Dépenses R&D', value: 'XOF 1.8M', sub: 'Dans le budget' },
        { title: 'Alertes qualité', value: '2', sub: 'Nécessite attention' },
      ],
      dossiers: dossiersPrioritaires,
    })
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title={<span className="text-pi-blue">Tableau de Bord Direction</span>}
          subtitle="Aperçu exécutif des performances et de la conformité."
          actions={
            <>
              <Btn variant="outlineGreen" onClick={exportDashboard}>
                <Download size={16} />
                Exporter PDF
              </Btn>
              <Btn
                variant="primary"
                onClick={() =>
                  openPreview({
                    title: 'Nouvelle entrée',
                    subtitle: 'Création rapide depuis le dashboard',
                    body: 'Raccourci vers les actions fréquentes : nouvelle APD, nouveau laboratoire ou saisie de frais ministériels.',
                    rows: [
                      ['Option 1', 'Créer une APD'],
                      ['Option 2', 'Nouveau laboratoire'],
                      ['Option 3', 'Saisir un frais'],
                    ],
                    confirmLabel: 'Aller à Nouvelle APD',
                    onConfirm: () => navigate('/apd/nouvelle'),
                  })
                }
              >
                <Plus size={16} />
                Nouvelle Entrée
              </Btn>
            </>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4"
        >
          <KpiCard
            title="KPI Revenus Q3"
            value="XOF 4.2M"
            sub="↑ +12.5% vs Q2"
            icon={TrendingUp}
          />
          <KpiCard
            title="KPI Contrats Actifs"
            value="142"
            sub="↑ +3 nouveaux ce mois"
            icon={FileCheck}
          />
          <KpiCard
            title="KPI Dépenses R&D"
            value="XOF 1.8M"
            sub="— Dans le budget prévu"
            subColor="text-pi-orange"
            icon={FlaskConical}
          />
          <KpiCard
            title="KPI Alertes Qualité"
            value="2"
            sub="Nécessite une attention"
            subColor="text-pi-red"
            icon={AlertTriangle}
            iconBg="bg-pi-red-light"
            iconColor="text-pi-red"
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 grid gap-4 lg:grid-cols-3"
        >
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-pi-text">Évolution des Frais Ministériels</h2>
              <button
                type="button"
                onClick={() =>
                  openPreview({
                    title: 'Options du graphique',
                    subtitle: 'Évolution des Frais Ministériels',
                    body: 'Personnalisez la période, le type de graphique et les pays inclus dans l’analyse.',
                    rows: [
                      ['Période', '6 derniers mois'],
                      ['Vue', 'Barres empilées'],
                      ['Export', 'PNG / CSV'],
                    ],
                  })
                }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <MoreVertical size={18} />
              </button>
            </div>
            <div className="h-52 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fraisChartData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} unit="M" />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,150,214,0.06)' }}
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}
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

          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold text-pi-text">Dernières Approbations</h2>
            <div className="space-y-4">
              {approvals.map((item) => {
                const { Icon, bg, color } = approvalIcons[item.type]
                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUpItem}
                    className="flex items-start gap-3"
                  >
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${bg}`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-pi-text">
                        {item.id}{' '}
                        <span className={color}>{item.label}</span>
                      </p>
                      <p className="text-xs text-pi-muted">{item.sub}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-400">{item.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="mt-6">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-pi-border px-5 py-4">
              <h2 className="text-base font-bold text-pi-text">Dossiers Prioritaires</h2>
              <button
                type="button"
                onClick={() =>
                  openPreview({
                    title: 'Tous les dossiers prioritaires',
                    subtitle: 'File d’attente réglementaire',
                    body: 'Liste complète des dossiers urgents et en cours, avec étape du workflow et responsable.',
                    rows: dossiersPrioritaires.map((d) => [d.id, `${d.produit} — ${d.etape}`]),
                    confirmLabel: 'Ouvrir APD',
                    onConfirm: () => navigate('/apd'),
                  })
                }
                className="text-sm font-semibold text-pi-blue hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                    <th className="px-5 py-3 font-semibold">Réf.</th>
                    <th className="px-5 py-3 font-semibold">Produit</th>
                    <th className="px-5 py-3 font-semibold">Laboratoire</th>
                    <th className="px-5 py-3 font-semibold">Pays</th>
                    <th className="px-5 py-3 font-semibold">Étape</th>
                    <th className="px-5 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {dossiersPrioritaires.map((d) => (
                    <tr key={d.id} className="border-b border-pi-border/70 hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-semibold text-pi-blue">{d.id}</td>
                      <td className="px-5 py-3.5 font-medium">{d.produit}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{d.lab}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{d.pays}</td>
                      <td className="px-5 py-3.5">{d.etape}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={d.statut} labels={statusLabels} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
