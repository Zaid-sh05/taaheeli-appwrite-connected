import { Select } from "@/components/ui/Select";

interface FilterOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  label?: string;
}

export function StatusFilter({ value, onChange, options, label = "تصفية" }: StatusFilterProps) {
  return (
    <div className="min-w-[150px]">
      <label htmlFor="status-filter" className="sr-only">{label}</label>
      <Select id="status-filter" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </div>
  );
}
