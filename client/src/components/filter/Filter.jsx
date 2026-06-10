import { useState, useEffect } from "react";
import { UNIVERSITY_SUGGESTIONS, COLLEGE_SUGGESTIONS } from "../../lib/institutions";

function Filter({ onFilterChange }) {
  const [filters, setFilters] = useState({
    q: "",
    university: "",
    college: "",
    category: "",
    condition: "",
    exchangeType: "",
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClear = () => {
    const cleared = {
      q: "",
      university: "",
      college: "",
      category: "",
      condition: "",
      exchangeType: "",
    };
    setFilters(cleared);
  };

  return (
    <div className="mb-5 flex flex-col gap-4 rounded-lg bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      <div className="mb-1 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2.5">
        <h1 className="m-0 text-2xl font-medium text-slate-800">Search & filters</h1>
        <button
          type="button"
          className="rounded border border-violet-600 px-3 py-1.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50 max-md:self-end"
          onClick={handleClear}
        >
          Clear all
        </button>
      </div>
      <div className="mb-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium text-slate-600">
            Title, author, or campus
          </label>
          <input
            type="text"
            id="q"
            name="q"
            placeholder="Search"
            value={filters.q}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-4 max-md:flex-col">
        <div className="min-w-[120px] flex-1 max-md:w-full">
          <div className="flex flex-col gap-1.5">
          <label htmlFor="university" className="text-sm font-medium text-slate-600">University</label>
          <input
            type="text"
            id="university"
            name="university"
            list="filter-university-suggestions"
            placeholder="Filter by university"
            value={filters.university}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <datalist id="filter-university-suggestions">
            {UNIVERSITY_SUGGESTIONS.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
          </div>
        </div>
        <div className="min-w-[120px] flex-1 max-md:w-full">
          <div className="flex flex-col gap-1.5">
          <label htmlFor="college" className="text-sm font-medium text-slate-600">College</label>
          <input
            type="text"
            id="college"
            name="college"
            list="filter-college-suggestions"
            placeholder="Filter by college"
            value={filters.college}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <datalist id="filter-college-suggestions">
            {COLLEGE_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          </div>
        </div>
        <div className="min-w-[120px] flex-1 max-md:w-full">
          <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-slate-600">Category</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option value="">Any</option>
            <option value="Engineering">Engineering</option>
            <option value="Medical">Medical</option>
            <option value="Fiction">Fiction</option>
            <option value="Science">Science</option>
            <option value="Arts">Arts</option>
            <option value="Commerce">Commerce</option>
            <option value="Law">Law</option>
            <option value="Other">Other</option>
          </select>
          </div>
        </div>

        <div className="min-w-[120px] flex-1 max-md:w-full">
          <div className="flex flex-col gap-1.5">
          <label htmlFor="condition" className="text-sm font-medium text-slate-600">Condition</label>
          <select
            id="condition"
            name="condition"
            value={filters.condition}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option value="">Any</option>
            <option value="New">New</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
          </select>
          </div>
        </div>

        <div className="min-w-[120px] flex-1 max-md:w-full">
          <div className="flex flex-col gap-1.5">
          <label htmlFor="exchangeType" className="text-sm font-medium text-slate-600">Type</label>
          <select
            id="exchangeType"
            name="exchangeType"
            value={filters.exchangeType}
            onChange={handleInputChange}
            className="w-full rounded border border-slate-300 px-3 py-2.5 text-sm transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option value="">Any</option>
            <option value="exchange">Exchange</option>
            <option value="free">Free</option>
          </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filter;
