import { useEffect } from "react";
import { useAppStore } from "@/stores/app-store";

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts);
  const dismissToast = useAppStore((state) => state.dismissToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3600),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismissToast, toasts]);

  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className="toast-card"
        >
          <strong>{toast.title}</strong>
          <p>{toast.description}</p>
        </article>
      ))}
    </div>
  );
}
