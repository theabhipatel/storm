// ASCII-only kebab-case slug. Strips diacritics so
// "Acer Aspire 5 (2024)" → "acer-aspire-5-2024".
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
