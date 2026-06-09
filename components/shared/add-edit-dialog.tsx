"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AddEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSave: () => void;
  saveLabel?: string;
  isSaving?: boolean;
  children: ReactNode;
};

export function AddEditDialog({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  saveLabel = "Save",
  isSaving = false,
  children,
}: AddEditDialogProps) {
  const t = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-120">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-2">{children}</div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="cursor-pointer"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="cursor-pointer"
          >
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
