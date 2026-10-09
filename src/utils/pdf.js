import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function formatXOF(n) {
  return `${Math.round(n).toLocaleString('fr-FR').replace(/,/g, ' ')} XOF`
}

export function downloadInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18

  // Header bar
  doc.setFillColor(0, 150, 214)
  doc.rect(0, 0, pageW, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('PHARMA INNOV CONSULTING', margin, 14)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Expertise Pharmaceutique — Projets de Santé', margin, 21)
  doc.setFontSize(8)
  doc.text('Abidjan, Côte d\'Ivoire  |  Afrique de l\'Ouest & Centre', margin, 27)

  // Invoice title
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('FACTURE', pageW - margin, 14, { align: 'right' })
  doc.setFontSize(11)
  doc.setTextColor(242, 101, 34)
  doc.text(invoice.id, pageW - margin, 22, { align: 'right' })

  let y = 42

  // Meta
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Date d'émission : ${invoice.date}`, margin, y)
  doc.text(`Réf. APD : ${invoice.apdId}`, margin, y + 5)
  doc.text(`Émis par : ${invoice.pharmacien}`, margin, y + 10)

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(9)
  doc.text('FACTURÉ À', pageW / 2 + 10, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(51, 65, 85)
  doc.text(invoice.raisonSociale || invoice.laboratoire, pageW / 2 + 10, y + 6)
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  const addrLines = doc.splitTextToSize(invoice.adresse || '', 70)
  doc.text(addrLines, pageW / 2 + 10, y + 11)
  if (invoice.email) {
    doc.text(invoice.email, pageW / 2 + 10, y + 11 + addrLines.length * 4)
  }

  y = 72

  // Activity summary box
  doc.setFillColor(232, 246, 252)
  doc.roundedRect(margin, y, pageW - margin * 2, 22, 2, 2, 'F')
  doc.setTextColor(0, 150, 214)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('ACTIVITÉ RÉGLEMENTAIRE', margin + 4, y + 6)
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)
  doc.text(`${invoice.activite} — ${invoice.produit}`, margin + 4, y + 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(
    `Pays : ${invoice.pays}  ·  Financement : ${invoice.financement}`,
    margin + 4,
    y + 19
  )

  y = 102

  const rows = (invoice.lignes || []).map((l) => [
    l.designation,
    formatXOF(l.montant),
  ])

  autoTable(doc, {
    startY: y,
    head: [['Désignation', 'Montant']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 150, 214],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  const finalY = doc.lastAutoTable.finalY + 8

  // Total
  doc.setFillColor(242, 101, 34)
  doc.roundedRect(pageW - margin - 70, finalY, 70, 14, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL TTC', pageW - margin - 66, finalY + 9)
  doc.text(formatXOF(invoice.total), pageW - margin - 4, finalY + 9, { align: 'right' })

  // Notes
  let noteY = finalY + 24
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text('Modalité de paiement', margin, noteY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const note = invoice.notes || ''
  doc.text(doc.splitTextToSize(note, pageW - margin * 2), margin, noteY + 5)

  if (invoice.financement === 'Acompte') {
    doc.setTextColor(34, 160, 107)
    doc.text('✓ Montant prélevé sur le compte d\'acompte du laboratoire.', margin, noteY + 14)
  } else {
    doc.setTextColor(242, 101, 34)
    doc.text('⚠ Préfinancement — créance à recouvrer auprès du laboratoire.', margin, noteY + 14)
  }

  // Footer
  const footerY = 280
  doc.setDrawColor(226, 232, 240)
  doc.line(margin, footerY, pageW - margin, footerY)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.text(
    'Document généré automatiquement — Pharma Innov Consulting — Numérotation infalsifiable',
    pageW / 2,
    footerY + 6,
    { align: 'center' }
  )
  doc.text(`${invoice.id}  ·  Lié à ${invoice.apdId}`, pageW / 2, footerY + 11, { align: 'center' })

  doc.save(`${invoice.id}.pdf`)
}

export function downloadAPDPDF(apd, invoice) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 18

  doc.setFillColor(0, 150, 214)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('AUTORISATION PRÉALABLE DE DÉPENSE', margin, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Pharma Innov Consulting', margin, 19)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(apd.id, pageW - margin, 16, { align: 'right' })

  let y = 40
  doc.setTextColor(30, 41, 59)
  doc.setFontSize(10)

  const fields = [
    ['Date', apd.date],
    ['Pharmacien', apd.pharmacien],
    ['Laboratoire', apd.laboratoire],
    ['Activité', apd.activite],
    ['Produit', apd.produit],
    ['Pays', apd.pays],
    ['Financement', apd.financement],
    ['Montant', `${apd.montant} XOF`],
    ['Statut', apd.statut],
    ['Facture liée', apd.factureId || '—'],
  ]

  fields.forEach(([label, value], i) => {
    const rowY = y + i * 9
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(8)
    doc.text(label.toUpperCase(), margin, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(10)
    doc.text(String(value), margin + 45, rowY)
  })

  if (apd.description) {
    const dy = y + fields.length * 9 + 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('DESCRIPTION', margin, dy)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    doc.text(doc.splitTextToSize(apd.description, pageW - margin * 2), margin, dy + 6)
  }

  if (invoice) {
    const iy = 200
    doc.setFillColor(255, 240, 232)
    doc.roundedRect(margin, iy, pageW - margin * 2, 20, 2, 2, 'F')
    doc.setTextColor(242, 101, 34)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text(`Facture générée automatiquement : ${invoice.id}`, margin + 4, iy + 8)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(`Total : ${formatXOF(invoice.total)} — ${invoice.statut}`, margin + 4, iy + 15)
  }

  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.text('Document numéroté automatiquement — conservation permanente', pageW / 2, 285, {
    align: 'center',
  })

  doc.save(`${apd.id}.pdf`)
}

function pdfHeader(doc, title, subtitle) {
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 14
  doc.setFillColor(0, 150, 214)
  doc.rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('PHARMA INNOV CONSULTING', margin, 12)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Expertise Pharmaceutique — Projets de Santé', margin, 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(title, pageW - margin, 12, { align: 'right' })
  if (subtitle) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(subtitle, pageW - margin, 18, { align: 'right' })
  }
  return 36
}

function pdfFooter(doc, label) {
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  doc.setDrawColor(226, 232, 240)
  doc.line(14, pageH - 14, pageW - 14, pageH - 14)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(7)
  doc.text(label || 'Export Pharma Innov — document généré automatiquement', pageW / 2, pageH - 9, {
    align: 'center',
  })
}

const STATUS_FR = {
  approved: 'Approuvé',
  review: 'En révision',
  draft: 'Brouillon',
  success: 'Succès',
  pending: 'En attente',
  error: 'Échec',
  paye: 'Payé',
  en_attente: 'En attente',
  planifie: 'Planifié',
  en_retard: 'En retard',
  payee: 'Payée',
}

export function downloadLaboratoriesPDF(laboratories) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'LISTE DES LABORATOIRES', date)

  autoTable(doc, {
    startY: 36,
    head: [['Nom', 'Raison sociale', 'Contrat', 'Spécialité', 'Statut', 'Responsable', 'Email', 'Pays / Adresse']],
    body: laboratories.map((l) => [
      l.name,
      l.raisonSociale || '—',
      l.contractId,
      l.specialty,
      STATUS_FR[l.status] || l.status,
      l.responsable || '—',
      l.email || '—',
      `${l.pays || ''} ${l.adresse || ''}`.trim() || '—',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 214], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    styles: { cellPadding: 2.2, overflow: 'linebreak' },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc, `${laboratories.length} laboratoire(s) — export du ${date}`)
  doc.save(`Laboratoires_PharmaInnov_${date.replace(/\//g, '-')}.pdf`)
}

export function downloadLaboratorySheetPDF(lab, solde) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const margin = 18
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'FICHE LABORATOIRE', lab.contractId)

  let y = 40
  doc.setTextColor(30, 41, 59)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(lab.name, margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(lab.raisonSociale || '', margin, y + 7)

  const fields = [
    ['Identifiant', lab.identifiant],
    ['SIRET', lab.siret],
    ['Contrat', lab.contractId],
    ['Spécialité', lab.specialty],
    ['Statut', STATUS_FR[lab.status] || lab.status],
    ['Responsable', lab.responsable],
    ['Email', lab.email],
    ['Téléphone', lab.telephone || '—'],
    ['Pays', lab.pays || '—'],
    ['Adresse', lab.adresse],
    ['Modalité paiement', lab.modalitePaiement === 'prefinancement' ? 'Préfinancement' : 'Acompte'],
    ['Solde acompte', solde != null ? formatXOF(solde) : '—'],
    ['Dernier audit', lab.lastAudit],
    ['Créé le', lab.createdAt || '—'],
  ]

  y = 58
  fields.forEach(([label, value], i) => {
    const rowY = y + i * 9
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(label.toUpperCase(), margin, rowY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(30, 41, 59)
    const lines = doc.splitTextToSize(String(value || '—'), 120)
    doc.text(lines, margin + 50, rowY)
  })

  if (lab.notes) {
    const ny = y + fields.length * 9 + 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text('NOTES', margin, ny)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    doc.text(doc.splitTextToSize(lab.notes, 170), margin, ny + 6)
  }

  pdfFooter(doc, `Fiche ${lab.name} — exportée le ${date}`)
  doc.save(`Fiche_${lab.name.replace(/\s+/g, '_')}.pdf`)
}

export function downloadDashboardPDF({ kpis = [], dossiers = [] } = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'TABLEAU DE BORD', date)

  autoTable(doc, {
    startY: 36,
    head: [['Indicateur', 'Valeur', 'Commentaire']],
    body: kpis.map((k) => [k.title, k.value, k.sub || '']),
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 214], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Réf.', 'Produit', 'Laboratoire', 'Pays', 'Étape', 'Statut']],
    body: dossiers.map((d) => [d.id, d.produit, d.lab, d.pays, d.etape, STATUS_FR[d.statut] || d.statut]),
    theme: 'grid',
    headStyles: { fillColor: [242, 101, 34], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc, `Rapport direction — ${date}`)
  doc.save(`Dashboard_PharmaInnov_${date.replace(/\//g, '-')}.pdf`)
}

export function downloadFraisPDF(frais) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'FRAIS MINISTÉRIELS', date)

  autoTable(doc, {
    startY: 36,
    head: [['Pays', 'Type', 'Laboratoire', 'Médicament', 'Montant (XOF)', 'Statut', 'Date']],
    body: frais.map((f) => [
      f.pays,
      f.type,
      f.lab,
      f.medicament || '—',
      f.montant,
      STATUS_FR[f.statut] || f.statut,
      f.date,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 214], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc, `${frais.length} frais — export du ${date}`)
  doc.save(`Frais_Ministeriels_${date.replace(/\//g, '-')}.pdf`)
}

export function downloadActivityPDF(rows) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' })
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'JOURNAL DES ACTIVITÉS', date)

  autoTable(doc, {
    startY: 36,
    head: [['Date', 'Heure', 'Utilisateur', 'Action', 'Module', 'Statut']],
    body: rows.map((a) => [
      a.date,
      a.time,
      a.user?.name || '—',
      a.action,
      a.module,
      STATUS_FR[a.status] || a.status,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [0, 150, 214], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc, `${rows.length} entrées — export du ${date}`)
  doc.save(`Journal_Activites_${date.replace(/\//g, '-')}.pdf`)
}

export function downloadRapportPDF({ caParPays = [], activiteData = [], kpis = [] } = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const date = new Date().toLocaleDateString('fr-FR')
  pdfHeader(doc, 'RAPPORT DIRECTION', date)

  if (kpis.length) {
    autoTable(doc, {
      startY: 36,
      head: [['KPI', 'Valeur']],
      body: kpis.map((k) => [k.title, k.value]),
      theme: 'grid',
      headStyles: { fillColor: [0, 150, 214], textColor: 255, fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    })
  }

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 36) + 10,
    head: [['Pays', 'CA (M XOF)']],
    body: caParPays.map((c) => [c.pays, String(c.ca)]),
    theme: 'grid',
    headStyles: { fillColor: [242, 101, 34], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['Activité', 'Part (%)']],
    body: activiteData.map((a) => [a.name, String(a.value)]),
    theme: 'grid',
    headStyles: { fillColor: [34, 160, 107], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  })

  pdfFooter(doc, `Reporting Pharma Innov — ${date}`)
  doc.save(`Rapport_PharmaInnov_${date.replace(/\//g, '-')}.pdf`)
}
