import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useDemoData } from "@/context/DemoDataContext";
import { useToast } from "@/context/ToastContext";
import { RotateCcw } from "lucide-react";

export function ResetDemoDataButton() {
  const { resetDemoData } = useDemoData();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirm() {
    resetDemoData();
    setConfirmOpen(false);
    showToast("تم تحديث البيانات من قاعدة البيانات");
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)} leftIcon={<RotateCcw className="h-4 w-4" aria-hidden="true" />}>
        تحديث البيانات
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="تحديث البيانات"
        message="سيتم تحميل أحدث البيانات المسموح بها لحسابك من Appwrite."
        confirmLabel="تحديث"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
