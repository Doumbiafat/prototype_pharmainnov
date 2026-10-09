import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import PageTransition, { staggerContainer, fadeUpItem } from '../components/PageTransition'
import { PageHeader, KpiCard, Card, Avatar } from '../components/ui'
import { comptesAcompte } from '../data/mockData'
import { useWorkflow } from '../context/WorkflowContext'

export default function Comptes() {
  const { laboratories, getSolde, formatAmount } = useWorkflow()

  const cards = useMemo(() => {
    return laboratories.map((lab) => {
      const seed = comptesAcompte.find((c) => c.lab === lab.name)
      const depose = seed
        ? Number(String(seed.depose).replace(/\s/g, ''))
        : Math.max(getSolde(lab.id), 0)
      const soldeLive = getSolde(lab.id)
      const consomme = Math.max(0, depose - soldeLive)
      const pct = depose ? Math.min(100, Math.round((consomme / depose) * 100)) : 0
      return {
        lab: lab.name,
        initials: lab.initials,
        color: lab.color,
        depose: formatAmount(depose),
        soldeLive,
        consommeLive: consomme,
        pct,
      }
    })
  }, [laboratories, getSolde, formatAmount])

  const totalSolde = cards.reduce((s, c) => s + c.soldeLive, 0)
  const totalConsomme = cards.reduce((s, c) => s + c.consommeLive, 0)
  const totalDepose = cards.reduce((s, c) => {
    const seed = comptesAcompte.find((x) => x.lab === c.lab)
    const depose = seed
      ? Number(String(seed.depose).replace(/\s/g, ''))
      : Math.max(c.soldeLive, 0)
    return s + depose
  }, 0)

  return (
    <PageTransition>
      <div className="p-4 sm:p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Comptes & Trésorerie"
          subtitle="Visibilité temps réel sur les comptes d'acompte : dépôts, consommations et soldes."
        />

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
          <KpiCard
            title="Total déposé"
            value={`XOF ${formatAmount(totalDepose)}`}
            icon={ArrowDownCircle}
            iconBg="bg-pi-blue-light"
            iconColor="text-pi-blue"
          />
          <KpiCard
            title="Total consommé"
            value={`XOF ${formatAmount(totalConsomme)}`}
            icon={ArrowUpCircle}
            iconBg="bg-pi-orange-light"
            iconColor="text-pi-orange"
          />
          <KpiCard
            title="Soldes disponibles"
            value={`XOF ${formatAmount(totalSolde)}`}
            icon={Wallet}
            iconBg="bg-pi-green-light"
            iconColor="text-pi-green"
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 grid gap-4 lg:grid-cols-2"
        >
          {cards.map((c) => (
            <motion.div key={c.lab} variants={fadeUpItem}>
              <Card className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={c.initials} color={c.color} />
                    <div>
                      <p className="font-bold text-pi-text">{c.lab}</p>
                      <p className="text-xs text-pi-muted">Compte d&apos;acompte</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-pi-muted">Solde</p>
                    <p className={`text-lg font-bold ${c.pct > 90 ? 'text-pi-red' : 'text-pi-green'}`}>
                      {formatAmount(c.soldeLive)} <span className="text-xs font-normal">XOF</span>
                    </p>
                  </div>
                </div>

                <div className="mb-2 flex justify-between text-xs text-pi-muted">
                  <span>Consommé {c.pct}%</span>
                  <span>Déposé : {c.depose} XOF</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(c.pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                    className={`h-full rounded-full ${c.pct > 90 ? 'bg-pi-red' : c.pct > 70 ? 'bg-pi-orange' : 'bg-pi-blue'}`}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-pi-muted">
                    Consommé : <strong className="text-pi-text">{formatAmount(c.consommeLive)}</strong>
                  </span>
                  {c.pct > 90 && (
                    <span className="font-semibold text-pi-red">Solde critique</span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PageTransition>
  )
}
