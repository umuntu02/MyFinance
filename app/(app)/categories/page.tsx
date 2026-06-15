"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  createCategory as createCategoryAction,
  deleteCategory as deleteCategoryAction,
} from "@/app/actions/categories";
import { totalIncome, totalExpenses, incomeByCategory, expenseByCategory } from "@/lib/selectors";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/page-loading";
import { SectionCard } from "@/components/shared/section-card";
import { CategoryRow } from "@/components/shared/category-row";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIcon } from "@/lib/icon-map";
import type { CategoryKind } from "@/types";

// Icons offered when creating a category (all present in lib/icon-map).
const CATEGORY_ICONS = [
  "briefcase", "code-2", "trending-up", "gift", "dollar-sign", "wallet",
  "home", "utensils", "car", "zap", "tv-2", "heart-pulse", "shopping-bag",
  "bar-chart-3", "tag", "circle-dot",
];

export default function CategoriesPage() {
  const incomes = useFinanceStore((s) => s.incomes);
  const expenses = useFinanceStore((s) => s.expenses);
  const prefs = useFinanceStore((s) => s.prefs);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const incomeCategories = useFinanceStore((s) => s.incomeCategories);
  const expenseCategories = useFinanceStore((s) => s.expenseCategories);
  const addCategoryCache = useFinanceStore((s) => s.addCategory);
  const deleteCategoryCache = useFinanceStore((s) => s.deleteCategory);
  const currency = prefs.currency;
  const t = useTranslations("categories");
  const tc = useTranslations("common");

  const totalInc = useMemo(() => totalIncome(incomes), [incomes]);
  const totalExp = useMemo(() => totalExpenses(expenses), [expenses]);

  // Aggregate spending/earnings per category name (from transactions)…
  const incAgg = useMemo(() => {
    const m = new Map<string, { total: number; recordCount: number }>();
    for (const c of incomeByCategory(incomes)) m.set(c.name, { total: c.total, recordCount: c.recordCount });
    return m;
  }, [incomes]);
  const expAgg = useMemo(() => {
    const m = new Map<string, { total: number; recordCount: number }>();
    for (const c of expenseByCategory(expenses)) m.set(c.name, { total: c.total, recordCount: c.recordCount });
    return m;
  }, [expenses]);

  // …then list ALL of the user's categories (incl. ones with no transactions),
  // sorted by amount, so every category is manageable.
  const incRows = useMemo(
    () =>
      incomeCategories
        .map((c) => ({ ...c, ...(incAgg.get(c.name) ?? { total: 0, recordCount: 0 }) }))
        .sort((a, b) => b.total - a.total),
    [incomeCategories, incAgg],
  );
  const expRows = useMemo(
    () =>
      expenseCategories
        .map((c) => ({ ...c, ...(expAgg.get(c.name) ?? { total: 0, recordCount: 0 }) }))
        .sort((a, b) => b.total - a.total),
    [expenseCategories, expAgg],
  );

  // Add-category dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(CATEGORY_ICONS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<"" | "generic" | "duplicate">("");

  function openAdd(forKind: CategoryKind) {
    setKind(forKind);
    setName("");
    setIcon(forKind === "income" ? "dollar-sign" : "tag");
    setError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      const created = await createCategoryAction({ name: name.trim(), icon, type: kind });
      addCategoryCache(created);
      setDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error && e.message.includes("DUPLICATE") ? "duplicate" : "generic");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategoryAction(id);
      deleteCategoryCache(id);
    } catch {
      // keep the category if the server rejected the delete
    }
  }

  if (!hydrated) return <PageLoading cards={2} />;

  const addButton = (forKind: CategoryKind) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
      onClick={() => openAdd(forKind)}
    >
      <Plus className="h-3.5 w-3.5" />
      {t("addCategory")}
    </Button>
  );

  return (
    <>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income by Category */}
        <SectionCard title={t("incomeByCategory")} headerExtra={addButton("income")}>
          {incRows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("noCategories")}</p>
          ) : (
            <div className="divide-y divide-border -mx-5 px-5">
              {incRows.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  recordCount={cat.recordCount}
                  total={cat.total}
                  currency={currency}
                  percentage={totalInc > 0 ? (cat.total / totalInc) * 100 : 0}
                  iconBgClassName="bg-income/10 text-income"
                  onDelete={() => handleDelete(cat.id)}
                  deleteLabel={t("deleteCategory")}
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Expenses by Category */}
        <SectionCard title={t("expensesByCategory")} headerExtra={addButton("expense")}>
          {expRows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("noCategories")}</p>
          ) : (
            <div className="divide-y divide-border -mx-5 px-5">
              {expRows.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  recordCount={cat.recordCount}
                  total={cat.total}
                  currency={currency}
                  percentage={totalExp > 0 ? (cat.total / totalExp) * 100 : 0}
                  iconBgClassName="bg-expense/10 text-expense"
                  onDelete={() => handleDelete(cat.id)}
                  deleteLabel={t("deleteCategory")}
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Add Category Dialog */}
      <AddEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={kind === "income" ? t("addIncomeCategory") : t("addExpenseCategory")}
        description={t("addCategoryDesc")}
        onSave={handleSave}
        saveLabel={t("create")}
        isSaving={isSaving}
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("categoryName")}</label>
            <Input
              placeholder={t("categoryNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("categoryIcon")}</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((ic) => {
                const Icon = getIcon(ic);
                const active = ic === icon;
                return (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    aria-label={ic}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border cursor-pointer transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-input text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
          {error === "duplicate" && (
            <p className="text-sm text-destructive">{t("duplicateError")}</p>
          )}
          {error === "generic" && (
            <p className="text-sm text-destructive">{tc("errorGeneric")}</p>
          )}
        </div>
      </AddEditDialog>
    </>
  );
}
