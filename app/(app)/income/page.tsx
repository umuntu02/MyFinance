"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Calendar, Hash, BarChart2, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  createIncome as createIncomeAction,
  updateIncome as updateIncomeAction,
  deleteIncome as deleteIncomeAction,
} from "@/app/actions/incomes";
import { totalIncome, thisMonthIncome, monthlyAvg } from "@/lib/selectors";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/page-loading";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type TableColumn } from "@/components/shared/data-table";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Income, IncomeCategoryName } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Salary:     "bg-income/10 text-income",
  Freelance:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Investment: "bg-brand-gold/10 text-brand-gold",
  Bonus:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Other:      "bg-muted text-muted-foreground",
};

function emptyForm(): Omit<Income, "id"> {
  return { date: "", source: "", category: "", amount: 0, notes: "" };
}

export default function IncomePage() {
  const incomes = useFinanceStore((s) => s.incomes);
  const incomeCategories = useFinanceStore((s) => s.incomeCategories);
  const prefs = useFinanceStore((s) => s.prefs);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const addIncome = useFinanceStore((s) => s.addIncome);
  const updateIncomeCache = useFinanceStore((s) => s.updateIncome);
  const deleteIncomeCache = useFinanceStore((s) => s.deleteIncome);
  const currency = prefs.currency;
  const t  = useTranslations("income");
  const tc = useTranslations("common");

  const totalInc    = useMemo(() => totalIncome(incomes), [incomes]);
  const thisMonth   = useMemo(() => thisMonthIncome(incomes), [incomes]);
  const avgData     = useMemo(() => monthlyAvg(incomes, []), [incomes]);
  const recordCount = incomes.length;

  const [search, setSearch]         = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filtered = useMemo(() => {
    let list = [...incomes].sort((a, b) => b.date.localeCompare(a.date));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) => i.source.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || (i.notes ?? "").toLowerCase().includes(q),
      );
    }
    if (filterDate) {
      list = list.filter((i) => i.date.startsWith(filterDate));
    }
    return list;
  }, [incomes, search, filterDate]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<Income | null>(null);
  const [form, setForm]             = useState<Omit<Income, "id">>(emptyForm());
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState(false);

  const fallbackCategory = incomeCategories[0]?.name ?? "Other";

  function openAdd() {
    setEditing(null);
    setError(false);
    setForm({ ...emptyForm(), category: fallbackCategory });
    setDialogOpen(true);
  }

  function openEdit(row: Income) {
    setEditing(row);
    setError(false);
    setForm({ date: row.date, source: row.source, category: row.category, amount: row.amount, notes: row.notes ?? "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.date || !form.source || !form.amount) return;
    setIsSaving(true);
    setError(false);
    const payload = {
      date: form.date,
      source: form.source,
      category: form.category || fallbackCategory,
      amount: form.amount,
      notes: form.notes || null,
    };
    try {
      if (editing) {
        const updated = await updateIncomeAction(editing.id, payload);
        updateIncomeCache(editing.id, updated);
      } else {
        const created = await createIncomeAction(payload);
        addIncome(created);
      }
      setDialogOpen(false);
    } catch {
      setError(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(row: Income) {
    try {
      await deleteIncomeAction(row.id);
      deleteIncomeCache(row.id);
    } catch {
      // keep the row if the server rejected the delete
    }
  }

  const columns: TableColumn<Income>[] = [
    {
      id: "date",
      header: t("colDate"),
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.date)}</span>,
    },
    {
      id: "source",
      header: t("colSource"),
      cell: (row) => (
        <div className="max-w-37.5 sm:max-w-75 lg:max-w-md">
          <p className="font-medium text-foreground truncate" title={row.source}>{row.source}</p>
          {row.notes && (
            <p className="text-xs text-muted-foreground truncate" title={row.notes}>{row.notes}</p>
          )}
        </div>
      ),
    },
    {
      id: "category",
      header: t("colCategory"),
      cell: (row) => (
        <Badge className={`text-xs font-medium border-0 ${CATEGORY_COLORS[row.category] ?? "bg-muted text-muted-foreground"}`}>
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
        <span className="font-semibold text-income">{formatCurrency(row.amount, currency)}</span>
      ),
    },
    {
      id: "notes",
      header: t("colNotes"),
      truncate: true,
      title: (row) => row.notes ?? "",
      cell: (row) => (
        <span className="text-muted-foreground text-xs">{row.notes ?? "—"}</span>
      ),
    },
  ];

  if (!hydrated) return <PageLoading />;

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button size="sm" className="gap-1.5 cursor-pointer bg-income hover:bg-income/90 text-white" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {t("addIncome")}
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t("totalIncome")}
          value={formatCurrency(totalInc, currency)}
          icon={TrendingUp}
          iconClassName="bg-income/10 text-income"
        />
        <StatCard
          label={t("thisMonth")}
          value={formatCurrency(thisMonth, currency)}
          icon={Calendar}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label={t("records")}
          value={String(recordCount)}
          icon={Hash}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label={t("monthlyAvg")}
          value={formatCurrency(avgData.income, currency)}
          icon={BarChart2}
          iconClassName="bg-brand-gold/10 text-brand-gold"
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
        onDelete={handleDelete}
        emptyText={t("noRecords")}
      />

      {/* Add / Edit Dialog */}
      <AddEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? t("editTitle") : t("addTitle")}
        description={editing ? t("editDesc") : t("addDesc")}
        onSave={handleSave}
        saveLabel={editing ? tc("saveChanges") : t("addIncome")}
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
            <label className="text-xs font-medium text-muted-foreground">{t("sourceDesc")}</label>
            <Input placeholder={t("sourcePlaceholder")} value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{tc("category")}</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as IncomeCategoryName }))}
            >
              {incomeCategories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("notesOptional")}</label>
            <Input placeholder={t("notesPlaceholder")} value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          {error && <p className="text-sm text-destructive">{tc("errorGeneric")}</p>}
        </div>
      </AddEditDialog>
    </>
  );
}
