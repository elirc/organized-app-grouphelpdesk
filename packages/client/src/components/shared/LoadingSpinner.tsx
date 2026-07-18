// Author: Sam Rivera
// Issue: #37 â€” Reusable loading indicator

export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-600" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-focus" />
      Loading
    </div>
  );
}
