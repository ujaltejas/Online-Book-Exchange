import { useEffect, useRef } from "react";

/** Confirmation dialog built on the native <dialog>, which gives focus trapping and Esc handling for free. */
export default function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", danger = false, busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => e.target === ref.current && !busy && onCancel()}
      className="m-auto w-[min(92vw,26rem)] rounded-lg bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/50"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="mt-2 text-[15px] leading-relaxed text-ink-soft">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
