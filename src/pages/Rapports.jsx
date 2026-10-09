import { motion } from 'framer-motion'
import { Download, BarChart3 } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, Card, Btn, KpiCard } from '../components/ui'
import { caParPays, fraisChartData } from '../data/mockData'
import { downloadRapportPDF } from '../utils/pdf'

const pieColors = ['#0096d6', '#f26522', '#22a06b', '#7c5cbf', '#0ea5e9', '#94a3b8']

const activiteData = [
  { name: 'Enregistrement', value: 32 },
  { name: 'Renouvellement', value: 28 },
  { name: 'Variation', value: 18 },
  { name: 'Dépôt courrier', value: 14 },
  { name: 'Autres', value: 8 },
]

export default function Rapports() {
  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Rapports & Reporting"
          subtitle="Chiffre d'affaires par laboratoire, par pays et par activité — budgets prévisionnels."
          actions={
            <Btn
              variant="primary"
              onClick={() =>
                downloadRapportPDF({
                  caParPays,
                  activiteData,
                  kpis: [
                    { title: 'CA YTD', value: 'XOF 40.4M' },
                    { title: 'Budget prévisionnel Q4', value: 'XOF 12.5M' },
                    { title: 'Taux de recouvrement', value: '87%' },
                  ],
                })
              }
            >
              <Download size={16} />
              Exporter le rapport PDF
            </Btn>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard title="CA YTD" value="XOF 40.4M" icon={BarChart3} sub="↑ +8.2% vs N-1" />
          <KpiCard title="Budget prévisionnel Q4" value="XOF 12.5M" icon={BarChart3} iconBg="bg-pi-orange-light" iconColor="text-pi-orange" />
          <KpiCard title="Taux de recouvrement" value="87%" icon={BarChart3} iconBg="bg-pi-green-light" iconColor="text-pi-green" sub="Objectif 90%" />
        </motion.div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">CA par pays (M XOF)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caParPays} layout="vertical" barSize={16}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis type="category" dataKey="pays" width={100} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="ca" fill="#0096d6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-base font-bold">Répartition par activité</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activiteData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {activiteData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="mt-5 p-5">
          <h2 className="mb-4 text-base font-bold">Évolution CA mensuel (M XOF)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraisChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="montant" fill="#f26522" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
