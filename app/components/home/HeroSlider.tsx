'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Zap, Store } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, A11y, EffectFade } from 'swiper/modules';
import type { Banner } from '@/lib/services/bannerService';
import {
  ACCENT_STYLES,
  quickLinks,
  resolveHeroSlides,
  type HeroSlide,
} from '@/lib/data/heroSlides';
import BrandLogo from '@/app/components/BrandLogo';

import 'swiper/css';
import 'swiper/css/effect-fade';

interface HeroSliderProps {
  initialBanners?: (Banner | null)[];
}

function SlideVisual({ slide, priority }: { slide: HeroSlide; priority?: boolean }) {
  const accent = ACCENT_STYLES[slide.accent];

  return (
    <div className="relative mx-auto flex h-[260px] w-full max-w-[300px] items-center justify-center sm:h-[300px] lg:max-w-none">
      {/* Rotating orbit ring */}
      <div
        className={`absolute h-[240px] w-[240px] rounded-full border-2 border-dashed sm:h-[280px] sm:w-[280px] ${accent.ring} hero-orbit-ring`}
        aria-hidden
      />

      {/* Glow */}
      <div className={`absolute h-40 w-40 rounded-full ${accent.glow} opacity-60 blur-2xl`} aria-hidden />

      {/* Center showcase */}
      <div className="relative z-10 flex h-44 w-44 items-center justify-center rounded-3xl border border-tan bg-white p-6 shadow-2xl shadow-brand-red//10 sm:h-52 sm:w-52 hero-float-card">
        <img
          src={slide.imageUrl}
          alt={slide.imageAlt}
          className="max-h-full max-w-full object-contain"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          width={200}
          height={200}
        />
      </div>

      {/* Floating badge */}
      {slide.badge && (
        <div className="absolute -right-1 top-6 z-20 rotate-6 rounded-xl bg-brand-red px-3 py-2 text-xs font-black uppercase tracking-wide text-white shadow-lg shadow-brand-red//40 hero-float-badge">
          {slide.badge}
        </div>
      )}

      {/* Orbit chips */}
      <div className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-tan bg-white px-2.5 py-1 text-[10px] font-bold text-brand-red shadow-sm hero-orbit-chip-1">
        Verified
      </div>
      <div className="absolute bottom-4 right-0 z-20 rounded-full border border-tan bg-white px-2.5 py-1 text-[10px] font-bold text-brand-red shadow-sm hero-orbit-chip-2">
        Daily updates
      </div>
    </div>
  );
}

function SlideContent({
  slide,
  isFirst,
  priority,
}: {
  slide: HeroSlide;
  isFirst?: boolean;
  priority?: boolean;
}) {
  const Heading = isFirst ? 'h1' : 'h2';
  const accent = ACCENT_STYLES[slide.accent];

  return (
    <div className="grid min-h-[420px] grid-cols-1 items-center gap-8 px-6 py-8 sm:min-h-[440px] sm:px-10 sm:py-10 lg:grid-cols-2 lg:gap-12 lg:px-12">
      {/* Copy */}
      <div className="order-2 lg:order-1">
        <span className={`mb-4 inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest ${accent.pill}`}>
          {slide.eyebrow}
        </span>

        <Heading className="mb-4 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight text-brand-red">
          {slide.headline}{' '}
          <span className="bg-gradient-to-r from-brand-red to-brand-red bg-clip-text text-transparent">
            {slide.highlight}
          </span>
        </Heading>

        <p className="mb-7 max-w-md text-base leading-relaxed text-[#99998A]">
          {slide.description}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={slide.ctaHref} className="btn-cta inline-flex items-center gap-2 px-6 py-3.5 text-sm">
            {slide.ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-red underline-offset-4 hover:text-brand-red hover:underline"
          >
            Browse stores
          </Link>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex flex-wrap gap-4 border-t border-tan pt-6">
          {[
            { icon: ShieldCheck, text: 'Verified codes' },
            { icon: Zap, text: 'Updated daily' },
            { icon: Store, text: '500+ stores' },
          ].map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs font-semibold text-brand-red">
              <Icon className="h-3.5 w-3.5 text-brand-red" />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Visual */}
      <div className="order-1 lg:order-2">
        <SlideVisual slide={slide} priority={priority} />
      </div>
    </div>
  );
}

export default function HeroSlider({ initialBanners }: HeroSliderProps) {
  const slides = useMemo(() => resolveHeroSlides(initialBanners), [initialBanners]);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) return null;

  const progress = ((activeIndex + 1) / slides.length) * 100;

  return (
    <section className="hero-spotlight relative overflow-hidden border-b border-tan bg-white py-6 sm:py-10">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="hero-blob hero-blob-1 absolute -left-24 top-0 h-72 w-72 rounded-full bg-brand-red/[0.07] blur-3xl" />
        <div className="hero-blob hero-blob-2 absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand-red/[0.06] blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHNhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNFNUQ3QjkiIG9wYWNpdHk9IjAuNSIvPjwvcGF0dGVybj48L3N0YXN1cmU+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-40" />
      </div>

      <div className="home-container relative">
        {/* Main spotlight card */}
        <div className="relative overflow-hidden rounded-3xl border border-tan bg-white/80 shadow-xl shadow-brand-red//[0.06] backdrop-blur-sm">
          {/* Top bar */}
          <div className="flex items-center justify-between border-b border-tan/80 px-5 py-3 sm:px-8">
            <div className="flex items-center gap-2">
              <img src="/favicon.svg" alt="" className="h-7 w-7" aria-hidden />
              <BrandLogo className="text-sm font-extrabold text-brand-red" accentClassName="text-brand-accent" />
              <span className="hidden rounded-full bg-brand-red/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-red sm:inline">
                Deals Spotlight
              </span>
            </div>

            {slides.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  ref={prevRef}
                  type="button"
                  aria-label="Previous slide"
                  className="hero-spotlight-prev flex h-8 w-8 items-center justify-center rounded-full border border-tan bg-white text-brand-red transition hover:border-brand-red hover:text-brand-red"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  ref={nextRef}
                  type="button"
                  aria-label="Next slide"
                  className="hero-spotlight-next flex h-8 w-8 items-center justify-center rounded-full border border-tan bg-white text-brand-red transition hover:border-brand-red hover:text-brand-red"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <Swiper
            modules={[Autoplay, Navigation, A11y, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            slidesPerView={1}
            loop={slides.length > 1}
            speed={800}
            autoplay={
              slides.length > 1
                ? { delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }
                : false
            }
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onBeforeInit={(swiper) => {
              if (typeof swiper.params.navigation === 'object' && swiper.params.navigation) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
            }}
            onSwiper={(swiper) => {
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="hero-spotlight-swiper"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                <div className="group">
                  <SlideContent slide={slide} isFirst={index === 0} priority={index === 0} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Progress bar */}
          {slides.length > 1 && (
            <div className="px-5 pb-4 sm:px-8">
              <div className="h-1 overflow-hidden rounded-full bg-tan">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-red to-brand-red transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-right text-[10px] font-bold tabular-nums text-[#99998A]">
                {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </p>
            </div>
          )}
        </div>

        {/* Quick links strip */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-5 sm:gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#99998A]">Jump to:</span>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-tan bg-white px-4 py-1.5 text-xs font-bold text-brand-red shadow-sm transition hover:border-brand-red hover:text-brand-red hover:shadow-md"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
