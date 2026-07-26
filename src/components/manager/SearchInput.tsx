import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchInput({ value, onChange, placeholder = "بحث...", label = "بحث" }: SearchInputProps) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <label htmlFor="search-input" className="sr-only">{label}</label>
      <Input
        id="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ps-3 pe-12"
        type="search"
      />
      <span className="absolute inset-y-0 end-0 inline-flex items-center justify-center px-3 text-neutral-400 pointer-events-none">
        <Search className="h-5 w-5" aria-hidden="true" />
      </span>
    </div>
  );
}
