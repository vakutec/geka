export function euToCents(input: string): number | null {
  if (!input) return null;
  const normalized = input.trim().replace(/\s+/g, "").replace(",", ".");
  const num = Number(normalized);
  if (!Number.isFinite(num)) return null;
  const cents = Math.round(num * 100);
  if (cents <= 0) return null;
  return cents;
}