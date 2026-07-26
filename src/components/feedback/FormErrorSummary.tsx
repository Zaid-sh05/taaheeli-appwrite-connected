import { Alert } from "@/components/ui/Alert";

interface FormErrorSummaryProps {
  errors: string[];
  title?: string;
  className?: string;
}

export function FormErrorSummary({ errors, title = "يرجى تصحيح الأخطاء التالية", className }: FormErrorSummaryProps) {
  if (errors.length === 0) return null;
  return (
    <Alert tone="error" title={title} className={className}>
      <ul className="list-disc ps-5 space-y-1">
        {errors.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
    </Alert>
  );
}
