import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  apds as seedApds,
  laboratories as seedLabs,
  comptesAcompte,
  medicaments as seedMedicaments,
  fraisMinisteriels as seedFrais,
} from '../data/mockData'

const WorkflowContext = createContext(null)

function pad(n, size = 4) {
  return String(n).padStart(size, '0')
}

function formatDate(d = new Date()) {
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(d = new Date()) {
  return {
    date: formatDate(d),
    time: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function parseAmount(str) {
  if (typeof str === 'number') return str
  return Number(String(str).replace(/\s/g, '').replace(/XOF/gi, '')) || 0
}

function formatAmount(n) {
  return Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ')
}

const initialSoldes = Object.fromEntries(
  comptesAcompte.map((c) => {
    const lab = seedLabs.find((l) => l.name === c.lab)
    return [lab?.id || c.lab, parseAmount(c.solde)]
  })
)

const seedInvoices = [
  {
    id: 'FAC-2023-1120',
    apdId: 'APD-2023-0845',
    laboratoireId: 'lab-3',
    laboratoire: 'CardioPharma Plus',
    activite: 'Variation type II',
    produit: 'Atorvastatine 20mg',
    pays: 'Burkina Faso',
    financement: 'Acompte',
    lignes: [
      { designation: 'Honoraires Pharma Innov — Variation type II', montant: 450000 },
      { designation: 'Frais ministériels — Burkina Faso', montant: 220000 },
      { designation: 'Honoraires collaborateur pays', montant: 180000 },
    ],
    total: 850000,
    statut: 'emise',
    date: '15 Oct 2023',
    pharmacien: 'Dr. Rousseau',
  },
]

const LAB_COLORS = ['#0096d6', '#38bdf8', '#0ea5e9', '#7dd3fc', '#8b5cf6', '#22a06b', '#f26522', '#7c5cbf']

function makeInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || 'LB'
}

export function WorkflowProvider({ children }) {
  const [laboratories, setLaboratories] = useState(seedLabs)
  const [apdList, setApdList] = useState(() =>
    seedApds.map((a) => {
      const lab = seedLabs.find((l) => l.name === a.laboratoire)
      return {
        ...a,
        laboratoireId: lab?.id,
        montantNum: parseAmount(a.montant),
        factureId: a.statut === 'facturee' ? 'FAC-2023-1120' : null,
        lignes: null,
      }
    })
  )
  const [invoices, setInvoices] = useState(seedInvoices)
  const [soldes, setSoldes] = useState(initialSoldes)
  const [apdSeq, setApdSeq] = useState(848)
  const [facSeq, setFacSeq] = useState(1121)
  const [labSeq, setLabSeq] = useState(6)
  const [ctrSeq, setCtrSeq] = useState(1600)
  const [medSeq, setMedSeq] = useState(9)
  const [fraisSeq, setFraisSeq] = useState(6)
  const [medicaments, setMedicaments] = useState(seedMedicaments)
  const [fraisList, setFraisList] = useState(seedFrais)
  const [journal, setJournal] = useState([])

  const nextApdNumber = useCallback(() => {
    const year = new Date().getFullYear()
    const num = `APD-${year}-${pad(apdSeq)}`
    setApdSeq((s) => s + 1)
    return num
  }, [apdSeq])

  const nextFacNumber = useCallback(() => {
    const year = new Date().getFullYear()
    const num = `FAC-${year}-${pad(facSeq)}`
    setFacSeq((s) => s + 1)
    return num
  }, [facSeq])

  const addJournal = useCallback((user, action, module = 'APD & Facturation', status = 'success') => {
    const { date, time } = formatDateTime()
    setJournal((j) => [
      {
        id: Date.now(),
        date,
        time,
        user: { name: user.name, initials: user.initials, color: user.color },
        action,
        module,
        status,
      },
      ...j,
    ])
  }, [])

  const buildInvoiceLines = (form) => {
    const total = parseAmount(form.montant)
    const fraisMin = Math.round(total * 0.35)
    const collabPays = Math.round(total * 0.2)
    const honoraires = total - fraisMin - collabPays
    return [
      { designation: `Honoraires Pharma Innov — ${form.activite}`, montant: honoraires },
      { designation: `Frais ministériels — ${form.pays}`, montant: fraisMin },
      { designation: 'Honoraires collaborateur pays', montant: collabPays },
    ]
  }

  const createAPD = useCallback(
    (form, user) => {
      const lab = laboratories.find((l) => l.id === form.laboratoireId)
      if (!lab) return { ok: false, error: 'Laboratoire introuvable.' }

      const med = medicaments.find((m) => m.id === form.medicamentId)
      if (!med) return { ok: false, error: 'Sélectionnez un médicament de la liste.' }
      if (med.laboratoireId !== lab.id) {
        return { ok: false, error: 'Ce médicament n’appartient pas au laboratoire sélectionné.' }
      }

      const montantNum = parseAmount(form.montant)
      const financement = form.financement // 'acompte' | 'prefinancement'
      const soldeActuel = soldes[lab.id] ?? 0

      if (financement === 'acompte' && soldeActuel < montantNum) {
        return {
          ok: false,
          error: `Solde insuffisant (${formatAmount(soldeActuel)} XOF). Choisissez le préfinancement ou alimentez le compte d'acompte.`,
        }
      }

      const apdId = nextApdNumber()
      const facId = nextFacNumber()
      const date = formatDate()
      const produit = med.name
      const lignes = buildInvoiceLines({ ...form, produit, montant: montantNum })
      const financementLabel = financement === 'acompte' ? 'Acompte' : 'Préfinancement'

      if (financement === 'acompte') {
        setSoldes((s) => ({ ...s, [lab.id]: (s[lab.id] ?? 0) - montantNum }))
      }

      const invoice = {
        id: facId,
        apdId,
        laboratoireId: lab.id,
        laboratoire: lab.name,
        activite: form.activite,
        produit,
        medicamentId: med.id,
        pays: form.pays,
        financement: financementLabel,
        lignes,
        total: montantNum,
        statut: financement === 'acompte' ? 'prelevee' : 'a_recouvrer',
        date,
        pharmacien: user.name,
        email: lab.email,
        adresse: lab.adresse,
        raisonSociale: lab.raisonSociale,
        notes:
          financement === 'acompte'
            ? 'Prélèvement sur compte d\'acompte du laboratoire.'
            : 'Préfinancement Pharma Innov — à refacturer au laboratoire.',
      }

      const apd = {
        id: apdId,
        laboratoireId: lab.id,
        laboratoire: lab.name,
        activite: form.activite,
        produit,
        medicamentId: med.id,
        pays: form.pays,
        montant: formatAmount(montantNum),
        montantNum,
        financement: financementLabel,
        statut: 'facturee',
        date,
        pharmacien: user.name,
        factureId: facId,
        description: form.description || '',
        lignes,
      }

      setApdList((list) => [apd, ...list])
      setInvoices((list) => [invoice, ...list])
      addJournal(user, `Création ${apdId} → ${facId}`, 'APD & Facturation')
      addJournal(user, `Facture ${facId} générée (${financementLabel})`, 'APD & Facturation')

      return { ok: true, apd, invoice }
    },
    [laboratories, medicaments, soldes, nextApdNumber, nextFacNumber, addJournal]
  )

  const getSolde = useCallback(
    (labId) => soldes[labId] ?? 0,
    [soldes]
  )

  const createLaboratory = useCallback(
    (form, user) => {
      const name = form.name?.trim()
      if (!name) return { ok: false, error: 'Le nom commercial est obligatoire.' }
      if (!form.raisonSociale?.trim()) return { ok: false, error: 'La raison sociale est obligatoire.' }
      if (!form.email?.trim()) return { ok: false, error: 'L’email de contact est obligatoire.' }
      if (!form.responsable?.trim()) return { ok: false, error: 'Le responsable légal est obligatoire.' }
      if (!form.adresse?.trim()) return { ok: false, error: 'L’adresse du siège est obligatoire.' }

      const exists = laboratories.some(
        (l) => l.name.toLowerCase() === name.toLowerCase() || l.email.toLowerCase() === form.email.trim().toLowerCase()
      )
      if (exists) return { ok: false, error: 'Un laboratoire avec ce nom ou cet email existe déjà.' }

      const year = new Date().getFullYear()
      const id = `lab-${labSeq}`
      const contractId = form.contractId?.trim() || `CTR-${year}-${pad(ctrSeq)}`
      const soldeInitial = parseAmount(form.soldeInitial || 0)
      const lab = {
        id,
        name,
        initials: form.initials?.trim().toUpperCase() || makeInitials(name),
        color: LAB_COLORS[(labSeq - 1) % LAB_COLORS.length],
        siret: form.siret?.trim()
          ? form.siret.trim().startsWith('SIRET')
            ? form.siret.trim()
            : `SIRET: ${form.siret.trim()}`
          : `SIRET: —`,
        contractId,
        specialty: form.specialty || 'Autre',
        status: form.status || 'draft',
        lastAudit: form.lastAudit?.trim() || 'Non audité',
        raisonSociale: form.raisonSociale.trim(),
        identifiant: form.identifiant?.trim() || `ID-${year}-${pad(labSeq)}`,
        responsable: form.responsable.trim(),
        email: form.email.trim(),
        telephone: form.telephone?.trim() || '',
        adresse: form.adresse.trim(),
        pays: form.pays || "Côte d'Ivoire",
        modalitePaiement: form.modalitePaiement || 'acompte',
        notes: form.notes?.trim() || '',
        contratsEnCours: Number(form.contratsEnCours) || 0,
        contratsEnAttente: Number(form.contratsEnAttente) || 0,
        createdAt: formatDate(),
      }

      setLaboratories((list) => [lab, ...list])
      setSoldes((s) => ({ ...s, [id]: soldeInitial }))
      setLabSeq((n) => n + 1)
      if (!form.contractId?.trim()) setCtrSeq((n) => n + 1)
      if (user) addJournal(user, `Création laboratoire ${lab.name} (${lab.contractId})`, 'Laboratoires & Contrats')

      return { ok: true, laboratory: lab }
    },
    [laboratories, labSeq, ctrSeq, addJournal]
  )

  const updateLaboratory = useCallback(
    (id, patch, user) => {
      let updated = null
      setLaboratories((list) =>
        list.map((l) => {
          if (l.id !== id) return l
          updated = { ...l, ...patch }
          return updated
        })
      )
      if (updated && user) {
        addJournal(user, `Mise à jour laboratoire ${updated.name}`, 'Laboratoires & Contrats')
      }
      return { ok: !!updated, laboratory: updated }
    },
    [addJournal]
  )

  const createMedicament = useCallback(
    (form, user) => {
      const name = form.name?.trim()
      if (!name) return { ok: false, error: 'Le nom du médicament est obligatoire.' }
      if (!form.laboratoireId) return { ok: false, error: 'Sélectionnez un laboratoire.' }
      if (!form.dci?.trim()) return { ok: false, error: 'La DCI est obligatoire.' }

      const lab = laboratories.find((l) => l.id === form.laboratoireId)
      if (!lab) return { ok: false, error: 'Laboratoire introuvable.' }

      const exists = medicaments.some(
        (m) =>
          m.laboratoireId === lab.id &&
          m.name.toLowerCase() === name.toLowerCase()
      )
      if (exists) return { ok: false, error: 'Ce médicament existe déjà pour ce laboratoire.' }

      const med = {
        id: `med-${medSeq}`,
        name,
        dci: form.dci.trim(),
        forme: form.forme || 'Comprimé',
        dosage: form.dosage?.trim() || '—',
        laboratoireId: lab.id,
        laboratoire: lab.name,
        classe: form.classe?.trim() || 'Autre',
        statutAmm: form.statutAmm || 'brouillon',
        dateExpirationAmm: form.dateExpirationAmm?.trim() || '—',
        createdAt: formatDate(),
      }

      setMedicaments((list) => [med, ...list])
      setMedSeq((n) => n + 1)
      if (user) addJournal(user, `Ajout médicament ${med.name} (${lab.name})`, 'Médicaments')
      return { ok: true, medicament: med }
    },
    [laboratories, medicaments, medSeq, addJournal]
  )

  const createFrais = useCallback(
    (form, user) => {
      if (!form.laboratoireId) return { ok: false, error: 'Sélectionnez un laboratoire.' }
      if (!form.type) return { ok: false, error: 'Le type de frais est obligatoire.' }
      if (!form.pays) return { ok: false, error: 'Le pays est obligatoire.' }
      const montantNum = parseAmount(form.montant)
      if (montantNum <= 0) return { ok: false, error: 'Le montant doit être supérieur à 0.' }

      const lab = laboratories.find((l) => l.id === form.laboratoireId)
      if (!lab) return { ok: false, error: 'Laboratoire introuvable.' }

      const med = form.medicamentId
        ? medicaments.find((m) => m.id === form.medicamentId)
        : null

      const frais = {
        id: fraisSeq,
        pays: form.pays,
        type: form.type,
        montant: formatAmount(montantNum),
        montantNum,
        lab: lab.name,
        laboratoireId: lab.id,
        medicament: med?.name || form.medicamentLabel || '—',
        medicamentId: med?.id || null,
        statut: form.statut || 'en_attente',
        date: form.date || formatDate(),
        apdId: form.apdId || null,
        notes: form.notes?.trim() || '',
      }

      setFraisList((list) => [frais, ...list])
      setFraisSeq((n) => n + 1)
      if (user) {
        addJournal(
          user,
          `Frais ministériel ${frais.type} — ${frais.lab} (${frais.montant} XOF)`,
          'Frais Ministériels'
        )
      }
      return { ok: true, frais }
    },
    [laboratories, medicaments, fraisSeq, addJournal]
  )

  const getMedicamentsByLab = useCallback(
    (labId) => medicaments.filter((m) => m.laboratoireId === labId),
    [medicaments]
  )

  const value = useMemo(
    () => ({
      apdList,
      invoices,
      soldes,
      journal,
      laboratories,
      medicaments,
      fraisList,
      createAPD,
      createLaboratory,
      updateLaboratory,
      createMedicament,
      createFrais,
      getMedicamentsByLab,
      getSolde,
      formatAmount,
      parseAmount,
    }),
    [
      apdList,
      invoices,
      soldes,
      journal,
      laboratories,
      medicaments,
      fraisList,
      createAPD,
      createLaboratory,
      updateLaboratory,
      createMedicament,
      createFrais,
      getMedicamentsByLab,
      getSolde,
    ]
  )

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}

export const ACTIVITES = [
  'Enregistrement initial',
  'Renouvellement AMM',
  'Variation type I',
  'Variation type II',
  'Dépôt de courrier',
  'Audit de conformité',
]

export const PAYS = [
  "Côte d'Ivoire",
  'Sénégal',
  'Burkina Faso',
  'Mali',
  'Guinée',
  'Togo',
  'Bénin',
  'Niger',
]

export const SPECIALITES = [
  'Biotechnologie',
  'Génériques',
  'Cardiologie',
  'Neurologie',
  'Oncologie',
  'Vaccins',
  'Dermatologie',
  'Autre',
]

export const FORMES = ['Comprimé', 'Gélule', 'Injectable', 'Sirop', 'Pommade', 'Suppositoire', 'Autre']

export const CLASSES_THERAPEUTIQUES = [
  'Antibiotique',
  'Antalgique',
  'AINS',
  'Hypolipémiant',
  'Antihypertenseur',
  'Anticonvulsivant',
  'Vaccin',
  'Autre',
]

export const TYPES_FRAIS = ['Enregistrement', 'Renouvellement', 'Variation', 'Dépôt de courrier', 'Autre']
