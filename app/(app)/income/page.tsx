"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Calendar, Hash, BarChart2, Plus, Search } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { totalIncome, thisMonthIncome, monthlyAvg } from "@/lib/selectors";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type TableColumn } from "@/components/shared/data-table";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Income, IncomeCategoryName } from "@/types";

const INCOME_CATEGORIES: IncomeCategoryName[] = [
  "Salary", "Freelance", "Investment", "Bonus", "Other",
];

const CATEGORY_COLORS: Record<IncomeCategoryName, string> = {
  Salary:     "bg-income/10 text-income",
  Freelance:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Investment: "bg-brand-gold/10 text-brand-gold",
  Bonus:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Other:      "bg-muted text-muted-foreground",
};

function emptyForm(): Omit<Income, "id"> {
  return { date: "", source: "", category: "Salary", amount: 0, notes: "" };
}

export default function IncomePage() {
  const { incomes, prefs, addIncome, updateIncome, deleteIncome } = useFinanceStore();
  const currency = prefs.currency;

  const totalInc      = useMemo(() => totalIncome(incomes), [incomes]);
  const thisMonth     = useMemo(() => thisMonthIncome(incomes), [incomes]);
  const avgData       = useMemo(() => monthlyAvg(incomes, []), [incomes]);
  const recordCount   = incomes.length;

  const [search, setSearch]     = useState("");
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

  function openAdd() {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(row: Income) {
    setEditing(row);
    setForm({ date: row.date, source: row.source, category: row.category, amount: row.amount, notes: row.notes ?? "" });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.date || !form.source || !form.amount) return;
    setIsSaving(true);
    setTimeout(() => {
      if (editing) {
        updateIncome(editing.id, form);
      } else {
        addIncome(form);
      }
      setIsSaving(false);
      setDialogOpen(false);
    }, 400);
  }

  const columns: TableColumn<Income>[] = [
    {
      id: "date",
      header: "Date",
      cell: (row) => <span className="text-muted-foreground">{formatDate(row.date)}</span>,
    },
    {
      id: "source",
      header: "Source / Description",
      cell: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.source}</p>
          {row.notes && <p className="text-xs text-muted-foreground truncate max-w-50">{row.notes}</p>}
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (row) => (
        <Badge className={`text-xs font-medium border-0 ${CATEGORY_COLORS[row.category]}`}>
          {row.category}
        </Badge>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => (
        <span className="font-semibold text-income">{formatCurrency(row.amount, currency)}</span>
      ),
    },
    {
      id: "notes",
      header: "Notes",
      cell: (row) => (
        <span className="text-muted-foreground text-xs">{row.notes ?? "—"}</span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Income"
        subtitle="Track and manage all your income sources"
        actions={
          <Button size="sm" className="gap-1.5 cursor-pointer bg-income hover:bg-income/90 text-white" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Income
          </Button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalInc, currency)}
          icon={TrendingUp}
          iconClassName="bg-income/10 text-income"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(thisMonth, currency)}
          icon={Calendar}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label="Records"
          value={String(recordCount)}
          icon={Hash}
          iconClassName="bg-muted text-muted-foreground"
        />
        <StatCard
          label="Monthly Avg"
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
            placeholder="Search by source, category…"
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
        onDelete={(r) => deleteIncome(r.id)}
        emptyText="No income records found."
      />

      {/* Add / Edit Dialog */}
      <AddEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Income" : "Add Income"}
        description={editing ? "Update the income record." : "Record a new income entry."}
        onSave={handleSave}
        saveLabel={editing ? "Save Changes" : "Add Income"}
        isSaving={isSaving}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Amount</label>
              <Input type="number" placeholder="0.00" value={form.amount || ""}
                onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Source / Description</label>
            <Input placeholder="e.g. Monthly salary" value={form.source}
              onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Category</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as IncomeCategoryName }))}
            >
              {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <Input placeholder="Any additional notes…" value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
      </AddEditDialog>
    </>
  );
}
