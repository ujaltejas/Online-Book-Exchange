import { LuCheck, LuCircleAlert, LuX } from "react-icons/lu";
import { useToastStore } from "../../store/useToastStore";

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-lamp-tint ${className}`} aria-hidden="true" />;
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {Icon && <Icon className="mx-auto h-9 w-9 text-lamp" aria-hidden="true" />}
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {children && <p className="mx-auto mt-1.5 max-w-md text-[15px] text-ink-soft">{children}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-danger/30 bg-danger-tint px-6 py-10 text-center">
      <LuCircleAlert className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
      <h3 className="mt-3 text-lg font-bold">We could not load this</h3>
      <p className="mx-auto mt-1 max-w-md text-[15px] text-ink-soft">{message}</p>
      {onRetry && (
        <button className="btn btn-ghost mt-5" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${
            t.type === "error" ? "bg-danger text-white" : "bg-ink text-white"
          }`}
        >
          {t.type === "error" ? <LuCircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <LuCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss message" className="opacity-70 hover:opacity-100">
            <LuX className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
