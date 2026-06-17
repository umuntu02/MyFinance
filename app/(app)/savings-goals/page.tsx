"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  createGoal as createGoalAction,
  updateGoal as updateGoalAction,
  deleteGoal as deleteGoalAction,
} from "@/app/actions/goals";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/page-loading";
import { ProgressBar } from "@/components/shared/progress-bar";
import { AddEditDialog } from "@/components/shared/add-edit-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getIcon } from "@/lib/icon-map";
import type { SavingsGoal } from "@/types";

const GOAL_ICONS = [
  "shield", "plane", "laptop", "home", "car", "heart-pulse",
  "graduation-cap", "baby", "gift", "piggy-bank", "star", "target",
];

function emptyForm(): Omit<SavingsGoal, "id"> {
  return { name: "", icon: "piggy-bank", saved: 0, target: 0, targetDate: "" };
}

export default function SavingsGoalsPage() {
  const savingsGoals = useFinanceStore((s) => s.savingsGoals);
  const prefs = useFinanceStore((s) => s.prefs);
  const hydrated = useFinanceStore((s) => s.hydrated);
  const addGoal = useFinanceStore((s) => s.addGoal);
  const updateGoalCache = useFinanceStore((s) => s.updateGoal);
  const deleteGoalCache = useFinanceStore((s) => s.deleteGoal);
  const currency = prefs.currency;
  const t  = useTranslations("savingsGoals");
  const tc = useTranslations("common");

  const totals = useMemo(() => {
    const totalTarget = savingsGoals.reduce((s, g) => s + g.target, 0);
    const totalSaved  = savingsGoals.reduce((s, g) => s + g.saved, 0);
    return { totalTarget, totalSaved, remaining: totalTarget - totalSaved };
  }, [savingsGoals]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing]       = useState<SavingsGoal | null>(null);
  const [form, setForm]             = useState<Omit<SavingsGoal, "id">>(emptyForm());
  const [isSaving, setIsSaving]     = useState(false);
  const [error, setError]           = useState(false);

  function openAdd() {
    setEditing(null);
    setError(false);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(goal: SavingsGoal) {
    setEditing(goal);
    setError(false);
    setForm({ name: goal.name, icon: goal.icon, saved: goal.saved, target: goal.target, targetDate: goal.targetDate });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.target || !form.targetDate) return;
    setIsSaving(true);
    setError(false);
    try {
      if (editing) {
        const updated = await updateGoalAction(editing.id, form);
        updateGoalCache(editing.id, updated);
      } else {
        const created = await createGoalAction(form);
        addGoal(created);
      }
      setDialogOpen(false);
    } catch {
      setError(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteGoalAction(id);
      deleteGoalCache(id);
    } catch {
      // keep the goal if the server rejected the delete
    }
  }

  if (!hydrated) return <PageLoading cards={3} />;

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button size="sm" className="gap-1.5 cursor-pointer" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            {t("newGoal")}
          </Button>
        }
      />

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {savingsGoals.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground text-sm">
            {t("noGoals")}
          </div>
        ) : (
          savingsGoals.map((goal) => {
            const pct  = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
            const Icon = getIcon(goal.icon);
            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gold/10 text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground leading-none truncate" title={goal.name}>{goal.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("targetDate", { date: formatDate(goal.targetDate) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                      onClick={() => openEdit(goal)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-expense"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("saved")}: <span className="font-semibold text-foreground">{formatCurrency(goal.saved, currency)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {t("goal")}: <span className="font-semibold text-foreground">{formatCurrency(goal.target, currency)}</span>
                  </span>
                </div>

                {/* Progress */}
                <ProgressBar
                  value={pct}
                  saved={goal.saved}
                  target={goal.target}
                  currency={currency}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Total summary card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-sm text-foreground mb-5">{t("totalTargetRemaining")}</h3>
        <div className="grid grid-cols-3 divide-x divide-border">
          <div className="pr-6 text-center">
            <p className="text-2xl font-bold text-foreground">
              {formatCurrency(totals.totalTarget, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t("totalTarget")}</p>
          </div>
          <div className="px-6 text-center">
            <p className="text-2xl font-bold text-brand-gold">
              {formatCurrency(totals.totalSaved, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t("totalSaved")}</p>
          </div>
          <div className="pl-6 text-center">
            <p className="text-2xl font-bold text-expense">
              {formatCurrency(totals.remaining, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t("remaining")}</p>
          </div>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <AddEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? t("editTitle") : t("addTitle")}
        description={editing ? t("editDesc") : t("addDesc")}
        onSave={handleSave}
        saveLabel={editing ? tc("saveChanges") : t("createGoal")}
        isSaving={isSaving}
      >
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("goalName")}</label>
            <Input placeholder={t("goalNamePlaceholder")} value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("amountSaved")}</label>
              <Input type="number" placeholder="0.00" value={form.saved || ""}
                onChange={(e) => setForm((f) => ({ ...f, saved: parseFloat(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{t("goalAmount")}</label>
              <Input type="number" placeholder="0.00" value={form.target || ""}
                onChange={(e) => setForm((f) => ({ ...f, target: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("targetDateLabel")}</label>
            <Input type="date" value={form.targetDate}
              onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">{t("icon")}</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
            >
              {GOAL_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{tc("errorGeneric")}</p>}
        </div>
      </AddEditDialog>
    </>
  );
}
