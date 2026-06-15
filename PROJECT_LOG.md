# MyFinance — Project Log

## Stack
- Next.js 16 App Router + TypeScript strict
- Tailwind CSS v4 + shadcn/ui (radix-nova, cssVariables)
- Zustand v5 + persist middleware (clé localStorage : `"myfinance"`)
- next-themes (defaultTheme system, attribute="class")
- recharts
- lucide-react
- IBM Plex Sans (Google Fonts)

## Avancement par étape
- [x] Étape 1 — Scaffold + design system + layout/sidebar/topbar
- [x] Étape 2 — Types + store + seed
- [x] Étape 3 — Composants réutilisables
- [x] Étape 4 — Pages
- [~] Étape 5 — Customisation/i18n/backup/print
  - [x] i18n complet (next-intl v4.13.0)
  - [ ] backup/restore, date-picker, budget dans prefs
- [~] Étape 6 — Migration multi-utilisateurs (localStorage → PostgreSQL + Prisma + Better Auth)
  - [x] 6.1 — Base de données (Prisma + Postgres : schéma, migration `init`, client) — cf. section « Base de données »
  - [ ] 6.2 — Better Auth (tables auth, login/signup, seed des catégories + prefs par utilisateur)
  - [ ] 6.3 — Migration des pages + remplacement du store Zustand par la DB

## Carte des fichiers

| Fichier | Rôle |
|---|---|
| `app/layout.tsx` | Layout racine : ThemeProvider, TooltipProvider, IBM Plex Sans |
| `app/page.tsx` | Redirect → /dashboard |
| `app/(app)/layout.tsx` | Shell app : SidebarProvider + AppSidebar + Topbar |
| `app/(app)/dashboard/page.tsx` | Dashboard : 4 StatCards, IncomeVsExpensesChart, SpendingDonut, Recent Transactions, Savings Goals preview, Add Income/Expense dialogs, Date Range button |
| `app/(app)/income/page.tsx` | Income : 4 StatCards, search + month filter, DataTable (date/source/category badge/amount/notes), Add/Edit/Delete dialog |
| `app/(app)/expenses/page.tsx` | Expenses : 4 StatCards (budget used %), search + month filter, DataTable (date/description/category/amount rouge/status badge), Add/Edit/Delete dialog |
| `app/(app)/savings-goals/page.tsx` | Savings Goals : grille 2 col (icône/nom/date/montants/ProgressBar), carte Total Target Remaining, Add/Edit/Delete goal dialog |
| `app/(app)/monthly-report/page.tsx` | Monthly Report : 4 StatCards, SavingsBarChart, ExpenseDistributionPie, tableau Month-by-Month, export CSV, Print |
| `app/(app)/categories/page.tsx` | Categories : 2 colonnes SectionCard (Income / Expenses by Category) avec CategoryRow + pourcentages |
| `app/(app)/settings/page.tsx` | Settings : placeholder structuré (Logo, Profile, Currency, Theme, Language, Backup/Restore) — logique à implémenter étape 5 |
| `app/globals.css` | Design tokens CSS (clair + sombre), utilitaires .text-income/.text-expense/.text-brand-gold |
| `components/layout/sidebar.tsx` | Sidebar forêt-verte, shadcn Sidebar primitives, collapsible="icon" |
| `components/layout/topbar.tsx` | Topbar sticky : titre page, langue, thème, impression, export |
| `components/shared/page-placeholder.tsx` | Carte "under construction" générique |
| `components/ui/*` | Composants shadcn installés : avatar, button, dropdown-menu, input, separator, sheet, sidebar, skeleton, tooltip |
| `hooks/use-mobile.ts` | Hook détection mobile (généré par shadcn) |
| `lib/utils.ts` | cn() helper (shadcn) |
| `lib/seed.ts` | Données de démarrage réalistes (18 revenus, ~98 dépenses, 4 objectifs) |
| `lib/selectors.ts` | Fonctions pures de calcul (totalIncome, netSavings, monthlyBreakdown…) |
| `lib/format.ts` | formatCurrency, formatDate |
| `store/useFinanceStore.ts` | Store Zustand principal (incomes, expenses, savingsGoals, prefs) + CRUD + resetToSeed |
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
| `.env.example` | Variables d'env committées (DATABASE_URL + Better Auth) |
| `.env` | Variables locales (gitignored) |

## Conventions clés
- Aucun composant ne lit localStorage directement : tout passe par `useFinanceStore`
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
| Fichiers messages | `messages/{en,fr,es,it,zh,ja,hi}.json` — tous les namespaces : common, sidebar, topbar, nav, dashboard, income, expenses, savingsGoals, monthlyReport, categories, settings |
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
- Étape 4 — Écarts visuels à corriger (étape 5) :
  - Dashboard topbar : le bouton "Date Range" est décoratif (pas de date-picker réel) ; fonctionnel en étape 5
  - Expenses : `MONTHLY_BUDGET` codé en dur à $3 500 ; à exposer dans `prefs` à l'étape 5
  - Settings : toutes les sections sont des placeholders cliquables sans logique ; logique complète à l'étape 5
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
