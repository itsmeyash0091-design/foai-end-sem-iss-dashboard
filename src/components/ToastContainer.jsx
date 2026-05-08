import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} pointer-events-auto`}
          >
            <Icon size={18} className="flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
