"use client";

import { useMemo, useState } from "react";
import { TrendingDown, Calendar, Wallet, Percent, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import { totalExpenses, thisMonthExpenses, monthlyAvg } from "@/lib/selectors";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type TableColumn } from "@/components/shared/data-table";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Expense, ExpenseCategoryName } from "@/types";

const EXPENSE_CATEGORIES: ExpenseCategoryName[] = [
  "Housing", "Food & Dining", "Transport", "Utilities",
  "Entertainment", "Healthcare", "Shopping", "Other",
];

const MONTHLY_BUDGET = 3500;

function emptyForm(): Omit<Expense, "id"> {
  return { date: "", description: "", category: "Other", amount: 0, status: "Paid" };
}

export default function ExpensesPage() {
  const { expenses, incomes, prefs, addExpense, updateExpense, deleteExpense } = useFinanceStore();
  const currency = prefs.currency;
  const t  = useTranslations("expenses");
  const tc = useTranslations("common");

  const totalExp   = useMemo(() => totalExpenses(expenses), [expenses]);
  const thisMonth  = useMemo(() => thisMonthExpenses(expenses), [expenses]);
  const avgData    = useMemo(() => monthlyAvg(incomes, expenses), [incomes, expenses]);
  const budgetUsed = MONTHLY_BUDGET > 0 ? (thisMonth / MONTHLY_BUDGET) * 100 : 0;

  const [search, setSearch]         = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filtered = useMemo(() => {
    let list = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q),
      );
    }
    if (filterDate) {
      list = list.filter((e) => e.date.startsWith(filterDate));
    }
    return list;
  }, [expenses, search, filterDate]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Expense | null>(null);
  const [form, setForm]             = useState<Omit<Expense, "id">>(emptyForm());
  const [isSaving, setIsSaving]     = useState(false);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(row: Expense) {
    setEditing(row);
    setForm({ date: row.date, description: row.description, category: row.category, amount: row.amount, status: row.status });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.date || !form.description || !form.amount) return;
    setIsSaving(true);
    setTimeout(() => {
      if (editing) {
        updateExpense(editing.id, form);
      } else {
        addExpense(form);
      }
      setIsSaving(false);
      setDialogOpen(false);
    }, 400);
  }

  const columns: TableColumn<Expense>[] = [
    {
      id: "date",
      header: t("colDate"),
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.date)}</span>,
    },
    {
      id: "description",
      header: t("colDescription"),
      cell: (row) => <span className="font-medium text-foreground">{row.description}</span>,
    },
    {
      id: "category",
      header: t("colCategory"),
      cell: (row) => (
        <Badge className="text-xs font-medium border-0 bg-muted text-muted-foreground">
          {row.category}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: t("colAmount"),
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-expense">−{formatCurrency(row.amount, currency)}</span>
      ),
    },
    {
      id: "status",
      header: t("colStatus"),
      cell: (row) => (
        <Badge
          className={`text-xs font-medium border-0 ${
            row.status === "Paid"
              ? "bg-income/10 text-income"
              : "bg-brand-gold/10 text-brand-gold"
          }`}
        >
          {row.status === "Paid" ? tc("paid") : tc("pending")}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button size="sm" variant="destructive" className="gap-1.5 cursor-pointer" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {t("addExpense")}
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t("totalExpenses")}
          value={formatCurrency(totalExp, currency)}
          icon={TrendingDown}
          iconClassName="bg-expense/10 text-expense"
        />
        <StatCard
          label={t("thisMonth")}
          value={formatCurrency(thisMonth, currency)}
          icon={Calendar}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label={t("monthlyBudget")}
          value={formatCurrency(MONTHLY_BUDGET, currency)}
          icon={Wallet}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label={t("budgetUsed")}
          value={formatPercent(budgetUsed)}
          icon={Percent}
          iconClassName={budgetUsed > 90 ? "bg-expense/10 text-expense" : "bg-income/10 text-income"}
          badge={{
            text: budgetUsed > 100 ? t("overBudget") : t("onTrack"),
            variant: budgetUsed > 100 ? "negative" : "positive",
          }}
        />
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("searchPlaceholder")}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input
          type="month"
          className="sm:w-45"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => deleteExpense(r.id)}
        emptyText={t("noRecords")}
      />

      {/* Add / Edit Dialog */}
      <AddEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? t("editTitle") : t("addTitle")}
        description={editing ? t("editDesc") : t("addDesc")}
        onSave={handleSave}
        saveLabel={editing ? tc("saveChanges") : t("addExpense")}
        isSaving={isSaving}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("date")}</label>
              <Input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("amount")}</label>
              <Input type="number" placeholder="0.00" value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{tc("description")}</label>
            <Input placeholder={t("descriptionPlaceholder")} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("category")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategoryName }))}
              >
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{tc("status")}</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "Paid" | "Pending" }))}
              >
                <option value="Paid">{tc("paid")}</option>
                <option value="Pending">{tc("pending")}</option>
              </select>
            </div>
          </div>
        </div>
      </AddEditDialog>
    </>
  );
}
