// Toast Component
// Surgical: Only handles notifications

import { useToast } from "../hooks";

export default function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 1000, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${toast.type || ""}`}
          style={{ animation: "slideIn 0.3s ease" }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}