import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, FileText, Link2 } from 'lucide-react'
import PageTransition, { staggerContainer } from '../components/PageTransition'
import { PageHeader, Card, Btn } from '../components/ui'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadInvoicePDF } from '../utils/pdf'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { invoices, formatAmount } = useWorkflow()
  const invoice = invoices.find((i) => i.id === id)

  if (!invoice) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <p className="text-pi-muted">Facture introuvable.</p>
          <Btn variant="outline" className="mt-4" onClick={() => navigate('/apd')}>
            Retour
          </Btn>
        </div>
      </PageTransition>
    )
  }

  const statutLabel =
    invoice.statut === 'prelevee'
      ? { label: 'Prélèvement acompte', className: 'bg-pi-green-light text-pi-green' }
      : invoice.statut === 'a_recouvrer'
        ? { label: 'À recouvrer', className: 'bg-pi-orange-light text-pi-orange' }
        : { label: 'Émise', className: 'bg-pi-blue-light text-pi-blue' }

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-pi-muted hover:text-pi-blue"
        >
          <ArrowLeft size={16} />
          Retour
        </button>

        <PageHeader
          title={invoice.id}
          subtitle={`Facture liée à ${invoice.apdId} — ${invoice.laboratoire}`}
          actions={
            <Btn variant="primary" onClick={() => downloadInvoicePDF(invoice)}>
              <Download size={16} />
              Télécharger PDF
            </Btn>
          }
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-5 lg:grid-cols-3"
        >
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pi-orange-light">
                  <FileText size={22} className="text-pi-orange" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Détail de facturation</h2>
                  <p className="text-xs text-pi-muted">{invoice.date} · {invoice.pharmacien}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statutLabel.className}`}>
                {statutLabel.label}
              </span>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-pi-muted">Client</p>
                <p className="mt-1 font-semibold">{invoice.raisonSociale || invoice.laboratoire}</p>
                <p className="text-xs text-pi-muted">{invoice.adresse}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-pi-muted">Activité</p>
                <p className="mt-1 font-semibold">{invoice.activite}</p>
                <p className="text-xs text-pi-muted">{invoice.produit} · {invoice.pays}</p>
              </div>
            </div>

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="pb-3 font-semibold">Désignation</th>
                  <th className="pb-3 text-right font-semibold">Montant</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.lignes || []).map((l) => (
                  <tr key={l.designation} className="border-b border-pi-border/60">
                    <td className="py-3.5">{l.designation}</td>
                    <td className="py-3.5 text-right font-semibold">{formatAmount(l.montant)} XOF</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-4 text-base font-bold">Total TTC</td>
                  <td className="pt-4 text-right text-lg font-bold text-pi-orange">
                    {formatAmount(invoice.total)} XOF
                  </td>
                </tr>
              </tfoot>
            </table>
          </Card>

          <Card className="h-fit p-6">
            <div className="mb-4 flex items-center gap-2">
              <Link2 size={18} className="text-pi-blue" />
              <h3 className="font-bold">Traçabilité</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase text-pi-muted">APD source</p>
                <button
                  type="button"
                  onClick={() => navigate(`/apd/${invoice.apdId}`)}
                  className="mt-1 font-bold text-pi-blue hover:underline"
                >
                  {invoice.apdId}
                </button>
              </div>
              <div>
                <p className="text-xs uppercase text-pi-muted">Financement</p>
                <p className="mt-1 font-semibold">{invoice.financement}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-pi-muted">Note</p>
                <p className="mt-1 text-pi-muted">{invoice.notes}</p>
              </div>
            </div>
            <Btn
              variant="primary"
              className="mt-6 w-full justify-center"
              onClick={() => downloadInvoicePDF(invoice)}
            >
              <Download size={16} />
              Télécharger PDF
            </Btn>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
