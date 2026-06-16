# MyFinance — Project Log

## Stack
- Next.js 16 App Router + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (radix-nova, cssVariables)
- Zustand v5 — **cache client uniquement** (le middleware `persist`/localStorage a été retiré en 6.3 ; la source de vérité est Postgres)
- next-themes (defaultTheme system, attribute="class")
- recharts
- lucide-react
- IBM Plex Sans (Google Fonts)

## Avancement par étape
- [x] Étape 1 — Scaffold + design system + layout/sidebar/topbar
- [x] Étape 2 — Types + store + seed
- [x] Étape 3 — Composants réutilisables
- [x] Étape 4 — Pages
- [x] Étape 5 — Customisation/i18n/backup/print
  - [x] i18n complet (next-intl v4.13.0)
  - [x] backup/restore + reset, date-range fonctionnel, budget dans prefs, prefs (devise/langue/thème/nom/budget) éditables et persistées en BDD — cf. section « Customisation, sauvegarde & rapports »
- [x] Étape 6 — Migration multi-utilisateurs (localStorage → PostgreSQL + Prisma + Better Auth)
  - [x] 6.1 — Base de données (Prisma + Postgres : schéma, migration `init`, client) — cf. section « Base de données »
  - [x] 6.2 — Better Auth (email+password, /login + /register, proxy de protection, seed catégories + prefs par utilisateur) — cf. section « Auth »
  - [x] 6.3 — Migration des pages : Server Actions CRUD par-utilisateur, hydratation du cache Zustand depuis le serveur, suppression de `persist`, catégories custom — cf. section « Données par-utilisateur »

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `app/layout.tsx` | Layout racine : ThemeProvider, TooltipProvider, IBM Plex Sans |
| `app/page.tsx` | Redirect → /dashboard |
| `app/(app)/layout.tsx` | Shell app : SidebarProvider + AppSidebar + Topbar |
| `app/(app)/dashboard/page.tsx` | Dashboard : 4 StatCards, IncomeVsExpensesChart (toggle **mois/année**), SpendingDonut, Recent Transactions, Savings Goals preview, Add Income/Expense dialogs, **Date Range fonctionnel** (presets : tout / ce mois / 3 mois / 6 mois / cette année / l'an dernier — filtre réel sur tous les widgets) |
| `app/(app)/income/page.tsx` | Income : 4 StatCards, search + month filter, DataTable (date/source/category badge/amount/notes), Add/Edit/Delete dialog |
| `app/(app)/expenses/page.tsx` | Expenses : 4 StatCards (budget used %), search + month filter, DataTable (date/description/category/amount rouge/status badge), Add/Edit/Delete dialog |
| `app/(app)/savings-goals/page.tsx` | Savings Goals : grille 2 col (icône/nom/date/montants/ProgressBar), carte Total Target Remaining, Add/Edit/Delete goal dialog |
| `app/(app)/monthly-report/page.tsx` | Monthly Report : 4 StatCards, SavingsBarChart, ExpenseDistributionPie, tableau Month-by-Month, export CSV, Print |
| `app/(app)/categories/page.tsx` | Categories : 2 colonnes SectionCard (Income / Expenses by Category) avec CategoryRow + pourcentages |
| `app/(app)/settings/page.tsx` | Settings **fonctionnel** : Profile (displayName), Currency (16 devises), Theme, Language, **Monthly Budget**, Backup/Restore (`BackupRestore`), Demo Data. Tout écrit en BDD via `usePrefs`/Server Actions et met l'UI à jour immédiatement. **Logo + Avatar retirés** (demande explicite) |
| `app/globals.css` | Design tokens CSS (clair + sombre), utilitaires .text-income/.text-expense/.text-brand-gold |
| `components/layout/sidebar.tsx` | Sidebar forêt-verte, shadcn Sidebar primitives, collapsible="icon" |
| `components/layout/topbar.tsx` | Topbar sticky : titre page, langue, thème, impression, **export CSV fonctionnel** (ledger revenus+dépenses de l'utilisateur courant via `lib/csv`) |
| `app/actions/backup.ts` | Server Actions backup : `exportUserData` (snapshot complet → JSON/PDF), `restoreUserData` (upload validé zod → remplace les données de l'utilisateur en une transaction Prisma, jamais un autre user), `resetUserData` (retour à l'état seed) |
| `lib/csv.ts` | Helpers CSV partagés : `toCsv`/`downloadCsv` (échappement + BOM UTF-8), `triggerDownload`, `todayStamp`. Utilisés par la topbar et le Monthly Report |
| `lib/pdf-report.ts` | Builder PDF client (jsPDF + jspdf-autotable) : rapport multi-pages (résumé KPI, détail mois par mois, tables revenus/dépenses/objectifs, pagination auto). Argent formaté `CODE 1 234,56` (glyphes sûrs) |
| `hooks/use-prefs.ts` | Hook `usePrefs()` : édition optimiste des prefs (devise/langue/thème/nom/budget) → cache Zustand immédiat + persistance BDD via Server Action `updatePrefs`. `changeTheme` pousse aussi next-themes |
| `components/providers/theme-sync.tsx` | `ThemeSync` : aligne next-themes sur `prefs.theme` (source de vérité BDD) à l'hydratation et après un restore. DB-side only (pas de boucle) |
| `components/settings/backup-restore.tsx` | UI Backup/Restore : Export JSON, Export PDF, Import (FileReader → restore), Reset (confirmations natives, ré-hydrate le cache) |
| `components/shared/page-placeholder.tsx` | Carte "under construction" générique |
| `components/ui/*` | Composants shadcn installés : avatar, button, dropdown-menu, input, separator, sheet, sidebar, skeleton, tooltip |
| `hooks/use-mobile.ts` | Hook détection mobile (généré par shadcn) |
| `lib/utils.ts` | cn() helper (shadcn) |
| `lib/seed.ts` | Données de démarrage réalistes (18 revenus, ~98 dépenses, 4 objectifs) |
| `lib/selectors.ts` | Fonctions pures de calcul (totalIncome, netSavings, monthlyBreakdown…) |
| `lib/format.ts` | formatCurrency, formatDate |
| `store/useFinanceStore.ts` | Store Zustand = **cache client** (incomes, expenses, savingsGoals, **incomeCategories**, **expenseCategories**, prefs, **`hydrated`**) + `hydrate()` + mutateurs de cache. Plus de `persist`, plus de seed initial (démarre vide) |
| `types/index.ts` | Types TS : Income, Expense, SavingsGoal, IncomeCategory, ExpenseCategory, UserPrefs, MonthlyBreakdown, ChartDataPoint, NavItem… |
| `lib/icon-map.ts` | Mapping string→ElementType pour les icônes lucide (catégories, objectifs) |
| `components/shared/stat-card.tsx` | Carte KPI : label + valeur + icône + badge optionnel (positive/negative/neutral) |
| `components/shared/page-header.tsx` | En-tête de page : titre + sous-titre + slot actions à droite |
| `components/shared/data-table.tsx` | Table générique typée shadcn : colonnes configurables, boutons edit/delete |
| `components/shared/section-card.tsx` | Carte blanche rounded-2xl : titre + lien "View all" optionnel + slot enfants |
| `components/shared/progress-bar.tsx` | Barre de progression orange-gold avec % et montant restant |
| `components/shared/add-edit-dialog.tsx` | Modale générique shadcn : titre + slot champs + Cancel/Save (avec état isSaving) |
| `components/shared/category-row.tsx` | Ligne catégorie : icône + nom + N records + montant + % optionnel |
| `components/shared/charts/income-vs-expenses-chart.tsx` | Area chart recharts 2 séries (income vert / expenses rouge), tooltips thémés |
| `components/shared/charts/spending-donut.tsx` | Donut recharts par catégorie avec légende custom à droite |
| `components/shared/charts/savings-bar-chart.tsx` | Bar chart recharts net savings 6 mois (barres vert forêt) |
| `components/shared/charts/expense-distribution-pie.tsx` | Pie chart recharts distribution dépenses, légende verticale droite |
| `components/ui/table.tsx` | Composant shadcn Table (installé étape 3) |
| `components/ui/dialog.tsx` | Composant shadcn Dialog (installé étape 3) |
| `components/ui/badge.tsx` | Composant shadcn Badge (installé étape 3) |
| `prisma/schema.prisma` | Schéma Prisma : User, Income, Expense, SavingsGoal, Category, UserPrefs + enums |
| `prisma.config.ts` | Config Prisma 7 : chemin schéma + `datasource.url = process.env.DATABASE_URL` (charge `.env` via dotenv) |
| `prisma/migrations/` | Migrations SQL versionnées (source de vérité prod, pas de `db push`) |
| `lib/prisma.ts` | Singleton PrismaClient (global hot-reload) via driver adapter `@prisma/adapter-pg` |
| `generated/` | Client Prisma généré (gitignored — régénéré par `postinstall`/`build`) |
| `.env.example` | Variables d'env committées (DATABASE_URL + Better Auth + OAuth optionnel) |
| `.env` | Variables locales (gitignored) |
| `lib/auth.ts` | Instance Better Auth serveur : adapter Prisma (Postgres), email+password, social providers conditionnels, hook `user.create.after` (seed), plugin `nextCookies` |
| `lib/auth-client.ts` | Client Better Auth navigateur (`better-auth/react`) : `signIn`/`signUp`/`signOut`/`useSession` |
| `lib/user-seed.ts` | `seedDefaultsForUser` (catégories défaut + UserPrefs au signup) et `loadDemoDataForUser` (jeu de démo seed.ts, idempotent) |
| `app/api/auth/[...all]/route.ts` | Route handler catch-all Better Auth (`toNextJsHandler`) |
| `proxy.ts` | **Next 16** (ex-`middleware.ts`) : redirige vers /login sans cookie de session (matcher = routes (app)) |
| `app/(auth)/layout.tsx` | Shell public centré pour les écrans d'auth (I18nProvider) |
| `app/(auth)/login/page.tsx` | Server Component : redirige si déjà connecté, rend `LoginForm` |
| `app/(auth)/register/page.tsx` | Server Component : redirige si déjà connecté, rend `RegisterForm` |
| `components/auth/auth-card.tsx` | Carte + champ labellisé partagés par les 2 formulaires d'auth |
| `components/auth/login-form.tsx` | Formulaire client login (`signIn.email`) |
| `components/auth/register-form.tsx` | Formulaire client inscription (`signUp.email`) |
| `components/layout/user-menu.tsx` | Footer sidebar : utilisateur connecté (`useSession`) + Logout |
| `components/settings/demo-data-button.tsx` | Bouton client « Charger des données de démo » (appelle la server action) |
| `app/(app)/settings/actions.ts` | Server action `loadDemoDataAction` : re-vérifie la session, seed démo, **retourne le snapshot frais** (le bouton ré-hydrate le cache) |
| `lib/data.ts` | **`getUserData()`** (Server) : dérive le `userId` de la session, charge toutes les entités de l'utilisateur via Prisma, renvoie un `FinanceSnapshot` sérialisé. Point d'entrée unique, appelé une fois dans `app/(app)/layout.tsx` |
| `lib/serialize.ts` | Sérialiseurs purs de la frontière API : `Decimal`→`number`, `Date`→`"YYYY-MM-DD"`. Partagés par `lib/data.ts` (bulk) et les Server Actions (ligne unique) |
| `app/actions/_session.ts` | `requireUserId()` : session Better Auth → `userId` (throw si non authentifié). Appelé par chaque action |
| `app/actions/{incomes,expenses,goals,categories,prefs}.ts` | Server Actions CRUD, **validation zod**, scoping strict par `userId` (`updateMany`/`deleteMany {id,userId}`), retournent l'entité sérialisée (ou `{ok}`) |
| `components/providers/store-hydrator.tsx` | Client : hydrate le cache Zustand depuis les données serveur dans un `useEffect` (jamais au rendu : store partagé côté serveur + parité SSR/1er rendu client) |
| `components/shared/page-loading.tsx` | Skeleton générique affiché tant que `!hydrated` (header + stat cards + contenu) |

## Conventions clés
- Aucun composant ne lit localStorage directement (toujours vrai). **La source a changé : Zustand-persist → serveur (Postgres).** Seul next-themes garde son propre localStorage pour le thème (autorisé).
- **Écritures = Server Actions** (`app/actions/*`) ; le store n'est plus qu'un cache rafraîchi avec la valeur retournée par l'action. `userId` toujours dérivé de la session, jamais du client.
- Catégories income/expense = lues depuis la DB (`incomeCategories`/`expenseCategories` du store), plus de liste codée en dur dans les selects/dialogs.
- Tokens couleur dans `globals.css` (vars CSS oklch, clair + sombre)
- Chiffres de référence (seed) : revenus 6 mois = $39 590, dépenses = $15 855, net = $23 735, savings rate ≈ 60%
  - Breakdown par mois : Oct $6 500/$2 605 | Nov $6 350/$2 850 | Déc $6 630/$2 640 | Jan $6 800/$2 705 | Fév $6 770/$2 650 | Mar $6 540/$2 405
- Maquettes de référence : `/public/design/1.png` à `9.png`
- IDs seed : préfixe `i` (incomes), `e` (expenses), `g` (goals)
- Catégories income : Salary | Freelance | Investment | Bonus | Other
- Catégories expense : Housing | Food & Dining | Transport | Utilities | Entertainment | Healthcare | Shopping | Other
- Icons SavingsGoal stockés comme string (nom lucide), mappés en composant dans l'UI

## Routes (étape 4)

| Route | Page | Statut |
|---|---|---|
| `/dashboard` | Dashboard | ✅ |
| `/income` | Income | ✅ |
| `/expenses` | Expenses | ✅ |
| `/savings-goals` | Savings Goals | ✅ |
| `/monthly-report` | Monthly Report | ✅ |
| `/categories` | Categories | ✅ |
| `/settings` | Settings (placeholder structuré) | ✅ |

## Corrections console/hydration

| Erreur | Cause | Correctif |
|---|---|---|
| `Encountered a script tag while rendering React component` (layout.tsx:28) | Conséquence du mismatch ci-dessous : React régénérait l'arbre depuis la racine, forçant le `<script>` de `ThemeProvider` à être rendu côté client | Corrigé implicitement par le fix ci-dessous |
| `Hydration failed` — `Sun` vs `Monitor` dans `ThemeIcon` (topbar.tsx:108) | `useTheme()` retourne `undefined` côté serveur → fallback `"system"` → `Monitor` ; après hydratation, le thème lu depuis localStorage donne `Sun` ou `Moon` | Guard de montage dans `Topbar` : `useState(false)` + `useEffect setMounted(true)` → avant montage, `ThemeIcon` est toujours `Monitor` comme côté serveur |

## i18n (next-intl v4.13.0)

| Élément | Détail |
|---|---|
| Lib | `next-intl` v4.13.0 |
| Fichiers messages | `messages/{en,fr,es,it,zh,ja,hi,sw,ki}.json` — namespaces : common, sidebar, topbar, nav, dashboard, income, expenses, savingsGoals, monthlyReport, categories, settings, **login**, **register** (auth ajoutés en 6.2) |
| Traductions complètes | EN + FR |
| Fallback EN | ES, IT, ZH, JA, HI (contenu EN, à traduire) |
| Provider | `components/providers/i18n-provider.tsx` — client component, mounted guard pour éviter le mismatch hydration, locale depuis `useFinanceStore().prefs.language` |
| Hook | `useTranslations(namespace)` dans chaque page/composant — sidebar, topbar, toutes les 7 pages, add-edit-dialog |
| Source de vérité | `prefs.language` (Zustand persist) — sélecteur topbar ET settings pilotent la même valeur |
| Données non traduites | Catégories (Salary/Housing/…), noms de sources/descriptions saisies par l'utilisateur |
| Données traduites | Tous les libellés UI : badges Paid/Pending, Positive/Negative, titres, en-têtes, boutons, labels de formulaire |

## Notes / décisions
- `store/ui-store.ts` supprimé à l'étape 2 : la langue est désormais dans `useFinanceStore().prefs.language`
- `topbar.tsx` mis à jour pour utiliser `useFinanceStore` (plus `useUIStore`)
- Les types `IncomeCategory` / `ExpenseCategory` sont des agrégats calculés par `selectors.ts`, non stockés
- `monthlyBreakdown` retourne les 6 derniers mois triés chronologiquement avec `yearMonth` pour le tri
- Charts recharts : utiliser `TooltipContentProps` (sans generics) + `content={ComponentRef}` (pas `content={<JSX />}`) — contrainte recharts v3
- Couleurs charts : CSS vars `var(--income)`, `var(--expense)`, `var(--sidebar)`, `var(--chart-1..5)` directement dans SVG fill/stroke
- Pour les pie/donut : le caller fournit `color: string` par slice (hex recommandé pour compatibilité SVG maximale)
- Étape 4 — Écarts visuels (corrigés en étape 5) :
  - ✅ Dashboard : bouton "Date Range" **fonctionnel** (presets, filtre réel sur tous les widgets) — voir section « Customisation, sauvegarde & rapports »
  - ✅ Expenses : `MONTHLY_BUDGET` codé en dur **remplacé** par `prefs.monthlyBudget` (éditable dans Settings, utilisé dans « Budget Used % »)
  - ✅ Settings : sections **fonctionnelles** (plus de placeholders) ; Logo + Avatar retirés
  - `formatPercent` affiche 1 décimale (ex. "60.0%") — conforme à la maquette
  - Tailwind warnings `sm:w-[180px]` → `sm:w-45` et `max-w-[200px]` → `max-w-50` appliqués (Tailwind v4)

## Base de données (étape 6.1)

Migration de localStorage (Zustand persist) vers **PostgreSQL + Prisma**, en mode **multi-utilisateurs** : chaque donnée financière appartient à un `userId`. Cette sous-étape ne fait QUE la base — pas encore d'auth (6.2), pas encore de migration des pages (6.3). Le store Zustand et `lib/seed.ts` sont **intacts** (`seed.ts` deviendra la source du seed par-utilisateur).

### Stack DB
- Prisma **7.8.0** + `@prisma/client` 7.8.0
- Generator `prisma-client` (Prisma 7, ESM) → sortie `/generated` (gitignored, regénérée)
- Driver adapter **`@prisma/adapter-pg`** + `pg` (workflow SQL Prisma 7, requis au runtime)
- `dotenv` (devDep) : charge `.env` dans `prisma.config.ts`

### Modèles (dérivés de `types/index.ts` + `lib/seed.ts`)

| Modèle | Champs | Notes |
|---|---|---|
| `User` (`@@map("user")`) | id, createdAt, updatedAt + relations | **Minimal** : ancre des FK. Better Auth complètera ce modèle et ajoutera Session/Account/Verification en 6.2 |
| `Income` | date (Date), source, category (String), amount (Decimal 12,2), notes?, userId | `category` = nom de catégorie (String) |
| `Expense` | date (Date), description, category (String), amount (Decimal 12,2), status (enum `ExpenseStatus`=Paid/Pending, défaut Paid), userId | |
| `SavingsGoal` | name, icon (nom lucide String), saved (Decimal), target (Decimal), targetDate (Date), userId | |
| `Category` | id, name, icon, type (enum `CategoryType`=income/expense), isDefault (bool), userId | **Table unique** discriminée par `type` (≠ 2 tables). Défauts seedés par utilisateur en 6.2 ; `isDefault` les marque. Contrainte `@@unique([userId, type, name])` |
| `UserPrefs` | currency, language, theme, displayName, logoUrl?, avatarUrl?, **monthlyBudget** (Decimal défaut **3500**), userId @unique | Relation **1-1** avec User. `monthlyBudget` **remplace** le `MONTHLY_BUDGET` codé en dur à $3 500 |

### Relations & contraintes
- Toutes les tables financières (Income, Expense, SavingsGoal, Category, UserPrefs) → FK `userId` vers `User`, **`onDelete: Cascade`**, **index sur `userId`** (`UserPrefs` : index implicite via `@unique`).
- Enums Postgres : `CategoryType` (income|expense), `ExpenseStatus` (Paid|Pending).
- **Argent en `Decimal(12,2)`** (pas Float) → en 6.3, convertir en `number` à la frontière API (les types TS app utilisent `number`).
- **Dates** `date`/`targetDate` en `@db.Date` (date seule ; étaient des strings "YYYY-MM-DD").

### Connexion — env-only (local vs prod)
- Prisma 7 **n'accepte plus `url` dans le bloc datasource** du schéma → l'URL vit dans **`prisma.config.ts`** : `datasource.url = process.env.DATABASE_URL` (`.env` chargé via `dotenv`). Aucune valeur en dur. On lit `process.env` directement (pas le helper `env()` qui lève une erreur si absent) pour que `prisma generate` — qui n'a pas besoin de la DB — ne plante jamais au `postinstall`/`build` sans `DATABASE_URL` ; seules les commandes `migrate` exigent l'URL.
- **Local** : `.env` (gitignored) → `DATABASE_URL=postgresql://devlin@localhost:5432/myfinance?schema=public`. `.env.example` (committé) documente DATABASE_URL + variables Better Auth (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, à remplir en 6.2).
- **Prod (VPS/Coolify)** : `.env` géré sur le serveur, injecté à l'environnement. **Migrations Prisma uniquement** (`prisma migrate deploy`), **jamais `db push`**.
- `/generated` étant gitignored : le client est régénéré au déploiement via `postinstall: prisma generate` + `build: prisma generate && next build` (Coolify doit exposer `DATABASE_URL` au build).
- **Node ≥ 22.12 obligatoire au build** : Prisma 7 (`^20.19 || ^22.12 || >=24`), Next 16 (`>=20.9`) et Tailwind oxide (`>=20`) refusent Node 18. Le build Nixpacks/Coolify partait sur Node 18 → `npm install` échouait (preinstall Prisma). Corrigé dans le repo : `engines.node = ">=22.12.0"` (package.json) + **`.nvmrc` = `22`**. Fallback si non pris en compte : variable `NIXPACKS_NODE_VERSION=22` côté Coolify.
- Warning Docker bénin au build : `SecretsUsedInArgOrEnv` pour les env vars Coolify injectées en ENV (ex. `BETTER_AUTH_URL`) — n'empêche pas le déploiement ; marquer `DATABASE_URL`/`BETTER_AUTH_SECRET` en secrets runtime côté Coolify.

### Migrations
- Emplacement : **`prisma/migrations/`** (versionné, source de vérité).
- Première migration : `20260614232234_init` (créée par `prisma migrate dev --name init`) — 7 tables, 2 enums, 5 FK cascade, index `userId`.
- Vérifié : connexion OK, tables/enums/FK/index présents, `tsc --noEmit` clean.

### Fichiers ajoutés
`prisma/schema.prisma`, `prisma.config.ts`, `prisma/migrations/`, `lib/prisma.ts` (singleton global + adapter pg), `.env.example`, `.env` (local), `/generated` (gitignored). `.gitignore` : `!.env.example` + `/generated`.

## Auth (étape 6.2)

Authentification **multi-utilisateurs e-mail + mot de passe** via **Better Auth 1.6.18**, comptes isolés. Réutilise la base Postgres/Prisma de 6.1 (aucune nouvelle base, aucun fallback). Better Auth gère le hachage des mots de passe (jamais en clair) ; aucun secret en dur ; `.env` gitignoré.

### Briques
| Brique | Détail |
|---|---|
| Lib serveur | `lib/auth.ts` — `betterAuth()` : `prismaAdapter(prisma, { provider: "postgresql" })`, `emailAndPassword.enabled`, hook `databaseHooks.user.create.after` (seed), plugin `nextCookies()` **en dernier** |
| Lib client | `lib/auth-client.ts` — `createAuthClient()` depuis `better-auth/react` ; exporte `signIn/signUp/signOut/useSession` |
| Route API | `app/api/auth/[...all]/route.ts` — `export const { GET, POST } = toNextJsHandler(auth)` |
| Protection | `proxy.ts` — **Next 16 : `middleware` est renommé `proxy`** (runtime Node par défaut). Check optimiste `getSessionCookie` ; pas de cookie → redirect `/login`. `matcher` = `/` + toutes les routes (app). `/login`, `/register`, `/api`, assets non matchés |
| Pages | `app/(auth)/{login,register}/page.tsx` (Server Components : redirect `/dashboard` si déjà connecté) + formulaires clients `components/auth/{login,register}-form.tsx` + `auth-card.tsx`. Design cohérent (tokens, thème clair/sombre, responsive) |
| Sidebar | Footer = `components/layout/user-menu.tsx` : `useSession()` → nom/avatar (fallback prefs) + **Logout** (`signOut` → `/login`) |

### Providers sociaux
Ajoutés **uniquement si** les credentials existent dans `.env` (`GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`). Aucun configuré aujourd'hui → **email + password seulement**. `.env.example` documente ces variables (commentées).

### Flux d'inscription + seed par-utilisateur
- Hook Better Auth `user.create.after` → `seedDefaultsForUser(user.id, user.name)` (`lib/user-seed.ts`) : crée les **catégories par défaut** (income : Salary/Freelance/Investment/Bonus/Other ; expense : Housing/Food & Dining/Transport/Utilities/Entertainment/Healthcare/Shopping/Other, `isDefault=true`, icônes alignées sur `selectors.ts`) + **UserPrefs** (`currency USD`, `language en`, `theme system`, `monthlyBudget 3500`, `displayName = user.name`).
- **Compte vierge** : les 18 revenus / 98 dépenses de démo **ne sont pas** seedés. À la place, bouton **« Charger des données de démo »** dans Settings (`components/settings/demo-data-button.tsx`) → server action `app/(app)/settings/actions.ts` → `loadDemoDataForUser` (re-vérifie la session ; vide puis réinsère les données de `lib/seed.ts` pour l'utilisateur courant — idempotent).
- ⚠️ Étape 6.3 non faite : les pages lisent encore Zustand/localStorage. Les données seedées vivent en DB et seront branchées à l'UI en 6.3.

### Réconciliation du schéma — **un seul modèle User**
- Schéma généré par **`npx @better-auth/cli generate`** (PAS `npx auth migrate`) : merge propre dans le `User` existant (ajout `name/email/emailVerified/image` + relations `sessions/accounts`, conservation des relations financières + `@@map("user")`) ; nouvelles tables `Session/Account/Verification`.
- Vérifié : **1 seul `model User`** (mappé `user`). Les 5 modèles financiers (Income, Expense, SavingsGoal, Category, UserPrefs) + Session/Account pointent sur `User.id`, `onDelete: Cascade`. Pas de table user en double.

### Migration appliquée
- `prisma migrate dev` est interactif (refuse l'environnement non-interactif à cause du warning unique `email`). Workflow non-interactif utilisé :
  1. `npx @better-auth/cli generate --y` (réécrit `schema.prisma`),
  2. réconciliation manuelle du `model User`,
  3. `npx prisma migrate diff --from-schema <avant> --to-schema schema.prisma --script -o .../migration.sql` (flags Prisma 7 : `--from-schema`/`--to-schema`),
  4. `npx prisma migrate deploy` + `npx prisma generate`.
- Migration créée : `20260615041411_better_auth` (ALTER `user` +4 colonnes ; tables `session`/`account`/`verification` ; index ; FK cascade ; unique `user.email`).
- Vérifié : `tsc --noEmit` clean, `next build` OK (`/login` `/register` `/api/auth/[...all]` dynamiques, `ƒ Proxy` actif).

### Variables `.env`
- `BETTER_AUTH_SECRET` — généré par `openssl rand -base64 32` (≥ 32 car.). Réel uniquement dans `.env` (local) / l'hôte (prod), jamais committé.
- `BETTER_AUTH_URL` — `http://localhost:3000` en local. **Prod (Coolify/VPS) : doit pointer sur le vrai domaine** (ex. `https://myfinance.example.com`).
- `.env.example` : `BETTER_AUTH_SECRET=""`, `BETTER_AUTH_URL`, + variables OAuth commentées.

### Fichiers ajoutés (6.2)
`lib/auth.ts`, `lib/auth-client.ts`, `lib/user-seed.ts`, `app/api/auth/[...all]/route.ts`, `proxy.ts`, `app/(auth)/layout.tsx`, `app/(auth)/{login,register}/page.tsx`, `components/auth/{auth-card,login-form,register-form}.tsx`, `components/layout/user-menu.tsx`, `components/settings/demo-data-button.tsx`, `app/(app)/settings/actions.ts`, `prisma/migrations/20260615041411_better_auth/`. Modifiés : `prisma/schema.prisma`, `app/(app)/settings/page.tsx`, `components/layout/sidebar.tsx`, `messages/*.json` (namespaces `login`/`register` + clés `common.logout`, `settings.demo*`), `.env`, `.env.example`, `package.json` (dép. `better-auth`).

## Données par-utilisateur (étape 6.3)

Remplacement de localStorage (Zustand-persist) par des **données serveur PAR UTILISATEUR**, sans casser le design, les selectors ni l'i18n. Approche **la moins destructive** : Zustand reste, mais devient un **cache client** ; la source de vérité est Postgres ; `lib/selectors.ts` est **inchangé** (fonctions pures, on leur passe les données chargées).

### Nouveau flux de données (pattern réutilisable)
1. **Chargement initial (Server Component)** — `app/(app)/layout.tsx` est `async` et appelle **`getUserData()`** (`lib/data.ts`) une seule fois par requête : session Better Auth → `userId` → charge incomes/expenses/goals/categories/prefs via Prisma → renvoie un `FinanceSnapshot` **sérialisé** (`Decimal`→`number`, `Date`→`"YYYY-MM-DD"`, cf. `lib/serialize.ts`). Les pages n'interrogent jamais Prisma directement.
2. **Hydratation du cache** — le snapshot est passé à **`StoreHydrator`** (client), qui appelle `useFinanceStore.hydrate(data)` dans un **`useEffect`** (jamais au rendu : le store module-level est partagé entre requêtes côté serveur, et le 1er rendu client doit matcher le SSR). `hydrated` passe à `true`.
3. **Écritures** — chaque page/dialog appelle une **Server Action** (`app/actions/*`) qui valide (zod), dérive le `userId` de la session, mute uniquement les lignes de cet utilisateur (`updateMany`/`deleteMany` sur `{id, userId}`), et **retourne l'entité sérialisée**. Le handler met ensuite à jour le **cache Zustand** avec la valeur retournée (add/update/delete). Pas de `revalidatePath` : la source rafraîchie est le cache client (un revalidate écraserait l'état optimiste et le layout ne re-tourne pas en navigation client de toute façon). Un rechargement complet re-passe par `getUserData` → état frais.
4. **États loading/erreur** — tant que `!hydrated`, chaque page rend `<PageLoading />` (skeleton). Les handlers de dialog gèrent `isSaving` + un message d'erreur (`common.errorGeneric`) en cas d'échec d'action.

### Server Actions (`app/actions/`)
| Fichier | Actions | Notes |
|---|---|---|
| `_session.ts` | `requireUserId()` | session → userId, throw si absent |
| `incomes.ts` | `createIncome` / `updateIncome` / `deleteIncome` | zod `{date,source,category,amount,notes?}` |
| `expenses.ts` | `createExpense` / `updateExpense` / `deleteExpense` | zod + `status` enum Paid/Pending |
| `goals.ts` | `createGoal` / `updateGoal` / `deleteGoal` | zod `{name,icon,saved,target>0,targetDate}` |
| `categories.ts` | `createCategory` / `deleteCategory` | rejette les doublons (`@@unique[userId,type,name]`) |
| `prefs.ts` | `updatePrefs` | partial, `upsert` UserPrefs |

### Catégories custom (demande explicite)
- Ajout **et** suppression de catégories income **et** expense par l'utilisateur, dans la page **Categories** (bouton « Ajouter » par carte + icône poubelle par ligne, via `CategoryRow.onDelete`). Sélecteur d'icône (liste alignée sur `lib/icon-map.ts`).
- Les `<select>` de catégorie des dialogs Income/Expense (pages Income, Expenses, Dashboard) lisent désormais `incomeCategories`/`expenseCategories` **depuis la DB**, plus de liste codée en dur.
- Supprimer une catégorie n'orpheline pas les données : `category` reste une String sur les transactions existantes. Les types `IncomeCategoryName`/`ExpenseCategoryName` ont reçu `| (string & {})` → catégories arbitraires acceptées **sans toucher `selectors.ts`**.
- `prefs.monthlyBudget` (DB) **remplace** le `MONTHLY_BUDGET` codé en dur ($3 500) de la page Expenses.

### Suppression de localStorage
- `persist` retiré de `store/useFinanceStore.ts` (la clé `"myfinance"` n'est plus écrite). Le store démarre **vide** + `hydrated:false`.
- Vérifié : `grep localStorage` ne renvoie **aucune** lecture/écriture applicative ; seul next-themes conserve la sienne pour le thème (autorisé).

### Hydration / SSR
- 1er rendu (SSR + 1er rendu client) : store vide → skeletons **identiques** des deux côtés → pas de mismatch. Après montage, l'effet hydrate et bascule sur les vraies données + la langue DB (le guard `mounted` de `i18n-provider` couvre déjà la transition `en`→langue).

### Vérifié
- `tsc --noEmit` clean ; `next build` OK (7 pages `(app)` → `ƒ` dynamiques car session, Proxy actif).
- Smoke-test runtime (dev) : `/login` 200 ; `/dashboard` sans cookie → 307 `/login` ; sign-up → hook seed (catégories+prefs) ; les **7 pages** renvoient 200 avec session (sérialisation `Decimal`/`Date` OK, aucun log d'erreur). Utilisateur de test supprimé après coup.

### Écarts résiduels (hors périmètre 6.3 — tous résolus en étape 5 sauf indiqué)
- ✅ Page **Settings** : currency / displayName / monthlyBudget / theme / language sont désormais éditables et persistés en BDD (`usePrefs`). Logo + avatar **retirés** (demande explicite).
- ✅ **Thème** : `prefs.theme` est la source de vérité (BDD) ; `ThemeSync` aligne next-themes à l'hydratation et après restore. (next-themes garde sa propre clé localStorage pour le no-flash SSR — autorisé.)
- ✅ Dashboard : « Date Range » fonctionnel ; toggle mois/année sur le graphe.
- ✅ Backup/restore + reset implémentés (JSON + PDF).
- ✅ **Badges KPI du Dashboard** (`+12.5%`/`-3.2%`) : désormais **dynamiques** (calculés depuis les vraies données) — cf. section « Corrections Dashboard & Export (post-6.3) ». **Restant (hors périmètre)** : email-verification Better Auth non activée.

### Fichiers (6.3)
Ajoutés : `lib/data.ts`, `lib/serialize.ts`, `app/actions/{_session,incomes,expenses,goals,categories,prefs}.ts`, `components/providers/store-hydrator.tsx`, `components/shared/page-loading.tsx`. Modifiés : `store/useFinanceStore.ts`, `types/index.ts`, `lib/seed.ts` (DEFAULT_PREFS.monthlyBudget), `app/(app)/layout.tsx`, les **7 pages** `app/(app)/*/page.tsx`, `app/(app)/settings/actions.ts`, `components/settings/demo-data-button.tsx`, `components/shared/category-row.tsx`, `components/layout/topbar.tsx`, `messages/*.json` (clés `categories.*` de gestion + `common.errorGeneric`).

## Customisation, sauvegarde & rapports (étape 5)

Finalisation des points restants de l'étape 5 une fois la BDD en place. Tout respecte les conventions 6.3 : écritures = Server Actions scoping par `userId`, le store Zustand reste un cache ré-hydraté avec la valeur retournée, aucun `localStorage` applicatif.

### 1. Backup / Restore / Reset (`app/actions/backup.ts` + `components/settings/backup-restore.tsx`)
- **Export** : `exportUserData()` (Server Action) re-dérive le `userId` de la session, charge le `FinanceSnapshot` complet (incomes, expenses, goals, categories, prefs) et le renvoie enveloppé `{ app, version, exportedAt, data }`.
  - **JSON** : le client télécharge le snapshot (`myfinance-backup-YYYY-MM-DD.json`).
  - **PDF** : `lib/pdf-report.ts` (jsPDF + jspdf-autotable) génère un rapport multi-pages (résumé KPI, mois par mois, tables revenus/dépenses/objectifs, pagination + numéros de page). Montants formatés `CODE 1 234,56` pour éviter les glyphes manquants de la police PDF par défaut.
- **Restore** : upload `.json` → `FileReader` (lecture client, pas de FormData) → `JSON.parse` → **confirmation** → `restoreUserData(payload)`. La Server Action **valide en zod** (chaque entité), puis en **une transaction Prisma** : `deleteMany` (incomes/expenses/goals/categories de `userId`) puis `createMany` depuis la sauvegarde (ids ré-générés — jamais ceux du fichier — pour éviter toute collision inter-DB) + `upsert` prefs. **Strictement scopé `userId`** : ne lit ni n'écrit jamais les données d'un autre utilisateur. Renvoie le snapshot frais → ré-hydratation du cache.
- **Reset** : `resetUserData()` → `resetUserToDefaults(userId)` (`lib/user-seed.ts`) : vide les données + catégories custom, recrée les **catégories par défaut** (`isDefault=true`) et des **UserPrefs par défaut** (USD/en/system/budget 3500, displayName = nom du compte). Renvoie le snapshot frais.

### 2. Toggle mois/année (Dashboard)
- `incomeVsExpensesSeries(incomes, expenses, granularity, limit?)` (`lib/selectors.ts`) regroupe désormais par **mois** (12 derniers) ou par **année** (toutes les années présentes). Bascule segmentée dans l'en-tête du graphe « Income vs Expenses » → suivre l'évolution de la gestion au mois ou à l'année.

### 3. UserPrefs persistées en BDD (`hooks/use-prefs.ts` + `components/providers/theme-sync.tsx`)
- `usePrefs()` : édition **optimiste** de `currency` / `language` / `theme` / `displayName` / `monthlyBudget` → cache Zustand mis à jour **immédiatement** (l'UI re-rend dans la nouvelle devise/langue/thème) + persistance BDD en arrière-plan via `updatePrefs`. La langue de la topbar passe aussi par ce flux.
- **Thème** : `prefs.theme` devient la source de vérité (BDD). `changeTheme` pousse next-themes (flip instantané du `<html>`) **et** la BDD. `ThemeSync` (monté dans `app/(app)/layout.tsx`) réaligne next-themes sur `prefs.theme` à l'hydratation et après un restore. next-themes conserve sa propre clé localStorage pour le no-flash SSR (seul localStorage autorisé, inchangé).
- **Logo + Avatar** retirés de Settings (demande explicite ; colonnes `logoUrl`/`avatarUrl` conservées en schéma, simplement non éditées).

### 4. monthlyBudget
- Déjà branché en 6.3 (`prefs.monthlyBudget` remplace le `$3 500` codé en dur dans « Budget Used % » de la page Expenses) ; rendu **éditable** dans Settings (input + Save). Reset/restore le ramènent à la valeur par défaut / sauvegardée.

### 5. Date Range (Dashboard)
- Bouton **fonctionnel** : dropdown de presets (Tout / Ce mois / 3 mois / 6 mois / Cette année / L'an dernier). Calcule des bornes `YYYY-MM-DD` (comparaison de chaînes ISO) et filtre `incomesF`/`expensesF` qui alimentent **tous** les widgets (KPIs, graphe, donut, transactions récentes). Les objectifs d'épargne (non datés) ne sont pas filtrés.

### 6. Export CSV
- **Topbar** : bouton Export désormais branché → `exportTransactionsCsv()` télécharge le ledger complet (revenus + dépenses) de l'utilisateur courant depuis le cache (hydraté de la BDD), via `lib/csv` (échappement + BOM UTF-8 pour Excel).
- **Monthly Report** : export CSV refactorisé sur `lib/csv` (mêmes garanties). Données = breakdown mois par mois de l'utilisateur courant.

### Vérifié
- `tsc --noEmit` clean ; `next build` OK (7 pages `(app)` → `ƒ`, Proxy actif).
- jsPDF + autotable s'importent/ s'exécutent sans accès `window` au top-level → pas de crash SSR (la page Settings est `ƒ`).
- Smoke-test runtime (dev) : sign-up via l'API Better Auth (seed catégories+prefs), les **7 pages** renvoient 200 avec session, aucun marqueur d'erreur dans le HTML. Utilisateur de test supprimé après coup.

### Dépendances ajoutées
`jspdf` (4.2.1) + `jspdf-autotable` (5.0.8) — génération PDF client.

### Fichiers (étape 5)
Ajoutés : `app/actions/backup.ts`, `lib/csv.ts`, `lib/pdf-report.ts`, `hooks/use-prefs.ts`, `components/providers/theme-sync.tsx`, `components/settings/backup-restore.tsx`. Modifiés : `app/(app)/settings/page.tsx` (réécriture fonctionnelle), `app/(app)/dashboard/page.tsx` (date range + toggle), `app/(app)/monthly-report/page.tsx` (CSV partagé), `app/(app)/layout.tsx` (ThemeSync), `components/layout/topbar.tsx` (export CSV), `lib/selectors.ts` (granularité), `lib/user-seed.ts` (`resetUserToDefaults` + export des listes par défaut), `messages/*.json` (clés `dashboard.range*`/`byMonth`/`byYear` + `settings.*` backup/budget), `package.json` (jspdf).

## Corrections Dashboard & Export (post-6.3)

Trois correctifs ciblés, sans toucher au thème, à l'i18n, au responsive ni à l'isolation par utilisateur (toutes les données viennent du cache Zustand hydraté = lignes Postgres de l'utilisateur courant ; aucune requête Prisma directe côté page).

### 1. Badges KPI dynamiques (Dashboard)
Les badges de variation des StatCards ne sont plus codés en dur (`+12.5%`/`-3.2%`) — ils sont calculés depuis les vraies données **filtrées par la plage de dates** (`incomesF`/`expensesF`), via des **fonctions pures** de `lib/selectors.ts` :
- `monthOverMonthChange(rows)` — variation % entre le mois le plus récent **avec données** et le mois précédent avec données. Renvoie `null` s'il n'y a pas deux mois comparables (ou si le total du mois précédent est 0) → badge neutre « — », **jamais de % inventé** (cas nouvel utilisateur / période unique). Générique : marche pour incomes ET expenses (`{date, amount}`).
- `avgSavingsRate(incomes, expenses, 6)` — vraie moyenne du taux d'épargne sur les 6 derniers mois avec données (réutilise `monthlyBreakdown`, ignore les mois sans revenu). `null` si aucun mois éligible.

Mapping (helper `variationBadge(change, goodWhenUp)` dans la page) :
- **Revenus totaux** → variation MoM, **vert** si ≥ 0 (flèche ↑), **rouge** sinon (↓).
- **Dépenses totales** → variation MoM, **sens inversé** : une hausse est **rouge** (mauvais pour l'utilisateur), une baisse **verte**. La flèche suit la direction réelle ; seule la couleur encode bon/mauvais.
- **Épargne nette** → « Positif » (vert) si net ≥ 0, « Négatif » (rouge) sinon (déjà dynamique, conservé tel quel).
- **Taux d'épargne** → garde le libellé « Moy. 6 mois » **et** affiche la vraie moyenne 6 mois (neutre) ; « — » seul si pas de donnée.

`StatCard` étend son badge avec un `icon?` optionnel (flèche ↑/↓ lucide) ; types `BadgeVariant`/`StatCardBadge` exportés. **Aucun nouveau libellé i18n** requis (réutilise `dashboard.sixMonthAvg`, `common.positive/negative` ; « — » est universel).

### 2. Sidebar mobile se referme à la navigation
`components/layout/sidebar.tsx` : au clic sur un item de navigation, `handleNavigate()` appelle `setOpenMobile(false)` **uniquement si `isMobile`** (via `useSidebar()` du SidebarProvider shadcn + `hooks/use-mobile.ts`). Sur desktop, comportement inchangé (le drawer mobile = `Sheet`, l'état desktop = `open`).

### 3. Export : choix CSV ou PDF (Topbar)
Le bouton « Export » ouvre désormais un **dropdown shadcn** (CSV / PDF) au lieu de télécharger directement.
- **CSV** : comportement existant conservé (`lib/csv`, ledger revenus+dépenses).
- **PDF** : nouveau **rapport financier** — `lib/financial-report-pdf.ts` (`buildFinancialReport`), construit avec **jsPDF + jspdf-autotable** (déjà dépendances du projet, prouvées SSR-safe ; choix le plus simple/robuste, pas de nouvelle lib type @react-pdf/renderer). **Importé dynamiquement au clic** → reste hors du bundle global (la topbar est montée sur toutes les pages).
  - A4, marges 16 mm, noir & blanc, imprimable. **En-tête** : logo MyFinance (ou `prefs.logoUrl` ; fallback wordmark texte si l'image ne charge pas) + pagination « PAGE p/N » en haut à droite. **Titre** « RAPPORT FINANCIER » (traduit, mis en majuscules). **Bloc identité** = `prefs.displayName` — **pas d'IBAN/adresse/crédit-débit bancaire** (c'est un rapport de budget, pas un relevé de compte ; aucune marque tierce). **Période** = min→max des dates des transactions (DD/MM/YYYY).
  - **Tableau** : Date | Type (Revenu/Dépense) | Description | Revenu | Dépense (revenus dans la colonne Revenu, dépenses dans Dépense), en-tête sur gris très clair, lignes fines (`theme: grid`, lignes claires).
  - **Totaux** bas-droite : Total revenus, Total dépenses, **Épargne nette** mise en évidence (bande grise). Montants via `formatCurrencyFull` (2 décimales) dans la devise des prefs. Totaux calculés via `lib/selectors` (réutilisés).
  - **i18n** : namespace `report` ajouté aux **9 fichiers** messages (EN + FR complets, autres = fallback EN). Données = **exclusivement** celles de l'utilisateur connecté (cache hydraté).

### Vérifié
- `tsc --noEmit` clean. JSON des 9 locales valide. Lint : **aucune nouvelle erreur** (l'erreur `react-hooks/set-state-in-effect` de `topbar.tsx:76` **préexiste** — guard de montage anti-mismatch hydration, hors périmètre).

### Écarts résiduels
- **Glyphes devise PDF** : `formatCurrencyFull` rend le symbole de la devise ; la police Helvetica par défaut de jsPDF ne dessine pas quelques symboles exotiques (₹ INR, ₵ GHS) → fallback glyphe. USD/EUR/GBP/JPY/CNY OK. (Même limite que `lib/pdf-report.ts`, qui la contourne via le code ISO ; non corrigé ici car l'utilisateur a explicitement demandé `formatCurrency`.)
- Le dropdown export n'affiche pas d'état « busy » visuel pendant la génération PDF (chargement logo + build quasi instantané ; un échec est silencieux et non bloquant).

### Fichiers (post-6.3)
Ajoutés : `lib/financial-report-pdf.ts`. Modifiés : `lib/selectors.ts` (`monthOverMonthChange`, `avgSavingsRate`), `components/shared/stat-card.tsx` (badge `icon` + types exportés), `app/(app)/dashboard/page.tsx` (badges dynamiques + helper `variationBadge`), `components/layout/sidebar.tsx` (fermeture mobile), `components/layout/topbar.tsx` (dropdown CSV/PDF + `exportTransactionsPdf`), `messages/*.json` (namespace `report`).
