"use client";

import { Button } from "@/components/ui/button";
import { MaterialIcon } from "@/components/ui/material-icon";

interface FormActionsProps {
  submitLabel: string;
  cancelLabel: string;
  onCancel: () => void;
  showSaveIcon?: boolean;
}

export function FormActions({
  submitLabel,
  cancelLabel,
  onCancel,
  showSaveIcon = true,
}: FormActionsProps) {
  return (
    <div className="flex gap-3 border-t border-border/60 bg-surface px-6 py-4">
      <Button type="submit">
        {showSaveIcon && <MaterialIcon name="save" size={18} />}
        {submitLabel}
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
}
