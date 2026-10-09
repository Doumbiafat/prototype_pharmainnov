import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
  Link2,
  Receipt,
  Plus,
  Search,
  ArrowRight,
  Download,
  Eye,
} from 'lucide-react'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, StatusBadge } from '../components/ui'
import { statusLabels } from '../data/mockData'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadInvoicePDF, downloadAPDPDF } from '../utils/pdf'

const workflow = [
  { step: '1', title: 'Demande APD', desc: 'Pharmacien crée la demande' },
  { step: '2', title: 'Financement', desc: 'Acompte ou préfinancement' },
  { step: '3', title: 'Réalisation', desc: 'Preuve de dépôt validée' },
  { step: '4', title: 'Facturation', desc: 'Facture auto-générée' },
]

export default function APD() {
  const navigate = useNavigate()
  const { apdList, invoices, formatAmount } = useWorkflow()

  const facturees = apdList.filter((a) => a.factureId).length
  const totalFacture = invoices.reduce((s, i) => s + (i.total || 0), 0)

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="APD & Facturation"
          subtitle="Traçabilité complète : demande → financement → réalisation → facture."
          actions={
            <Btn variant="primary" onClick={() => navigate('/apd/nouvelle')}>
              <Plus size={16} />
              Nouvelle APD
            </Btn>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mb-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        >
          {workflow.map((w, i) => (
            <div key={w.step} className="relative flex items-center gap-3 rounded-xl border border-pi-border bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pi-blue text-sm font-bold text-white">
                {w.step}
              </div>
              <div>
                <p className="text-sm font-bold text-pi-text">{w.title}</p>
                <p className="text-xs text-pi-muted">{w.desc}</p>
              </div>
              {i < workflow.length - 1 && (
                <ArrowRight size={14} className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-pi-orange lg:block" />
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard title="APD enregistrées" value={String(apdList.length)} icon={FileText} />
          <KpiCard
            title="Liées à une facture"
            value={String(facturees)}
            sub={`${apdList.length ? Math.round((facturees / apdList.length) * 100) : 0}% de traçabilité`}
            icon={Link2}
            iconBg="bg-pi-green-light"
            iconColor="text-pi-green"
          />
          <KpiCard
            title="Factures émises"
            value={`XOF ${formatAmount(totalFacture)}`}
            icon={Receipt}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
        </motion.div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-pi-border px-5 py-4">
            <div className="relative min-w-[240px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Filtrer par N° APD, laboratoire, produit..."
                className="w-full rounded-lg border border-pi-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-pi-blue/20"
              />
            </div>
            <Btn variant="primary" onClick={() => navigate('/apd/nouvelle')}>
              <Plus size={15} />
              Créer une APD
            </Btn>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">N° APD</th>
                  <th className="px-5 py-3 font-semibold">Laboratoire</th>
                  <th className="px-5 py-3 font-semibold">Activité</th>
                  <th className="px-5 py-3 font-semibold">Produit</th>
                  <th className="px-5 py-3 font-semibold">Pays</th>
                  <th className="px-5 py-3 font-semibold">Montant</th>
                  <th className="px-5 py-3 font-semibold">Financement</th>
                  <th className="px-5 py-3 font-semibold">Facture</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apdList.map((a) => {
                  const inv = invoices.find((i) => i.id === a.factureId)
                  return (
                    <motion.tr
                      key={a.id}
                      whileHover={{ backgroundColor: 'rgba(248,250,252,0.9)' }}
                      className="border-b border-pi-border/70"
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/apd/${a.id}`)}
                          className="font-bold text-pi-blue hover:underline"
                        >
                          {a.id}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{a.laboratoire}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{a.activite}</td>
                      <td className="px-5 py-3.5">{a.produit}</td>
                      <td className="px-5 py-3.5 text-pi-muted">{a.pays}</td>
                      <td className="px-5 py-3.5 font-semibold">
                        {a.montant} <span className="text-xs font-normal text-pi-muted">XOF</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            a.financement === 'Acompte'
                              ? 'bg-pi-blue-light text-pi-blue'
                              : 'bg-pi-orange-light text-pi-orange'
                          }`}
                        >
                          {a.financement}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {a.factureId ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/factures/${a.factureId}`)}
                            className="font-semibold text-pi-orange hover:underline"
                          >
                            {a.factureId}
                          </button>
                        ) : (
                          <span className="text-pi-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={a.statut} labels={statusLabels} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Voir"
                            onClick={() => navigate(`/apd/${a.id}`)}
                            className="rounded-lg p-1.5 text-pi-blue hover:bg-pi-blue-light"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            title="PDF APD"
                            onClick={() => downloadAPDPDF(a, inv)}
                            className="rounded-lg p-1.5 text-pi-muted hover:bg-slate-100"
                          >
                            <Download size={15} />
                          </button>
                          {inv && (
                            <button
                              type="button"
                              title="PDF Facture"
                              onClick={() => downloadInvoicePDF(inv)}
                              className="rounded-lg p-1.5 text-pi-orange hover:bg-pi-orange-light"
                            >
                              <FileText size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Factures récentes */}
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-pi-border px-5 py-4">
            <h2 className="text-base font-bold">Factures générées</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">N° Facture</th>
                  <th className="px-5 py-3 font-semibold">APD</th>
                  <th className="px-5 py-3 font-semibold">Laboratoire</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold">Financement</th>
                  <th className="px-5 py-3 font-semibold">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-pi-border/70 hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/factures/${inv.id}`)}
                        className="font-bold text-pi-orange hover:underline"
                      >
                        {inv.id}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-pi-blue">{inv.apdId}</td>
                    <td className="px-5 py-3.5">{inv.laboratoire}</td>
                    <td className="px-5 py-3.5 font-semibold">{formatAmount(inv.total)} XOF</td>
                    <td className="px-5 py-3.5 text-pi-muted">{inv.financement}</td>
                    <td className="px-5 py-3.5">
                      <Btn variant="outline" className="!px-3 !py-1.5 !text-xs" onClick={() => downloadInvoicePDF(inv)}>
                        <Download size={13} />
                        PDF
                      </Btn>
                    </td>
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
