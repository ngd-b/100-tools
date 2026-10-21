export function normalizeFavorites(
  raw: string | null,
  validIds: ReadonlySet<string>,
  aliases: Record<string, string>,
): string[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.flatMap((id: unknown) => {
      if (typeof id !== "string") return [];
      const resolved = Object.hasOwn(aliases, id) ? aliases[id] : id;
      return validIds.has(resolved) ? [resolved] : [];
    }))];
  } catch {
    return [];
  }
}
