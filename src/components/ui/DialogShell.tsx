import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/Button";

interface DialogShellProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel: () => void;
}

export function DialogShell({
  open,
  title,
  description,
  children,
  confirmLabel = "确认",
  cancelLabel = "取消",
  onConfirm,
  onCancel,
}: DialogShellProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <div className="page-hero__eyebrow">危险操作预留</div>
        <h3>{title}</h3>
        <p>{description}</p>
        {children}
        <div className="dialog-card__actions">
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
