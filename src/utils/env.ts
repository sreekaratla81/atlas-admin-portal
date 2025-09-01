export function getAllowedEmails(): string[] {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  } catch {
    // fallback to CSV
  }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
