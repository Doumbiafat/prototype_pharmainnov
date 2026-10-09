import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { Card, Btn, StatusBadge } from '../components/ui'
import { usePreview } from '../components/PreviewModal'
import { activities, statusLabels } from '../data/mockData'
import { useWorkflow } from '../context/WorkflowContext'
import { downloadActivityPDF } from '../utils/pdf'

export default function ActivityLog() {
  const { journal } = useWorkflow()
  const { openPreview } = usePreview()
  const [page, setPage] = useState(0)
  const pageSize = 6

  const rows = useMemo(() => [...journal, ...activities], [journal])
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pi-border px-5 py-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Btn
                variant="outline"
                className="!text-pi-green !border-pi-green/40"
                onClick={() =>
                  openPreview({
                    title: 'Filtrer le journal',
                    subtitle: 'Critères de recherche',
                    body: 'Filtrez par utilisateur, module, statut ou plage de dates.',
                    rows: [
                      ['Modules', 'APD · Laboratoires · Frais · Auth'],
                      ['Statuts', 'Succès · En attente · Échec'],
                      ['Utilisateurs', 'Pharmaciens + Système'],
                    ],
                    confirmLabel: 'Appliquer les filtres',
                  })
                }
              >
                <Filter size={15} className="text-pi-green" />
                Filtrer
              </Btn>
              <Btn
                variant="outline"
                className="!text-pi-green !border-pi-green/40"
                onClick={() =>
                  openPreview({
                    title: 'Cette semaine',
                    subtitle: 'Période sélectionnée',
                    body: 'Affichage des activités de la semaine en cours (lundi → dimanche).',
                    rows: [
                      ['Du', 'Lundi'],
                      ['Au', 'Dimanche'],
                      ['Entrées', `${rows.length} visibles`],
                    ],
                    confirmLabel: 'Appliquer',
                  })
                }
              >
                <Calendar size={15} className="text-pi-green" />
                Cette Semaine
              </Btn>
            </div>
            <Btn variant="primary" onClick={() => downloadActivityPDF(rows)}>
              <Download size={15} />
              Exporter PDF
            </Btn>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-pi-border bg-slate-50/80 text-[11px] uppercase tracking-wide text-pi-muted">
                  <th className="px-5 py-3 font-semibold">Date & Heure</th>
                  <th className="px-5 py-3 font-semibold">Utilisateur</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Module</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <motion.tr
                    key={a.id}
                    whileHover={{ backgroundColor: 'rgba(248,250,252,0.9)' }}
                    className="border-b border-pi-border/70"
                  >
                    <td className="px-5 py-3.5 text-pi-muted">
                      <span className="font-medium text-pi-text">{a.date}</span>
                      <span className="ml-1.5">{a.time}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                          style={{ backgroundColor: a.user.color }}
                        >
                          {a.user.initials}
                        </div>
                        <span className="font-semibold">{a.user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{a.action}</td>
                    <td className="px-5 py-3.5 text-pi-muted">{a.module}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={a.status} labels={statusLabels} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-4 text-sm text-pi-muted">
            <span>
              Affichage de {page * pageSize + 1} à {Math.min((page + 1) * pageSize, rows.length)} sur{' '}
              {rows.length} entrées
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs font-semibold">
                {page + 1}/{totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  )
}
