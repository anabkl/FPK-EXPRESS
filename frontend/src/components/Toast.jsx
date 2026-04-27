import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-fresh",
    borderClass: "border-emerald-200",
  },
  error: {
    icon: AlertTriangle,
    iconClass: "bg-red-50 text-red-600",
    borderClass: "border-red-200",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-softOrange text-primary",
    borderClass: "border-orange-200",
  },
  info: {
    icon: Info,
    iconClass: "bg-slate-100 text-slate-600",
    borderClass: "border-slate-200",
  },
};

export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4200 }) => {
      const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      setToasts((items) => [...items, { id, type, title, message }].slice(-4));
      window.setTimeout(() => removeToast(id), duration);
      return id;
    },
    [removeToast]
  );

  return { toasts, showToast, removeToast };
}

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed inset-x-4 top-4 z-[70] flex flex-col gap-3 sm:left-auto sm:right-5 sm:w-96">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-lg border bg-white p-4 shadow-soft ${style.borderClass}`}
              role="status"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-navy">{toast.title}</p>
                  {toast.message && <p className="mt-1 text-sm font-medium leading-5 text-slate-600">{toast.message}</p>}
                </div>
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-navy"
                  aria-label="Fermer la notification"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
