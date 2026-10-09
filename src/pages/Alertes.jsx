import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Wallet, FileWarning, Clock } from 'lucide-react'
import PageTransition, { staggerContainer, fadeUpItem } from '../components/PageTransition'
import { PageHeader, KpiCard, Card } from '../components/ui'
import { usePreview } from '../components/PreviewModal'
import { alertes } from '../data/mockData'

const prioriteStyles = {
  critique: 'bg-pi-red-light text-pi-red border-pi-red/20',
  haute: 'bg-pi-orange-light text-pi-orange border-pi-orange/20',
  moyenne: 'bg-amber-50 text-amber-700 border-amber-200',
  basse: 'bg-slate-100 text-slate-500 border-slate-200',
}

const typeIcons = {
  expiration: AlertTriangle,
  solde: Wallet,
  creance: FileWarning,
  apd: Clock,
}

export default function Alertes() {
  const { openPreview } = usePreview()

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Alertes"
          subtitle="Échéances AMM, soldes critiques, créances en retard et APD en attente."
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-4"
        >
          <KpiCard title="Critiques" value="1" icon={Bell} iconBg="bg-pi-red-light" iconColor="text-pi-red" subColor="text-pi-red" sub="Action immédiate" />
          <KpiCard title="Haute priorité" value="3" icon={AlertTriangle} iconBg="bg-pi-orange-light" iconColor="text-pi-orange" />
          <KpiCard title="Moyenne" value="1" icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" />
          <KpiCard title="Basse" value="1" icon={FileWarning} iconBg="bg-slate-100" iconColor="text-slate-500" />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 space-y-3"
        >
          {alertes.map((a) => {
            const Icon = typeIcons[a.type] || Bell
            return (
              <motion.div key={a.id} variants={fadeUpItem}>
                <Card className={`border p-4 ${prioriteStyles[a.priorite]}`}>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-pi-text">{a.titre}</p>
                        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          {a.priorite}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-pi-muted">
                        {a.lab} · {a.pays} · {a.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        openPreview({
                          title: 'Traiter l’alerte',
                          subtitle: a.titre,
                          body: 'Prévisualisation du traitement : assignation, échéance et action corrective.',
                          rows: [
                            ['Priorité', a.priorite],
                            ['Laboratoire', a.lab],
                            ['Pays', a.pays],
                            ['Type', a.type],
                            ['Date', a.date],
                          ],
                          confirmLabel: 'Marquer comme traitée',
                        })
                      }
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-pi-text shadow-sm hover:bg-slate-50"
                    >
                      Traiter
                    </button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </PageTransition>
  )
}
