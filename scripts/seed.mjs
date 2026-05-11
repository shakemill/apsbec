import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, "../data")

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toFile(key) {
  return path.join(DATA_DIR, key.replace(/\//g, "__"))
}

async function write(key, data) {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(toFile(key), JSON.stringify(data, null, 2), "utf-8")
}

// ─── Config ──────────────────────────────────────────────────────────────────

await write("config/global.json", {
  nomClub: "APSBEC",
  devise: "FCFA",
  cotisationMensuelle: 5000,
  abonnementAnnuel: 50000,
  // hash bcrypt de "APSBEC2024" — généré à la 1ère connexion, pas besoin ici
  codeAdminHash: "",
})

// ─── Membres ─────────────────────────────────────────────────────────────────

const membres = [
  { prenom: "Jean-Pierre",  nom: "MBALLA",      tel: "237695101010", indicatif: "237", age: 38, adresse: "Yaoundé, Cameroun",      statut: "actif",       dateInscription: "2024-06-15" },
  { prenom: "Marie",        nom: "NGONO",        tel: "237699202020", indicatif: "237", age: 32, adresse: "Douala, Cameroun",       statut: "actif",       dateInscription: "2024-07-01" },
  { prenom: "Paul",         nom: "TCHAMGA",      tel: "33612345678",  indicatif: "33",  age: 45, adresse: "Paris, France",           statut: "actif",       dateInscription: "2024-08-10" },
  { prenom: "Sandrine",     nom: "BIWOLE",       tel: "32491234567",  indicatif: "32",  age: 29, adresse: "Bruxelles, Belgique",     statut: "actif",       dateInscription: "2024-09-20" },
  { prenom: "Emmanuel",     nom: "FOTSO",        tel: "237676303030", indicatif: "237", age: 41, adresse: "Bafoussam, Cameroun",     statut: "actif",       dateInscription: "2024-10-05" },
  { prenom: "Cécile",       nom: "ATANGANA",     tel: "41791234567",  indicatif: "41",  age: 36, adresse: "Genève, Suisse",          statut: "actif",       dateInscription: "2024-10-12" },
  { prenom: "Roger",        nom: "NKOMO",        tel: "237677404040", indicatif: "237", age: 27, adresse: "Kribi, Cameroun",         statut: "actif",       dateInscription: "2024-11-01" },
  { prenom: "Martine",      nom: "ESSOMBA",      tel: "33698765432",  indicatif: "33",  age: 34, adresse: "Lyon, France",            statut: "actif",       dateInscription: "2024-11-18" },
  { prenom: "Hervé",        nom: "NDONGO",       tel: "237690505050", indicatif: "237", age: 50, adresse: "Yaoundé, Cameroun",      statut: "actif",       dateInscription: "2024-12-01" },
  { prenom: "Françoise",    nom: "ONGOLO",       tel: "49151234567",  indicatif: "49",  age: 43, adresse: "Berlin, Allemagne",       statut: "actif",       dateInscription: "2024-12-15" },
  { prenom: "Didier",       nom: "MOUNGANG",     tel: "237655606060", indicatif: "237", age: 31, adresse: "Douala, Cameroun",       statut: "actif",       dateInscription: "2025-01-10" },
  { prenom: "Yvonne",       nom: "BEYEME",       tel: "32487654321",  indicatif: "32",  age: 28, adresse: "Liège, Belgique",         statut: "actif",       dateInscription: "2025-02-01" },
  { prenom: "Gilbert",      nom: "KAMDEM",       tel: "237670707070", indicatif: "237", age: 55, adresse: "Yaoundé, Cameroun",      statut: "actif",       dateInscription: "2025-03-05" },
  { prenom: "Bernadette",   nom: "FOUDA",        tel: "33754321098",  indicatif: "33",  age: 39, adresse: "Marseille, France",       statut: "actif",       dateInscription: "2025-04-01" },
  { prenom: "Serge",        nom: "TANKOUA",      tel: "237651808080", indicatif: "237", age: 33, adresse: "Garoua, Cameroun",        statut: "actif",       dateInscription: "2025-05-15" },
  { prenom: "Laure",        nom: "MVONDO",       tel: "441234567890", indicatif: "44",  age: 30, adresse: "Londres, Royaume-Uni",    statut: "actif",       dateInscription: "2025-07-20" },
  { prenom: "Christian",    nom: "NJIKE",        tel: "237622909090", indicatif: "237", age: 48, adresse: "Buea, Cameroun",          statut: "actif",       dateInscription: "2025-09-01" },
  { prenom: "Nadège",       nom: "MEBE",         tel: "351912345678", indicatif: "351", age: 26, adresse: "Lisbonne, Portugal",      statut: "actif",       dateInscription: "2025-10-10" },
  { prenom: "Blaise",       nom: "NTSAMA",       tel: "237693010101", indicatif: "237", age: 37, adresse: "Ebolowa, Cameroun",       statut: "en_attente",  dateInscription: "2026-04-28" },
  { prenom: "Véronique",    nom: "TSIMI",        tel: "237698020202", indicatif: "237", age: 44, adresse: "Douala, Cameroun",       statut: "en_attente",  dateInscription: "2026-05-03" },
]

// Mois de janvier à mai 2026
const MOIS = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]
const MONTANT = 5000

// Scénarios de paiement par membre (index 0-19)
// true = payé, false = en retard
const SCENARIOS = [
  [true,  true,  true,  true,  true ],  // 0  — Jean-Pierre : tout payé
  [true,  true,  true,  true,  false],  // 1  — Marie : avril en attente
  [true,  true,  true,  false, false],  // 2  — Paul : mars-mai non payés
  [true,  true,  true,  true,  true ],  // 3  — Sandrine : tout payé
  [true,  false, true,  true,  true ],  // 4  — Emmanuel : fév manquant
  [true,  true,  true,  true,  true ],  // 5  — Cécile : tout payé
  [true,  true,  false, true,  true ],  // 6  — Roger : mars manquant
  [true,  true,  true,  true,  false],  // 7  — Martine : mai en attente
  [true,  true,  true,  true,  true ],  // 8  — Hervé : tout payé
  [false, true,  true,  true,  true ],  // 9  — Françoise : janv manquant
  [true,  true,  true,  false, false],  // 10 — Didier : avril-mai non payés
  [true,  true,  true,  true,  true ],  // 11 — Yvonne : tout payé
  [true,  false, false, true,  true ],  // 12 — Gilbert : fév-mars manquants
  [true,  true,  true,  true,  false],  // 13 — Bernadette : mai en attente
  [true,  true,  true,  true,  true ],  // 14 — Serge : tout payé
  [true,  true,  false, false, false],  // 15 — Laure : mars-mai non payés
  [true,  true,  true,  true,  true ],  // 16 — Christian : tout payé
  [true,  true,  true,  false, true ],  // 17 — Nadège : avr manquant
  // membres en_attente → pas de cotisations
  [false, false, false, false, false],  // 18 — Blaise (en_attente)
  [false, false, false, false, false],  // 19 — Véronique (en_attente)
]

console.log("🌱 Seeding APSBEC…\n")

let cotisationCount = 0

for (let i = 0; i < membres.length; i++) {
  const m = membres[i]
  const id = randomUUID()

  const membre = {
    id,
    nom: m.nom,
    prenom: m.prenom,
    telephone: m.tel,
    age: m.age,
    adresse: m.adresse,
    statut: m.statut,
    dateInscription: new Date(m.dateInscription).toISOString(),
  }

  await write(`membres/${id}.json`, membre)
  console.log(`✅ Membre  ${m.prenom} ${m.nom} (${m.statut})`)

  // Cotisations selon scénario
  const scenario = SCENARIOS[i]
  for (let j = 0; j < MOIS.length; j++) {
    const mois = MOIS[j]

    // Un membre en_attente n'a pas encore de cotisations
    if (m.statut === "en_attente") continue

    // Vérifier que le membre existait ce mois-là
    const dateInscr = new Date(m.dateInscription)
    const [year, month] = mois.split("-").map(Number)
    const dateMois = new Date(year, month - 1, 1)
    if (dateMois < dateInscr) continue

    if (scenario[j]) {
      // Date de paiement : entre le 1er et le 10 du mois
      const jour = Math.floor(Math.random() * 10) + 1
      const datePaiement = new Date(year, month - 1, jour).toISOString()

      await write(`cotisations/${id}/${mois}.json`, {
        id: randomUUID(),
        membreId: id,
        telephone: m.tel,
        mois,
        montant: MONTANT,
        datePaiement,
        note: undefined,
      })
      cotisationCount++
    }
  }
}

console.log(`\n📊 Résumé :`)
console.log(`   👥 ${membres.length} membres créés`)
console.log(`   💰 ${cotisationCount} cotisations enregistrées`)
console.log(`   📅 Période : janvier → mai 2026`)
console.log(`   💵 Montant : 5 000 FCFA / mois`)
console.log(`\n✅ Seed terminé ! Lancez : npm run dev`)
