// Author: Sam Rivera
// Issue: #37 â€” Render toast notifications

import type { ToastMessage } from '../../hooks/useToast';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const toneClass = {
  success: 'border-green-300 bg-green-50 text-green-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-blue-300 bg-blue-50 text-blue-900',
};

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`block w-80 rounded border px-4 py-3 text-left text-sm shadow ${toneClass[toast.tone]}`}
          onClick={() => onDismiss(toast.id)}
          type="button"
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
