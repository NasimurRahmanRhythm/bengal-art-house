// Date labels shared by the forms that take an opening and a closing date
// (exhibitions, collaborations). Stored alongside the dates as display text,
// so the public pages never have to format anything.

/** "14 August — 4 September 2025", collapsing whatever the two dates share. */
export function formatRange(start: string, end: string): string {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const day = (d: Date) => d.getDate();
  const month = (d: Date) => d.toLocaleDateString("en-GB", { month: "long" });
  const year = (d: Date) => d.getFullYear();

  if (start === end || !end) return `${day(s)} ${month(s)} ${year(s)}`;
  if (year(s) === year(e) && month(s) === month(e))
    return `${day(s)}–${day(e)} ${month(e)} ${year(e)}`;
  if (year(s) === year(e)) return `${day(s)} ${month(s)} — ${day(e)} ${month(e)} ${year(e)}`;
  return `${day(s)} ${month(s)} ${year(s)} — ${day(e)} ${month(e)} ${year(e)}`;
}
