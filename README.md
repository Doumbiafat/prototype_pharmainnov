# Pharma Innov — Prototype

Prototype de présentation pour **Pharma Innov Consulting** : plateforme de gestion des affaires réglementaires (AMM, APD, facturation, acomptes, créances).

## Lancer le projet

```bash
cd pharma-innov-prototype
npm install
npm run dev
```

Ouvrir l'URL affichée (généralement `http://localhost:5173`).

## Connexion démo (pharmacien)

| Email | Mot de passe |
|-------|----------------|
| `pharmacien@pharmainnov.ci` | `demo123` |
| `dr.kone@pharmainnov.ci` | `demo123` |

## Workflow APD → Facture

1. Se connecter en pharmacien
2. **Nouvelle Demande** (sidebar) ou **APD & Facturation → Nouvelle APD**
3. Choisir le laboratoire
4. Renseigner activité / produit / pays / montant
5. Choisir le financement :
   - **Acompte** : prélèvement sur le fond de caisse (si solde suffisant)
   - **Préfinancement** : le cabinet avance, créance ouverte
6. Valider → APD + facture numérotées automatiquement
7. Télécharger les PDF (APD et facture)

## Pages disponibles

| Route | Écran |
|-------|--------|
| `/login` | Connexion pharmacien |
| `/` | Tableau de bord Direction |
| `/laboratoires` | Laboratoires & Partenaires |
| `/laboratoires/:id` | Détail laboratoire |
| `/frais-ministeriels` | Frais Ministériels |
| `/apd` | APD & Facturation |
| `/apd/nouvelle` | Wizard création APD |
| `/apd/:id` | Détail APD + PDF |
| `/factures/:id` | Détail facture + PDF |
| `/comptes` | Comptes d'acompte (soldes live) |
| `/creances` | Créances / Recouvrement |
| `/journal` | Journal des Activités |
| `/alertes` | Alertes (AMM, soldes, retards) |
| `/rapports` | Reporting & CA |

## Stack

- React + Vite
- Tailwind CSS v4
- Framer Motion (transitions de pages)
- Recharts (graphiques)
- Lucide React (icônes)
- React Router

Prototype **statique** (données mock) destiné à la démonstration du workflow métier.
