import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { PageHeader, Card, Btn, StatusBadge } from '../components/ui'
import { useWorkflow } from '../context/WorkflowContext'
import { statusLabels } from '../data/mockData'
import { downloadAPDPDF, downloadInvoicePDF } from '../utils/pdf'

export default function APDDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { apdList, invoices } = useWorkflow()
  const apd = apdList.find((a) => a.id === id)
  const invoice = invoices.find((i) => i.id === apd?.factureId)

  if (!apd) {
    return (
      <PageTransition>
        <div className="p-8 text-center">
          <p className="text-pi-muted">APD introuvable.</p>
          <Btn variant="outline" className="mt-4" onClick={() => navigate('/apd')}>Retour</Btn>
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
          Retour aux APD
        </button>

        <PageHeader
          title={apd.id}
          subtitle={`${apd.laboratoire} — ${apd.activite}`}
          actions={
            <>
              <Btn variant="outline" onClick={() => downloadAPDPDF(apd, invoice)}>
                <Download size={16} />
                PDF APD
              </Btn>
              {invoice && (
                <Btn variant="primary" onClick={() => downloadInvoicePDF(invoice)}>
                  <Download size={16} />
                  PDF Facture
                </Btn>
              )}
            </>
          }
        />

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Informations</h2>
            <StatusBadge status={apd.statut} labels={statusLabels} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            {[
              ['Date', apd.date],
              ['Pharmacien', apd.pharmacien],
              ['Produit', apd.produit],
              ['Pays', apd.pays],
              ['Montant', `${apd.montant} XOF`],
              ['Financement', apd.financement],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs font-semibold uppercase text-pi-muted">{k}</p>
                <p className="mt-1 font-semibold">{v}</p>
              </div>
            ))}
          </div>
          {apd.description && (
            <div className="mt-4 border-t border-pi-border pt-4">
              <p className="text-xs font-semibold uppercase text-pi-muted">Description</p>
              <p className="mt-1 text-sm">{apd.description}</p>
            </div>
          )}
          {invoice && (
            <div className="mt-5 rounded-xl bg-pi-orange-light/50 px-4 py-3 text-sm">
              Facture liée :{' '}
              <button
                type="button"
                className="font-bold text-pi-orange hover:underline"
                onClick={() => navigate(`/factures/${invoice.id}`)}
              >
                {invoice.id}
              </button>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  )
}
