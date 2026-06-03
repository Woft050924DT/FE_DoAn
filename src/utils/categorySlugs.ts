/** Map shortcut ?cat=nam → slug trong DB (seed: dong-ho-nam, dong-ho-nu) */
export const CATEGORY_CAT_TO_SLUG: Record<string, string> = {
  nam: 'dong-ho-nam',
  nu: 'dong-ho-nu',
  smartwatch: 'smartwatch',
};

export function resolveCategorySlugFromSearchParams(
  categoryId: string | null,
  cat: string | null,
  categorySlug: string | null
): { category_id?: string; category_slug?: string } {
  if (categoryId) return { category_id: categoryId };
  if (categorySlug) return { category_slug: categorySlug };
  if (cat) {
    const slug = CATEGORY_CAT_TO_SLUG[cat.toLowerCase()] || cat;
    return { category_slug: slug };
  }
  return {};
}
