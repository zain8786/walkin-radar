const IST = "Asia/Kolkata";

/** Today's date in India as YYYY-MM-DD. */
export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Tomorrow's date in India as YYYY-MM-DD. */
export function tomorrowIST(now: Date = new Date()): string {
  const today = todayIST(now);
  const [y, m, d] = today.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1));
  return next.toISOString().slice(0, 10);
}

export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString("en-IN", {
    timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

export function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [h, min] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  return `${hour12}:${String(min).padStart(2, "0")} ${suffix}`;
}

export function formatTimestamp(iso: string | null): string {
  if (!iso) return "Not yet verified";
  return new Date(iso).toLocaleString("en-IN", { timeZone: IST, day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST";
}
