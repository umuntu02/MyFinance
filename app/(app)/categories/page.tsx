"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import { totalIncome, totalExpenses, incomeByCategory, expenseByCategory } from "@/lib/selectors";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { CategoryRow } from "@/components/shared/category-row";

export default function CategoriesPage() {
  const { incomes, expenses, prefs } = useFinanceStore();
  const currency = prefs.currency;
  const t = useTranslations("categories");

  const incCats  = useMemo(() => incomeByCategory(incomes), [incomes]);
  const expCats  = useMemo(() => expenseByCategory(expenses), [expenses]);
  const totalInc = useMemo(() => totalIncome(incomes), [incomes]);
  const totalExp = useMemo(() => totalExpenses(expenses), [expenses]);

  const sortedIncCats = [...incCats].sort((a, b) => b.total - a.total);
  const sortedExpCats = [...expCats].sort((a, b) => b.total - a.total);

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income by Category */}
        <SectionCard title={t("incomeByCategory")} viewAllHref="/income">
          {sortedIncCats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("noIncomeData")}</p>
          ) : (
            <div className="divide-y divide-border -mx-5 px-5">
              {sortedIncCats.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  recordCount={cat.recordCount}
                  total={cat.total}
                  currency={currency}
                  percentage={totalInc > 0 ? (cat.total / totalInc) * 100 : 0}
                  iconBgClassName="bg-income/10 text-income"
                />
              ))}
            </div>
          )}
        </SectionCard>

        {/* Expenses by Category */}
        <SectionCard title={t("expensesByCategory")} viewAllHref="/expenses">
          {sortedExpCats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t("noExpenseData")}</p>
          ) : (
            <div className="divide-y divide-border -mx-5 px-5">
              {sortedExpCats.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  recordCount={cat.recordCount}
                  total={cat.total}
                  currency={currency}
                  percentage={totalExp > 0 ? (cat.total / totalExp) * 100 : 0}
                  iconBgClassName="bg-expense/10 text-expense"
                />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>
  );
}
