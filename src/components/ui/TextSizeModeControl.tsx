import { useTextSizeMode } from "@/context/TextSizeModeContext";
import { TEXT_SIZE_MODES } from "@/tokens/a11y";
import { cn } from "@/lib/cn";
import { useSession } from "@/context/SessionContext";
import { ROLES } from "@/config/roles";
import type { Audience } from "@/config/roles";

const audienceMinTarget: Record<Audience, string> = {
  staff: "min-h-[48px]",
  "patient-family": "min-h-[56px]",
};

export function TextSizeModeControl() {
  const { mode, setMode } = useTextSizeMode();
  const { session, selectedRole } = useSession();
  const role = session?.role ?? selectedRole ?? "manager";
  const audience: Audience = ROLES[role]?.audience ?? "staff";

  return (
    <div className="flex items-center gap-2" role="group" aria-label="حجم النص">
      <span className="text-sm font-semibold text-neutral-700 hidden sm:inline">حجم النص:</span>
      <div className="inline-flex rounded-lg border-2 border-neutral-200 overflow-hidden">
        {TEXT_SIZE_MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            aria-pressed={mode === m.key}
            className={cn(
              "px-3 text-sm font-semibold transition-colors",
              audienceMinTarget[audience],
              mode === m.key
                ? "bg-primary-600 text-white"
                : "bg-white text-neutral-700 hover:bg-neutral-50",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
