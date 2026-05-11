export type StatutMembre = "en_attente" | "actif" | "suspendu"

export interface Membre {
  id: string
  nom: string
  prenom: string
  telephone: string // ex: "237695101010" — unique
  age: number
  adresse?: string
  statut: StatutMembre
  dateInscription: string // ISO
}

export interface Cotisation {
  id: string
  membreId: string
  telephone: string
  mois: string // "2025-04"
  montant: number
  datePaiement: string // ISO
  note?: string
}

export interface Config {
  cotisationMensuelle: number
  abonnementAnnuel: number
  nomClub: string
  devise: string
  codeAdminHash: string
}

export interface Abonnement {
  id: string
  membreId: string
  annee: number       // ex: 2025
  montant: number
  datePaiement: string // ISO
  note?: string
}

export interface MembreAvecCotisations extends Membre {
  cotisations: Cotisation[]
  abonnements: Abonnement[]
}

export interface EtatMensuel {
  mois: string
  membresAJour: Membre[]
  membresEnRetard: Membre[]
  totalEncaisse: number
}
