"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Database, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { loadDemoDataAction } from "@/app/(app)/settings/actions";

type Status = "idle" | "done" | "error";

export function DemoDataButton() {
  const t = useTranslations("settings");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");

  function onClick() {
    setStatus("idle");
    startTransition(async () => {
      const res = await loadDemoDataAction();
      setStatus(res.ok ? "done" : "error");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={onClick}
        disabled={isPending}
        variant="outline"
        size="lg"
        className="h-9 w-full sm:w-auto"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        {isPending ? t("loadingDemo") : t("loadDemoAction")}
      </Button>

      {status === "done" && (
        <p className="flex items-center gap-1.5 text-sm text-income">
          <CheckCircle2 className="h-4 w-4" />
          {t("demoLoaded")}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{t("demoError")}</p>
      )}
    </div>
  );
}
