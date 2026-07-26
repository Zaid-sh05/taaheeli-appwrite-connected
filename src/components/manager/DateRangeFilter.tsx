import { Input } from "@/components/ui/Input";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="from-date" className="block text-sm font-semibold text-neutral-600 mb-1">من تاريخ</label>
        <Input id="from-date" type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="min-w-[150px]" />
      </div>
      <div>
        <label htmlFor="to-date" className="block text-sm font-semibold text-neutral-600 mb-1">إلى تاريخ</label>
        <Input id="to-date" type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="min-w-[150px]" />
      </div>
    </div>
  );
}
