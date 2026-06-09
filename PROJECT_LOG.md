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
