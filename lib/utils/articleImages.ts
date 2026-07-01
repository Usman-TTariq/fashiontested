import { BLOG_CATEGORIES, type BlogCategory } from '@/lib/utils/articleMeta'

export function buildUnsplashUrl(photoId: string, width = 900): string {
  const id = photoId.startsWith('photo-') ? photoId : `photo-${photoId}`
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`
}

/** Verified Unsplash fallbacks when featured_image_url is missing or broken. */
export const CATEGORY_FALLBACK_IMAGES: Record<BlogCategory, string> = {
  FASHION: buildUnsplashUrl('photo-1490481651871-ab68de25d43d'),
  LIFESTYLE: buildUnsplashUrl('photo-1586023492125-27b2c045efd7'),
  BEAUTY: buildUnsplashUrl('photo-1616394584738-fc6e612e71b9'),
  TRAVEL: buildUnsplashUrl('photo-1613395877344-13d4a8e0d49e'),
  HEALTH: buildUnsplashUrl('photo-1534438327276-14e5300c3a48'),
  ENTERTAINMENT: buildUnsplashUrl('photo-1485846234645-a62644f84728'),
  FOOD: buildUnsplashUrl('photo-1490645935967-10de6ba17061'),
}

const DEFAULT_FALLBACK = CATEGORY_FALLBACK_IMAGES.LIFESTYLE

export function resolveArticleImageUrl(
  imageUrl?: string | null,
  category?: string | null
): string {
  const trimmed = imageUrl?.trim()
  if (trimmed) return trimmed

  const key = category?.toUpperCase() as BlogCategory | undefined
  if (key && key in CATEGORY_FALLBACK_IMAGES) {
    return CATEGORY_FALLBACK_IMAGES[key]
  }

  return DEFAULT_FALLBACK
}

export function getCategoryFallbackImage(category?: string | null): string {
  return resolveArticleImageUrl(null, category)
}
