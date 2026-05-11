import { storageGet, storagePut, storageDelete, storageList } from "./storage"
import type { Membre, Cotisation, Config, Abonnement } from "@/types"

const MEMBRES_PREFIX = "membres/"
const COTISATIONS_PREFIX = "cotisations/"
const ABONNEMENTS_PREFIX = "abonnements/"
const CONFIG_KEY = "config/global.json"

// ─── Config ──────────────────────────────────────────────────────────────────

export async function getConfig(): Promise<Config | null> {
  return storageGet(CONFIG_KEY) as Promise<Config | null>
}

export async function saveConfig(config: Config): Promise<void> {
  await storagePut(CONFIG_KEY, config)
}

// ─── Membres ─────────────────────────────────────────────────────────────────

export async function getAllMembres(): Promise<Membre[]> {
  const keys = await storageList(MEMBRES_PREFIX)
  const results = await Promise.all(keys.map((k) => storageGet(k)))
  return results.filter(Boolean) as Membre[]
}

export async function getMembre(id: string): Promise<Membre | null> {
  return storageGet(`${MEMBRES_PREFIX}${id}.json`) as Promise<Membre | null>
}

export async function getMembreByTelephone(tel: string): Promise<Membre | null> {
  const membres = await getAllMembres()
  return membres.find((m) => m.telephone === tel) ?? null
}

export async function saveMembre(membre: Membre): Promise<void> {
  await storagePut(`${MEMBRES_PREFIX}${membre.id}.json`, membre)
}

export async function deleteMembre(id: string): Promise<void> {
  await storageDelete(`${MEMBRES_PREFIX}${id}.json`)
}

// ─── Cotisations ─────────────────────────────────────────────────────────────

export async function getAllCotisations(): Promise<Cotisation[]> {
  const keys = await storageList(COTISATIONS_PREFIX)
  const results = await Promise.all(keys.map((k) => storageGet(k)))
  return results.filter(Boolean) as Cotisation[]
}

export async function getCotisationsByMembre(membreId: string): Promise<Cotisation[]> {
  const keys = await storageList(`${COTISATIONS_PREFIX}${membreId}/`)
  const results = await Promise.all(keys.map((k) => storageGet(k)))
  return (results.filter(Boolean) as Cotisation[]).sort((a, b) =>
    b.mois.localeCompare(a.mois)
  )
}

export async function getCotisation(membreId: string, mois: string): Promise<Cotisation | null> {
  return storageGet(`${COTISATIONS_PREFIX}${membreId}/${mois}.json`) as Promise<Cotisation | null>
}

export async function saveCotisation(cotisation: Cotisation): Promise<void> {
  await storagePut(
    `${COTISATIONS_PREFIX}${cotisation.membreId}/${cotisation.mois}.json`,
    cotisation
  )
}

export async function deleteCotisation(membreId: string, mois: string): Promise<void> {
  await storageDelete(`${COTISATIONS_PREFIX}${membreId}/${mois}.json`)
}

// ─── Abonnements annuels ──────────────────────────────────────────────────────

export async function getAbonnementsByMembre(membreId: string): Promise<Abonnement[]> {
  const keys = await storageList(`${ABONNEMENTS_PREFIX}${membreId}/`)
  const results = await Promise.all(keys.map((k) => storageGet(k)))
  return (results.filter(Boolean) as Abonnement[]).sort((a, b) => b.annee - a.annee)
}

export async function getAbonnement(membreId: string, annee: number): Promise<Abonnement | null> {
  return storageGet(`${ABONNEMENTS_PREFIX}${membreId}/${annee}.json`) as Promise<Abonnement | null>
}

export async function saveAbonnement(abonnement: Abonnement): Promise<void> {
  await storagePut(
    `${ABONNEMENTS_PREFIX}${abonnement.membreId}/${abonnement.annee}.json`,
    abonnement
  )
}

export async function getAllAbonnements(): Promise<Abonnement[]> {
  const keys = await storageList(ABONNEMENTS_PREFIX)
  const results = await Promise.all(keys.map((k) => storageGet(k)))
  return results.filter(Boolean) as Abonnement[]
}
