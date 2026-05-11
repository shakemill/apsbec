# APSBEC — Gestion des membres & cotisations

Application PWA Next.js pour la gestion des membres, cotisations mensuelles et abonnements annuels du club **APSBEC**, hébergée sur [apsbec.org](https://apsbec.org).

## Fonctionnalités

- 👤 **Espace membre** — consultation du solde, arrérés par mois, abonnement annuel
- 📝 **Inscription en ligne** — validation par l'admin
- 🔐 **Espace admin** protégé par code
  - Gestion des membres (ajout, modification, suspension, validation)
  - Saisie des cotisations : en lot, rattrapage, paiement partiel
  - Abonnements annuels
  - Rapports WhatsApp (mensuel + annuel)
  - Configuration du club (montants, devise, code admin)
- 📱 **PWA installable** sur Android & iOS
- 🌗 **Thème clair / sombre** persistant

## Stack technique

| Technologie | Usage |
|---|---|
| Next.js 16 (App Router) | Framework fullstack |
| TypeScript | Typage |
| Tailwind CSS v4 | Styles |
| Vercel Blob | Stockage JSON (production) |
| Système fichiers local | Stockage JSON (développement) |
| bcryptjs | Hachage du code admin |

---

## Développement local

### 1. Cloner et installer

```bash
git clone https://github.com/shakemill/apsbec.git
cd apsbec
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env.local
```

En développement, **pas besoin de Vercel Blob** : si `BLOB_READ_WRITE_TOKEN` est absent ou vaut `your_blob_token_here`, l'app utilise le répertoire `/data/` local automatiquement.

Éditez `.env.local` :

```env
BLOB_READ_WRITE_TOKEN=your_blob_token_here   # laisser tel quel pour le mode local
SESSION_SECRET=dev_secret_local
ADMIN_CODE_INIT=APSBEC2024
```

### 3. Seeder les données de test (optionnel)

```bash
node scripts/seed.mjs
```

Crée 20 membres avec des cotisations de janvier à mai 2026.

### 4. Lancer

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

| URL | Description |
|---|---|
| `/` | Page d'accueil |
| `/membre` | Espace membre (saisir son numéro) |
| `/inscription` | Formulaire d'inscription |
| `/admin` | Login admin (code : `APSBEC2024`) |

---

## Déploiement sur Vercel

### 1. Créer un Vercel Blob Store

1. Aller sur [vercel.com](https://vercel.com) → votre projet → **Storage**
2. Créer un store **Blob**
3. Récupérer le `BLOB_READ_WRITE_TOKEN`

### 2. Connecter le dépôt GitHub

```bash
# Ajouter le remote si ce n'est pas fait
git remote add origin https://github.com/shakemill/apsbec.git
git push -u origin main
```

Puis dans le dashboard Vercel : **New Project** → importer `shakemill/apsbec`.

### 3. Variables d'environnement Vercel

Dans **Settings → Environment Variables**, ajouter :

| Variable | Valeur |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Token copié depuis votre Blob store |
| `SESSION_SECRET` | Chaîne aléatoire (`openssl rand -base64 32`) |
| `ADMIN_CODE_INIT` | Code admin initial (ex: `APSBEC2024`) |

### 4. Déployer

Vercel déclenche un build automatiquement à chaque `git push` sur `main`.

### 5. Premier lancement en production

1. Aller sur `https://votre-domaine.vercel.app/admin`
2. Se connecter avec `ADMIN_CODE_INIT`
3. Aller dans **Configuration** → changer le code admin
4. Configurer les montants de cotisation et d'abonnement

---

## Structure du projet

```
src/
├── app/
│   ├── admin/          # Pages admin (dashboard, membres, cotisations, rapport, config)
│   ├── api/            # Routes API (membres, cotisations, abonnements, auth, config)
│   ├── inscription/    # Formulaire d'inscription public
│   ├── membre/         # Espace membre
│   └── globals.css     # Design system (dark/light theme)
├── components/
│   ├── admin/          # Composants admin (SaisieCotisations, RapportWhatsApp…)
│   ├── ui/             # Composants UI génériques (Button, Card, Combobox…)
│   └── ThemeToggle.tsx # Bascule thème clair/sombre
├── lib/
│   ├── blob.ts         # CRUD (abstraction Blob / local)
│   ├── storage.ts      # Couche stockage (Vercel Blob ↔ fichiers locaux)
│   ├── auth.ts         # Authentification admin
│   ├── rapport.ts      # Génération rapports WhatsApp
│   └── utils.ts        # Utilitaires (formatDate, formatMontant…)
└── types/              # Types TypeScript partagés
```

---

## Licence

Usage privé — Club APSBEC
