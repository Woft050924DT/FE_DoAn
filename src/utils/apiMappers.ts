import type { CartItem } from '../services/types';

export const toNumber = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  return Number(value);
};

/** Loại URL ảnh trùng, giữ thứ tự */
export const uniqueImageUrls = (urls: string[], fallback?: string): string[] => {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const u of urls) {
    const url = u?.trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push(url);
  }
  if (out.length === 0 && fallback?.trim()) return [fallback.trim()];
  return out;
};

export const mapProductCard = (apiProduct: any) => {
  const price = toNumber(apiProduct.price);
  const comparePrice = toNumber(apiProduct.compare_price);
  const reviews = apiProduct.product_reviews || [];

  return {
    id: apiProduct.product_id,
    name: apiProduct.name,
    brand: apiProduct.brands?.name || '',
    category: apiProduct.categories?.name || '',
    category_id: apiProduct.category_id || apiProduct.categories?.category_id,
    brand_id: apiProduct.brand_id || apiProduct.brands?.brand_id,
    sku: apiProduct.sku,
    price,
    comparePrice: comparePrice || undefined,
    image: (() => {
      const sorted = [...(apiProduct.product_images || [])].sort(
        (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
      const primary = sorted.find((img: any) => img.is_primary)?.image_url;
      const first = sorted[0]?.image_url;
      return (
        primary ||
        first ||
        'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80'
      );
    })(),
    images: uniqueImageUrls(
      [...(apiProduct.product_images || [])]
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img: any) => img.image_url)
        .filter(Boolean)
    ),
    variants: apiProduct.product_variants || [],
    defaultVariantId:
      (apiProduct.product_variants || []).find((v: any) => v.is_active !== false)?.variant_id ||
      apiProduct.product_variants?.[0]?.variant_id ||
      null,
    rating:
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 4.5,
    reviewCount: reviews.length,
    sold: apiProduct.view_count || 0,
    stock:
      apiProduct.product_variants?.reduce(
        (sum: number, v: any) => sum + (v.stock_quantity || 0),
        0
      ) || 99,
    badge: apiProduct.new_arrival ? 'NEW' : apiProduct.best_seller ? 'HOT' : comparePrice > price ? 'SALE' : null,
    discount: comparePrice > price ? Math.round((1 - price / comparePrice) * 100) : 0,
    featured: apiProduct.featured,
    status: apiProduct.status,
    description: apiProduct.description || apiProduct.short_description || '',
  };
};

export const mapCartItemUi = (item: CartItem) => {
  const price = toNumber(item.price ?? item.product_variants?.price ?? item.products?.price);

  return {
    id: item.cart_item_id,
    cart_item_id: item.cart_item_id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    name: item.products?.name || '',
    image:
      item.products?.product_images?.[0]?.image_url ||
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=200&q=80',
    price,
    compare_price: toNumber(item.products?.compare_price),
    variant_name: item.product_variants?.name || '',
    quantity: item.quantity,
    maxStock: item.product_variants?.stock_quantity ?? 0,
    selected: true,
  };
};
