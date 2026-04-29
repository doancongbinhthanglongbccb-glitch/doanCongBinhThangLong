import { Loader2 } from "lucide-react";

type Props = {
  saving: boolean;
  dirty: boolean;
  lastSavedAt: number | null;
  error: string | null;
  onRetry?: () => void;
};

export default function SaveStateIndicator({ saving, dirty, lastSavedAt, error, onRetry }: Props) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Saving...
      </span>
    );
  }

  if (error) {
    return (
      <span className="inline-flex items-center gap-2 text-xs font-medium text-red-700">
        Error saving
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded px-1.5 py-0.5 text-xs font-semibold text-red-700 underline"
          >
            Retry
          </button>
        ) : null}
      </span>
    );
  }

  if (dirty) {
    return <span className="text-xs font-medium text-slate-500">Unsaved changes</span>;
  }

  if (lastSavedAt) {
    return <span className="text-xs font-medium text-emerald-700">Saved</span>;
  }

  return <span className="text-xs font-medium text-slate-400">—</span>;
}
