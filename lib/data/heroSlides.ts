import type { Banner } from '@/lib/services/bannerService';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  accent: 'red' | 'orange' | 'brown';
}

export const ACCENT_STYLES = {
  red: {
    ring: 'border-[#C7395F]/30',
    glow: 'from-[#C7395F]/20 to-transparent',
    pill: 'bg-[#C7395F]/10 text-[#C7395F] border-[#C7395F]/25',
    blob: 'bg-[#C7395F]/[0.08]',
  },
  orange: {
    ring: 'border-[#C7395F]/35',
    glow: 'from-[#C7395F]/25 to-transparent',
    pill: 'bg-[#C7395F]/12 text-[#d45678] border-[#C7395F]/30',
    blob: 'bg-[#C7395F]/[0.1]',
  },
  brown: {
    ring: 'border-[#d45678]/35',
    glow: 'from-[#d45678]/20 to-transparent',
    pill: 'bg-[#d45678]/12 text-[#d45678] border-[#d45678]/30',
    blob: 'bg-[#d45678]/[0.08]',
  },
} as const;

export const defaultHeroSlides: HeroSlide[] = [
  {
    id: 'fashion',
    eyebrow: 'Editor\'s Pick',
    headline: 'Your wardrobe deserves',
    highlight: 'better prices',
    description: 'Hand-verified fashion codes from H&M, Nike & top brands — updated every morning.',
    ctaText: 'Shop Fashion Deals',
    ctaHref: '/coupons',
    imageUrl: '/og-image.svg',
    imageAlt: 'Fashion savings',
    badge: '50% OFF',
    accent: 'red',
  },
  {
    id: 'tech',
    eyebrow: 'This Week',
    headline: 'Tech gear at',
    highlight: 'smarter prices',
    description: 'Laptops, phones & smart home — exclusive promo codes, zero guesswork.',
    ctaText: 'Browse Tech Deals',
    ctaHref: '/coupons',
    imageUrl: '/favicon.svg',
    imageAlt: 'Tech deals',
    badge: 'HOT',
    accent: 'orange',
  },
  {
    id: 'stores',
    eyebrow: '500+ Stores',
    headline: 'Every shop you love,',
    highlight: 'one place',
    description: 'Starbucks to eBay — find verified coupons without jumping between sites.',
    ctaText: 'Explore All Stores',
    ctaHref: '/stores',
    imageUrl: '/og-image.svg',
    imageAlt: 'All stores',
    badge: 'NEW',
    accent: 'brown',
  },
  {
    id: 'shipping',
    eyebrow: 'Limited Time',
    headline: 'Free shipping plus',
    highlight: 'extra savings',
    description: 'Stack delivery offers with sitewide codes for maximum checkout savings.',
    ctaText: 'Claim Free Shipping',
    ctaHref: '/coupons',
    imageUrl: '/favicon.svg',
    imageAlt: 'Free shipping',
    badge: 'FREE',
    accent: 'orange',
  },
];

export const quickLinks = [
  { label: 'Top Coupons', href: '/coupons' },
  { label: 'All Stores', href: '/stores' },
  { label: 'Categories', href: '/categories' },
  { label: 'Starbucks', href: '/stores/starbucks' },
];

const CMS_DESCRIPTIONS = [
  'Exclusive verified deals — save more on every purchase.',
  'Limited-time offers from top brands. Act fast!',
  'Hand-picked promotions updated throughout the day.',
];

export function resolveHeroSlides(banners?: (Banner | null)[]): HeroSlide[] {
  const cms = (banners ?? [])
    .filter((b): b is Banner => Boolean(b?.imageUrl && b.imageUrl.length > 10))
    .map((banner, i) => ({
      id: banner.id ?? `cms-${i}`,
      eyebrow: 'Featured',
      headline: banner.title || defaultHeroSlides[i]?.headline || 'Save more on',
      highlight: defaultHeroSlides[i]?.highlight || 'every order',
      description: CMS_DESCRIPTIONS[i] ?? CMS_DESCRIPTIONS[0],
      ctaText: defaultHeroSlides[i]?.ctaText ?? 'Shop Now',
      ctaHref: defaultHeroSlides[i]?.ctaHref ?? '/coupons',
      imageUrl: banner.imageUrl,
      imageAlt: banner.title || 'Promotion',
      badge: 'DEAL',
      accent: defaultHeroSlides[i]?.accent ?? 'red',
    }));

  if (cms.length >= 3) return cms.slice(0, 4);

  return defaultHeroSlides.map((slide, i) => {
    const c = cms[i];
    if (!c) return slide;
    return { ...slide, headline: c.headline || slide.headline, imageUrl: c.imageUrl, imageAlt: c.imageAlt };
  });
}
