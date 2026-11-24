export function Field({ label, htmlFor, error, hint, optional, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {optional && <span className="ml-1.5 font-normal text-ink-soft">(optional)</span>}
        </label>
      )}
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

/** A group of mutually exclusive choices rendered as chips (real radio inputs underneath). */
export function ChoiceGroup({ legend, name, value, onChange, options, allowAny = false }) {
  const items = allowAny ? [{ value: "", label: "Any" }, ...options] : options;
  return (
    <fieldset>
      {legend && <legend className="label">{legend}</legend>}
      <div className="flex flex-wrap gap-2">
        {items.map((o) => {
          const active = value === o.value;
          return (
            <label
              key={o.value || "any"}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brass ${
                active ? "border-lamp bg-lamp text-white" : "border-line bg-white text-ink hover:border-ink"
              }`}
            >
              <input type="radio" className="sr-only" name={name} value={o.value} checked={active} onChange={() => onChange(o.value)} />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
