'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { Banner } from '@/lib/services/bannerService';
import { getStores, Store } from '@/lib/services/storeService';

interface HeroCarouselProps {
  initialBanners?: (Banner | null)[];
}

type Slide = {
  title: string;
  subtitle: string;
  logoUrl: string;
  href: string;
  discount?: string;
};

const ACCENTS = [
  'from-[#C7395F] to-[#d45678]',
  'from-[#d45678] to-[#C7395F]',
  'from-[#d45678] to-[#d45678]',
  'from-[#C7395F] to-[#d45678]',
  'from-[#d45678] to-[#d45678]',
];

function extractDomain(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getStoreLogo(store: Store): string {
  const domain = extractDomain(store.websiteUrl) || extractDomain(store.trackingLink);
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  if (store.logoUrl) return store.logoUrl;
  return '';
}

function storeToSlide(store: Store): Slide {
  const domain = extractDomain(store.websiteUrl) || extractDomain(store.trackingLink);
  const href = store.slug ? `/stores/${store.slug}` : store.id ? `/stores/${store.id}` : '/stores';
  return {
    title: store.name,
    subtitle: store.voucherText || store.description?.slice(0, 60) || 'Exclusive deals & coupons',
    logoUrl: getStoreLogo(store),
    href,
    discount: store.voucherText || undefined,
  };
}

function StoreLogo({
  src,
  name,
  size = 'lg',
}: {
  src: string;
  name: string;
  size?: 'sm' | 'lg';
}) {
  const box = size === 'lg' ? 'w-28 h-28 sm:w-36 sm:h-36' : 'w-16 h-16 sm:w-20 sm:h-20';
  const img = size === 'lg' ? 'max-h-20 sm:max-h-24 max-w-[85%]' : 'max-h-10 sm:max-h-12 max-w-[80%]';

  return (
    <div
      className={`${box} rounded-2xl bg-white shadow-lg border border-[#c9bdd6] flex items-center justify-center shrink-0`}
    >
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          className={`${img} object-contain`}
          loading="eager"
          decoding="async"
        />
      ) : (
        <span className="text-3xl font-extrabold text-[#C7395F]">{name.charAt(0)}</span>
      )}
    </div>
  );
}

export default function HeroCarousel({ initialBanners }: HeroCarouselProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [sideCards, setSideCards] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasBannerImage, setHasBannerImage] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState('');

  useEffect(() => {
    const buildSlides = async () => {
      try {
        const validBanner = (initialBanners || []).find(
          (b) => b?.imageUrl && b.imageUrl.length > 20 && !b.imageUrl.includes('favicons')
        );

        if (validBanner?.imageUrl) {
          setHasBannerImage(true);
          setBannerImageUrl(validBanner.imageUrl);
        }

        const stores = await getStores();
        const trending = stores.filter((s) => s.isTrending);
        const source = (trending.length >= 3 ? trending : stores).slice(0, 6);
        const storeSlides = source.map(storeToSlide).filter((s) => s.title);

        if (storeSlides.length === 0) {
          const fallbacks: Slide[] = [
            { title: 'Amazon', subtitle: 'Up to 40% off electronics', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128', href: '/stores' },
            { title: 'Nike', subtitle: '25% off sitewide', logoUrl: 'https://www.google.com/s2/favicons?domain=nike.com&sz=128', href: '/stores' },
            { title: 'Target', subtitle: '15% off home decor', logoUrl: 'https://www.google.com/s2/favicons?domain=target.com&sz=128', href: '/stores' },
          ];
          setSlides(fallbacks);
          setSideCards(fallbacks.slice(1, 3));
        } else {
          setSlides(storeSlides.slice(0, 5));
          const sides = storeSlides.slice(1, 3);
          setSideCards(sides.length >= 2 ? sides : storeSlides.slice(0, 2));
        }
      } catch {
        setSlides([]);
      } finally {
        setLoading(false);
      }
    };

    buildSlides();
  }, [initialBanners]);

  const goTo = useCallback(
    (dir: 'prev' | 'next') => {
      setActiveIndex((i) => {
        if (slides.length === 0) return 0;
        return dir === 'next' ? (i + 1) % slides.length : (i - 1 + slides.length) % slides.length;
      });
    },
    [slides.length]
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => goTo('next'), 6000);
    return () => clearInterval(timer);
  }, [slides.length, goTo]);

  if (loading) {
    return (
      <section className="bg-[#DED4E8] border-b border-[#c9bdd6] py-6">
        <div className="home-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 h-[220px] sm:h-[300px] bg-[#c9bdd6]/50 rounded-xl animate-pulse" />
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="h-[140px] bg-[#c9bdd6]/50 rounded-xl animate-pulse" />
              <div className="h-[140px] bg-[#c9bdd6]/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const current = slides[activeIndex] || slides[0];
  const accent = ACCENTS[activeIndex % ACCENTS.length];

  return (
    <section className="bg-[#DED4E8] border-b border-[#c9bdd6] py-6 sm:py-8">
      <div className="home-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main carousel */}
          <div className="lg:col-span-8 relative group">
            <Link
              href={current.href}
              className={`block relative h-[240px] sm:h-[300px] md:h-[320px] rounded-xl overflow-hidden bg-gradient-to-br ${accent}`}
            >
              {hasBannerImage && bannerImageUrl && (
                <img
                  src={bannerImageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                  aria-hidden
                />
              )}

              <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-10 gap-4">
                <div className="flex-1 min-w-0 z-10">
                  <span className="inline-flex items-center gap-1.5 text-[#C7395F] text-xs font-bold uppercase tracking-wider mb-2">
                    <Tag className="w-3.5 h-3.5" />
                    Featured Promotion
                  </span>
                  <h1 className="text-[#DED4E8] text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight truncate">
                    {current.title}
                  </h1>
                  <p className="text-[#DED4E8]/80 text-sm sm:text-base mt-2 line-clamp-2 max-w-md">
                    {current.subtitle}
                  </p>
                  {current.discount && (
                    <span className="inline-block mt-3 px-3 py-1 rounded-full bg-[#C7395F] text-white text-xs font-bold">
                      {current.discount}
                    </span>
                  )}
                  <span className="inline-flex mt-4 btn-cta text-sm">Shop Deals</span>
                </div>

                <div className="hidden sm:flex items-center justify-center pr-2 z-10">
                  <StoreLogo src={current.logoUrl} name={current.title} size="lg" />
                </div>
              </div>
            </Link>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); goTo('prev'); }}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-[#C7395F] shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); goTo('next'); }}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 text-[#C7395F] shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={(e) => { e.preventDefault(); setActiveIndex(i); }}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIndex ? 'w-6 bg-[#C7395F]' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Side promo cards */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-4">
            {sideCards.map((card, i) => (
              <Link
                key={`${card.title}-${i}`}
                href={card.href}
                className="relative flex-1 min-h-[140px] sm:min-h-[152px] rounded-xl overflow-hidden border border-[#c9bdd6] bg-[#c9bdd6]/40 hover:border-[#C7395F] hover:shadow-md transition-all group/card flex flex-col"
              >
                <div className="flex-1 flex items-center justify-center p-4 pt-5">
                  <StoreLogo src={card.logoUrl} name={card.title} size="sm" />
                </div>
                <div className="bg-[#C7395F] px-4 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-[#DED4E8] text-sm font-bold truncate">{card.title}</p>
                  {card.discount && (
                    <span className="text-[#C7395F] text-[10px] font-bold uppercase shrink-0">
                      Deal
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
