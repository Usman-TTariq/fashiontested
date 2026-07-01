'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getBannerByLayoutPosition, Banner } from '@/lib/services/bannerService';
import { getStores, Store } from '@/lib/services/storeService';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import {
  Filter,
  Store as StoreIcon,
  Sparkles,
  Shield,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

const STORES_PER_PAGE = 24;

const getStoreFaviconUrl = (store: Store): string => {
  if (store.logoUrl) return store.logoUrl;
  let domain = '';
  if (store.websiteUrl) {
    try {
      domain = new URL(store.websiteUrl).hostname.replace('www.', '');
    } catch {
      /* ignore */
    }
  } else if (store.trackingLink) {
    try {
      domain = new URL(store.trackingLink).hostname.replace('www.', '');
    } catch {
      /* ignore */
    }
  }
  if (!domain && store.name) {
    const nameLower = store.name.toLowerCase();
    domain = nameLower.includes('.') ? nameLower.replace(/\s+/g, '') : `${nameLower.replace(/\s+/g, '')}.com`;
  }
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';
};

function storeHref(store: Store) {
  return store.slug ? `/stores/${store.slug}` : store.id ? `/stores/${store.id}` : '/stores';
}

function deduplicateStores(storesList: Store[]): Store[] {
  const map = new Map<string, Store>();
  for (const store of storesList) {
    const key = store.slug || store.name.toLowerCase().replace(/\s+/g, '-');
    const existing = map.get(key);
    if (!existing || (!existing.logoUrl && store.logoUrl)) {
      map.set(key, store);
    }
  }
  return Array.from(map.values());
}

function StoreCard({ store }: { store: Store }) {
  const logo = getStoreFaviconUrl(store);
  return (
    <Link
      href={storeHref(store)}
      className="deal-card group flex flex-col h-full overflow-hidden hover:border-brand-navy/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2 p-3 pb-0">
        {store.isTrending ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-brand-cyan/25 px-2 py-0.5 rounded">
            <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
            Featured
          </span>
        ) : (
          <span />
        )}
      </div>
      <div className="flex items-center justify-center h-16 sm:h-20 px-4">
        {logo ? (
          <img
            src={logo}
            alt={store.name}
            className="max-h-14 max-w-[85%] object-contain group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-2xl font-bold text-brand-navy">{store.name.charAt(0)}</span>
        )}
      </div>
      <div className="px-3 pb-3 pt-1 mt-auto text-center">
        <h3 className="text-sm font-bold text-brand-navy line-clamp-2 group-hover:text-brand-navy-dark">
          {store.name}
        </h3>
        {store.voucherText && (
          <span className="inline-block mt-2 text-[10px] font-bold text-white bg-brand-navy px-2.5 py-1 rounded-full line-clamp-1">
            {store.voucherText}
          </span>
        )}
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  total,
  perPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  perPage: number;
}) {
  if (totalPages <= 1) return null;

  const go = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, total);

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-tan pt-8">
      <p className="text-sm text-brand-muted">
        Showing <span className="font-semibold text-brand-navy">{start}–{end}</span> of{' '}
        <span className="font-semibold text-brand-navy">{total}</span> stores
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold border border-tan bg-white text-brand-navy disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand-navy/40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const show =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);
            if (!show) {
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 py-2 text-brand-muted text-sm">
                    …
                  </span>
                );
              }
              return null;
            }
            return (
              <button
                key={page}
                type="button"
                onClick={() => go(page)}
                className={`min-w-[2.5rem] px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-brand-navy text-brand-cyan shadow-sm'
                    : 'bg-white border border-tan text-brand-navy hover:border-brand-navy/40'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold bg-brand-navy text-brand-cyan disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-navy-dark transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function StoresPage() {
  const [banner10, setBanner10] = useState<Banner | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bannerData, storesData] = await Promise.all([
          getBannerByLayoutPosition(10),
          getStores(),
        ]);
        setBanner10(bannerData);
        setStores(deduplicateStores(storesData));
      } catch (error) {
        console.error('Error fetching stores page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedStores = useMemo(() => {
    let list = [...stores];
    if (showTrendingOnly) {
      list = list.filter((s) => s.isTrending);
    }
    switch (sortBy) {
      case 'oldest':
        list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        break;
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    return list;
  }, [stores, sortBy, showTrendingOnly]);

  const featuredStores = useMemo(() => {
    const trending = stores.filter((s) => s.isTrending);
    if (trending.length >= 4) return trending.slice(0, 8);
    return stores.slice(0, 8);
  }, [stores]);

  const totalPages = Math.max(1, Math.ceil(sortedStores.length / STORES_PER_PAGE));
  const paginatedStores = sortedStores.slice(
    (currentPage - 1) * STORES_PER_PAGE,
    currentPage * STORES_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, showTrendingOnly]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-tan">
        {banner10?.imageUrl ? (
          <div className="absolute inset-0">
            <img
              src={banner10.imageUrl}
              alt={banner10.title || 'Stores'}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/95 to-cream/80" />
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-cyan/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-brand-navy/10 blur-3xl" />
          </div>
        )}

        <div className="home-container relative py-10 sm:py-14 md:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-navy bg-brand-cyan/25 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Verified partner stores
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-4 font-serif leading-tight">
              Shop Top <span className="text-brand-accent">Brands</span>
            </h1>
            <p className="text-brand-muted text-sm sm:text-base mb-6 max-w-xl">
              Browse {loading ? '…' : stores.length}+ retailers with active coupons, promo codes, and exclusive deals — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
                <StoreIcon className="w-4 h-4 text-brand-accent" />
                {loading ? '…' : `${stores.length} stores`}
              </div>
              <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
                <Shield className="w-4 h-4 text-brand-accent" />
                Trusted retailers
              </div>
              <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
                <Tag className="w-4 h-4 text-brand-accent" />
                Daily deals
              </div>
            </div>
            <Link
              href="/coupons"
              className="inline-flex items-center gap-2 btn-cta text-sm px-6 py-3"
            >
              View all promotions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Breadcrumbs items={[{ label: 'Stores' }]} />

      {/* Featured strip */}
      {!loading && featuredStores.length > 0 && (
        <section className="border-b border-tan bg-white">
          <div className="home-container py-8 sm:py-10">
            <h2 className="text-lg font-bold text-brand-navy mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-accent fill-brand-accent" />
              Featured stores
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {featuredStores.map((store) => (
                <Link
                  key={store.id}
                  href={storeHref(store)}
                  className="deal-card flex flex-col items-center gap-2 p-4 text-center group"
                >
                  {getStoreFaviconUrl(store) ? (
                    <img
                      src={getStoreFaviconUrl(store)}
                      alt={store.name}
                      className="w-11 h-11 object-contain group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold">
                      {store.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-brand-navy line-clamp-2 group-hover:text-brand-navy-dark">
                    {store.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main grid */}
      <section className="home-section">
        <div className="home-container">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy font-serif">
              All stores
              {!loading && (
                <span className="ml-2 text-sm font-normal text-brand-muted">
                  ({sortedStores.length})
                </span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTrendingOnly((v) => !v)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  showTrendingOnly
                    ? 'bg-brand-navy text-brand-cyan border-brand-navy'
                    : 'bg-white text-brand-navy border-tan hover:border-brand-navy/30'
                }`}
              >
                <Filter className="w-4 h-4" />
                Featured only
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white border border-tan rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                aria-label="Sort stores"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A–Z</option>
                <option value="name-desc">Name Z–A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-xl border border-tan animate-pulse" />
              ))}
            </div>
          ) : sortedStores.length === 0 ? (
            <div className="bg-white rounded-2xl border border-tan p-12 text-center max-w-lg mx-auto">
              <StoreIcon className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-50" />
              <p className="text-lg font-bold text-brand-navy mb-2">No stores found</p>
              <p className="text-sm text-brand-muted mb-4">
                {showTrendingOnly ? 'No featured stores right now.' : 'Check back soon.'}
              </p>
              {showTrendingOnly && (
                <button
                  type="button"
                  onClick={() => setShowTrendingOnly(false)}
                  className="btn-cta px-6 py-2.5 text-sm"
                >
                  Show all stores
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {paginatedStores.map((store) => (
                  <StoreCard key={store.id || store.slug} store={store} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                total={sortedStores.length}
                perPage={STORES_PER_PAGE}
              />
            </>
          )}

          {!loading && (
            <div className="mt-10 text-center">
              <Link href="/coupons" className="btn-outline text-sm inline-flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Browse promo codes
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
