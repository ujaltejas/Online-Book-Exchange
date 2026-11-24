import { LuSearch } from "react-icons/lu";
import { ChoiceGroup, Field } from "../ui/Form";
import { CAMPUS_SUGGESTIONS, CATEGORIES, CONDITIONS, EXCHANGE_TYPES, categoryStyle } from "../../lib/constants";

export default function FilterPanel({ text, onText, filters, onFilter, onClear, hasFilters }) {
  return (
    <div className="space-y-6">
      <Field label="Search" htmlFor="f-q">
        <div className="relative">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input id="f-q" type="search" className="input pl-9" placeholder="Title, author or campus" value={text.q} onChange={(e) => onText("q", e.target.value)} />
        </div>
      </Field>

      <Field label="University" htmlFor="f-uni">
        <input id="f-uni" list="f-campus-list" className="input" placeholder="e.g. IIT Bombay" value={text.university} onChange={(e) => onText("university", e.target.value)} />
        <datalist id="f-campus-list">{CAMPUS_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
      </Field>

      <Field label="College or department" htmlFor="f-college">
        <input id="f-college" className="input" placeholder="e.g. Computer Science" value={text.college} onChange={(e) => onText("college", e.target.value)} />
      </Field>

      <fieldset>
        <legend className="label">Category</legend>
        <div className="flex flex-col">
          {[{ value: "", label: "All categories" }, ...CATEGORIES.map((c) => ({ value: c, label: c }))].map((o) => {
            const active = filters.category === o.value;
            return (
              <label key={o.value || "all"} className={`flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-1.5 text-[15px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brass ${active ? "bg-lamp-tint font-semibold" : "hover:bg-lamp-tint/60"}`}>
                <input type="radio" name="category" className="sr-only" checked={active} onChange={() => onFilter("category", o.value)} />
                <span className="h-4 w-1.5 rounded-sm" style={{ background: o.value ? categoryStyle(o.value).bg : "var(--color-line)" }} aria-hidden="true" />
                {o.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <ChoiceGroup legend="Condition" name="f-condition" allowAny value={filters.condition} onChange={(v) => onFilter("condition", v)} options={CONDITIONS.map((c) => ({ value: c, label: c }))} />
      <ChoiceGroup legend="Type" name="f-type" allowAny value={filters.exchangeType} onChange={(v) => onFilter("exchangeType", v)} options={EXCHANGE_TYPES} />

      <label className="flex cursor-pointer items-center gap-3 text-[15px]">
        <input type="checkbox" className="h-4 w-4 accent-[#1f5c47]" checked={filters.status === "available"} onChange={(e) => onFilter("status", e.target.checked ? "available" : "")} />
        Only show available books
      </label>

      {hasFilters && (
        <button type="button" className="btn btn-ghost w-full" onClick={onClear}>Clear all filters</button>
      )}
    </div>
  );
}
