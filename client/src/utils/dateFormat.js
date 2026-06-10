/**
 * Format a date as dd/mm/yyyy (local calendar date).
 * @param {string|number|Date} value
 * @returns {string} e.g. "29/03/2026", or "—" if invalid
 */
export function formatDateDDMMYYYY(value) {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Same as dd/mm/yyyy plus 24h time for reports/logs.
 * @param {string|number|Date} value
 * @returns {string}
 */
export function formatDateTimeDDMMYYYY(value) {
  if (value == null || value === "") return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const date = formatDateDDMMYYYY(d);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${date} ${h}:${m}:${s}`;
}
