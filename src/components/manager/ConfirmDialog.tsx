import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TriangleAlert as AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "تأكيد", cancelLabel = "إلغاء", onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 text-warning-600 shrink-0" aria-hidden="true" />
        <p className="text-base text-ink leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
