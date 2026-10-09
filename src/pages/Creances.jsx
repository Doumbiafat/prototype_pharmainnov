import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HandCoins, AlertCircle, CheckCircle2, Clock, Download } from 'lucide-react'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Btn, StatusBadge } from '../components/ui'
import { usePreview } from '../components/PreviewModal'
import { creances, statusLabels } from '../data/mockData'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadInvoicePDF } from '../utils/pdf'

export default function Creances() {
  const navigate = useNavigate()
  const { invoices, formatAmount } = useWorkflow()
  const { openPreview } = usePreview()

  const liveCreances = useMemo(() => {
    const fromPrefinancement = invoices
      .filter((i) => i.statut === 'a_recouvrer')
      .map((i) => ({
        id: i.id,
        lab: i.laboratoire,
        montant: formatAmount(i.total),
        montantNum: i.total,
        echeance: 'À définir',
        retard: 0,
        statut: 'en_attente',
        live: true,
        invoice: i,
      }))

    const seed = creances.map((c) => ({
      ...c,
      montantNum: Number(String(c.montant).replace(/\s/g, '')),
      live: false,
    }))

    return [...fromPrefinancement, ...seed]
  }, [invoices, formatAmount])

  const enAttente = liveCreances
    .filter((c) => c.statut === 'en_attente')
    .reduce((s, c) => s + c.montantNum, 0)
  const enRetard = liveCreances
    .filter((c) => c.statut === 'en_retard')
    .reduce((s, c) => s + c.montantNum, 0)
  const payees = liveCreances
    .filter((c) => c.statut === 'payee')
    .reduce((s, c) => s + c.montantNum, 0)

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Créances"
          subtitle="Suivi du recouvrement : factures en attente, en retard et payées. Les préfinancements créent automatiquement une créance."
          actions={
            <Btn
              variant="primary"
              onClick={() =>
                openPreview({
                  title: 'Relancer les retards',
                  subtitle: 'Campagne de recouvrement',
                  body: 'Envoi d’une relance groupée (email + notification) aux laboratoires dont les factures sont en retard.',
                  rows: [
                    ['Factures en retard', String(liveCreances.filter((c) => c.statut === 'en_retard').length)],
                    ['Montant', `XOF ${formatAmount(enRetard)}`],
                    ['Canal', 'Email + Journal d’activité'],
                  ],
                  confirmLabel: 'Envoyer les relances',
                })
              }
            >
              Relancer les retards
            </Btn>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard
            title="En attente"
            value={`XOF ${formatAmount(enAttente)}`}
            icon={Clock}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
          <KpiCard
            title="En retard"
            value={`XOF ${formatAmount(enRetard)}`}
            sub={`${liveCreances.filter((c) => c.statut === 'en_retard').length} factures`}
            subColor="text-pi-red"
            icon={AlertCircle}
            iconBg="bg-pi-red-light"
            iconColor="text-pi-red"
          />
          <KpiCard
            title="Encaissées"
            value={`XOF ${formatAmount(payees)}`}
            icon={CheckCircle2}
            iconBg="bg-pi-green-light"
            iconColor="text-pi-green"
          />
        </motion.div>

        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-pi-border px-5 py-4">
            <div className="flex items-center gap-2">
              <HandCoins size={18} className="text-pi-blue" />
              <h2 className="text-base font-bold">Liste des créances</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">N° Facture</th>
                  <th className="px-5 py-3 font-semibold">Laboratoire</th>
                  <th className="px-5 py-3 font-semibold">Montant</th>
                  <th className="px-5 py-3 font-semibold">Échéance</th>
                  <th className="px-5 py-3 font-semibold">Retard</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 font-semibold">PDF</th>
                </tr>
              </thead>
              <tbody>
                {liveCreances.map((c) => (
                  <motion.tr
                    key={c.id}
                    whileHover={{ backgroundColor: 'rgba(248,250,252,0.9)' }}
                    className="border-b border-pi-border/70"
                  >
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => c.live && navigate(`/factures/${c.id}`)}
                        className={`font-bold ${c.live ? 'text-pi-orange hover:underline' : 'text-pi-blue'}`}
                      >
                        {c.id}
                      </button>
                      {c.live && (
                        <span className="ml-2 rounded-full bg-pi-orange-light px-2 py-0.5 text-[10px] font-bold text-pi-orange">
                          Préfinancement
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{c.lab}</td>
                    <td className="px-5 py-3.5 font-semibold">{c.montant} XOF</td>
                    <td className="px-5 py-3.5 text-pi-muted">{c.echeance}</td>
                    <td className="px-5 py-3.5">
                      {c.retard > 0 ? (
                        <span className="font-semibold text-pi-red">{c.retard} j</span>
                      ) : (
                        <span className="text-pi-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.statut} labels={statusLabels} />
                    </td>
                    <td className="px-5 py-3.5">
                      {c.invoice ? (
                        <button
                          type="button"
                          onClick={() => downloadInvoicePDF(c.invoice)}
                          className="rounded-lg p-1.5 text-pi-orange hover:bg-pi-orange-light"
                        >
                          <Download size={15} />
                        </button>
                      ) : (
                        <span className="text-pi-muted">—</span>
                      )}
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
