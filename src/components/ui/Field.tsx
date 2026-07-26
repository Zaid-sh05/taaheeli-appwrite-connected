import { useId, type ReactNode } from "react";
import { Label } from "./Label";
import { Input } from "./Input";
import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children?: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, required, error, hint, children, className }: FieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("mb-4", className)}>
      <Label htmlFor={id} required={required}>{label}</Label>
      {children ?? <Input id={id} hasError={!!error} aria-describedby={describedBy} aria-invalid={!!error} />}
      {hint && !error && <p id={hintId} className="mt-1 text-sm text-neutral-600">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-1 text-sm font-semibold text-error-700">{error}</p>}
    </div>
  );
}
