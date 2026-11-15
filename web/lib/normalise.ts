/** Lowercase and strip everything but letters and digits, so "B.Tech", "B Tech" and "btech" match. */
export function norm(value: string | null | undefined): string {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
