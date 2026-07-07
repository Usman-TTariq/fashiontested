'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  Tag,
  Shield,
  Sparkles,
  Store as StoreIcon,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { getActiveCoupons, Coupon } from '@/lib/services/couponService';
import { getCategories, Category } from '@/lib/services/categoryService';
import { getStores, Store } from '@/lib/services/storeService';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import DealCard from '@/app/components/home/DealCard';

const COUPONS_PER_PAGE = 12;
const STORES_PER_PAGE = 12;

type TabId = 'coupons' | 'stores';

const extractDomain = (url: string): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
};

const getFaviconUrl = (store: Store): string | null => {
  if (store.logoUrl) return store.logoUrl;
  if (store.websiteUrl) {
    const domain = extractDomain(store.websiteUrl);
    if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  if (store.trackingLink) {
    const domain = extractDomain(store.trackingLink);
    if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  if (store.name) {
    const nameLower = store.name.toLowerCase().replace(/\s+/g, '');
    const domain = nameLower.includes('.') ? nameLower : `${nameLower}.com`;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  return null;
};

function storeHref(store: Store) {
  return store.slug ? `/stores/${store.slug}` : store.id ? `/stores/${store.id}` : '/stores';
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;

  const go = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-tan pt-8">
      <p className="text-sm text-brand-muted">
        Page <span className="font-semibold text-brand-navy">{currentPage}</span> of{' '}
        <span className="font-semibold text-brand-navy">{totalPages}</span>
        <span className="hidden sm:inline"> · {label}</span>
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

function StorePromoCard({
  store,
  dealCount,
}: {
  store: Store;
  dealCount: number;
}) {
  const logoUrl = getFaviconUrl(store);
  return (
    <Link
      href={storeHref(store)}
      className="deal-card group flex flex-col h-full p-4 sm:p-5 hover:border-brand-navy/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        {store.isTrending && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-navy bg-brand-cyan/25 px-2 py-0.5 rounded">
            <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
            Featured
          </span>
        )}
        {!store.isTrending && <span />}
        <span className="text-[10px] font-bold text-brand-muted bg-cream px-2 py-0.5 rounded">
          {dealCount} deal{dealCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center justify-center h-14 mb-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={store.name}
            className="max-h-12 max-w-[120px] object-contain group-hover:scale-105 transition-transform"
          />
        ) : (
          <span className="text-2xl font-bold text-brand-navy">{store.name.charAt(0)}</span>
        )}
      </div>
      <h3 className="text-sm font-bold text-brand-navy text-center line-clamp-2 mb-1 group-hover:text-brand-navy-dark">
        {store.name}
      </h3>
      {store.voucherText && (
        <p className="text-xs text-brand-muted text-center line-clamp-2 mb-3 flex-grow">
          {store.voucherText}
        </p>
      )}
      <span className="mt-auto block w-full text-center text-xs font-bold text-brand-navy bg-brand-cyan/20 py-2 rounded group-hover:bg-brand-cyan/35 transition-colors">
        View promotions →
      </span>
    </Link>
  );
}

function CouponsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const storeParam = searchParams.get('store');

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');
  const [selectedStore, setSelectedStore] = useState(storeParam || '');
  const [activeTab, setActiveTab] = useState<TabId>('coupons');
  const [couponPage, setCouponPage] = useState(1);
  const [storePage, setStorePage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [couponsData, categoriesData, storesData] = await Promise.all([
          getActiveCoupons(),
          getCategories(),
          getStores(),
        ]);
        setCoupons(couponsData);
        setCategories(categoriesData);
        setStores(storesData);
      } catch (error) {
        console.error('Error fetching promotions data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const storeDealCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const coupon of coupons) {
      if (coupon.storeIds?.length) {
        for (const id of coupon.storeIds) {
          counts.set(id, (counts.get(id) || 0) + 1);
        }
      }
      if (coupon.storeName) {
        const match = stores.find((s) => s.name === coupon.storeName);
        if (match?.id) counts.set(match.id, (counts.get(match.id) || 0) + 1);
      }
    }
    return counts;
  }, [coupons, stores]);

  const filteredCoupons = useMemo(() => {
    let list = [...coupons];
    if (selectedCategory) {
      list = list.filter((c) => c.categoryId === selectedCategory);
    }
    if (selectedStore) {
      list = list.filter((c) => {
        if (c.storeIds?.includes(selectedStore)) return true;
        const store = stores.find((s) => s.id === selectedStore);
        return store ? c.storeName === store.name : false;
      });
    }
    return list.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  }, [coupons, selectedCategory, selectedStore, stores]);

  const filteredStores = useMemo(() => {
    let list = [...stores];
    if (selectedStore) {
      list = list.filter((s) => s.id === selectedStore);
    }
    return list.sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      const countDiff = (storeDealCounts.get(b.id || '') || 0) - (storeDealCounts.get(a.id || '') || 0);
      if (countDiff !== 0) return countDiff;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [stores, selectedStore, storeDealCounts]);

  const featuredCoupons = useMemo(() => {
    const popular = filteredCoupons.filter((c) => c.isPopular);
    if (popular.length >= 4) return popular.slice(0, 6);
    return filteredCoupons.slice(0, 6);
  }, [filteredCoupons]);

  const featuredStores = useMemo(() => {
    const trending = filteredStores.filter((s) => s.isTrending);
    const rest = filteredStores.filter((s) => !s.isTrending);
    return [...trending, ...rest].slice(0, 8);
  }, [filteredStores]);

  const categoriesWithCounts = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          count: coupons.filter((c) => c.categoryId === category.id).length,
        }))
        .filter((c) => c.count > 0),
    [categories, coupons]
  );

  const couponTotalPages = Math.max(1, Math.ceil(filteredCoupons.length / COUPONS_PER_PAGE));
  const storeTotalPages = Math.max(1, Math.ceil(filteredStores.length / STORES_PER_PAGE));

  const paginatedCoupons = filteredCoupons.slice(
    (couponPage - 1) * COUPONS_PER_PAGE,
    couponPage * COUPONS_PER_PAGE
  );
  const paginatedStores = filteredStores.slice(
    (storePage - 1) * STORES_PER_PAGE,
    storePage * STORES_PER_PAGE
  );

  useEffect(() => {
    setCouponPage(1);
    setStorePage(1);
  }, [selectedCategory, selectedStore]);

  useEffect(() => {
    if (couponPage > couponTotalPages) setCouponPage(couponTotalPages);
  }, [couponPage, couponTotalPages]);

  useEffect(() => {
    if (storePage > storeTotalPages) setStorePage(storeTotalPages);
  }, [storePage, storeTotalPages]);

  useEffect(() => {
    if (loading) return;
    if (sessionStorage.getItem('scrollToFeaturedCoupons') !== '1') return;

    sessionStorage.removeItem('scrollToFeaturedCoupons');
    requestAnimationFrame(() => {
      document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [loading]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedStore('');
  };

  const hasFilters = Boolean(selectedCategory || selectedStore);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Breadcrumbs items={[{ label: 'Promotions' }]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-tan bg-gradient-to-br from-white via-cream to-brand-cyan/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-brand-navy/10 blur-3xl" />
        </div>
        <div className="home-container relative py-10 sm:py-12 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-navy bg-brand-cyan/25 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Verified &amp; updated daily
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-3 font-serif">
            Exclusive <span className="text-brand-accent">Promotions</span>
          </h1>
          <p className="text-brand-muted text-sm sm:text-base max-w-2xl mx-auto mb-6">
            Featured picks, promo codes, and store deals — all in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
              <Tag className="w-4 h-4 text-brand-accent" />
              {loading ? '…' : `${coupons.length} coupons`}
            </div>
            <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
              <StoreIcon className="w-4 h-4 text-brand-accent" />
              {loading ? '…' : `${stores.length} stores`}
            </div>
            <div className="flex items-center gap-2 bg-white border border-tan rounded-full px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm">
              <CheckCircle className="w-4 h-4 text-brand-accent" />
              100% free
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {!loading && (featuredCoupons.length > 0 || featuredStores.length > 0) && (
        <section id="featured" className="border-b border-tan bg-white">
          <div className="home-container py-10 sm:py-12">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-brand-accent" />
              <h2 className="text-xl sm:text-2xl font-bold text-brand-navy font-serif">Featured picks</h2>
            </div>

            {featuredCoupons.length > 0 && (
              <div className="mb-10">
                <p className="text-sm font-semibold text-brand-muted uppercase tracking-wide mb-4">
                  Top coupons
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {featuredCoupons.map((coupon) => (
                    <DealCard key={`feat-${coupon.id}`} coupon={coupon} tag="FEATURED" />
                  ))}
                </div>
              </div>
            )}

            {featuredStores.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-brand-muted uppercase tracking-wide mb-4">
                  Featured stores
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {featuredStores.map((store) => (
                    <Link
                      key={store.id}
                      href={storeHref(store)}
                      className="deal-card flex flex-col items-center gap-2 p-4 text-center group"
                    >
                      {getFaviconUrl(store) ? (
                        <img
                          src={getFaviconUrl(store)!}
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
                      {store.isTrending && (
                        <span className="text-[10px] font-bold text-brand-accent uppercase">Featured</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main: tabs + filters + paginated grid */}
      <section className="home-section">
        <div className="home-container">
          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="inline-flex p-1 bg-white border border-tan rounded-xl shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'coupons'
                    ? 'bg-brand-navy text-brand-cyan shadow-sm'
                    : 'text-brand-navy hover:bg-cream'
                }`}
              >
                Coupons ({filteredCoupons.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('stores')}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  activeTab === 'stores'
                    ? 'bg-brand-navy text-brand-cyan shadow-sm'
                    : 'text-brand-navy hover:bg-cream'
                }`}
              >
                Stores ({filteredStores.length})
              </button>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-brand-navy hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4 bg-white border border-tan rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label htmlFor="store-filter" className="text-sm font-bold text-brand-navy shrink-0">
                Store
              </label>
              <select
                id="store-filter"
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="flex-1 max-w-md px-4 py-2.5 bg-cream border border-tan rounded-lg text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
              >
                <option value="">All stores</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {categoriesWithCounts.length > 0 && activeTab === 'coupons' && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedCategory === ''
                      ? 'bg-brand-navy text-brand-cyan'
                      : 'bg-cream border border-tan text-brand-navy'
                  }`}
                >
                  All categories
                </button>
                {categoriesWithCounts.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id || '')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-brand-navy text-brand-cyan'
                        : 'bg-cream border border-tan text-brand-navy'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-xl border border-tan animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'coupons' ? (
            <>
              {filteredCoupons.length === 0 ? (
                <div className="bg-white rounded-2xl border border-tan p-12 text-center max-w-lg mx-auto">
                  <Tag className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold text-brand-navy mb-2">No coupons found</p>
                  <p className="text-sm text-brand-muted mb-6">Try adjusting your filters.</p>
                  {hasFilters && (
                    <button type="button" onClick={clearFilters} className="btn-cta px-6 py-2.5 text-sm">
                      View all coupons
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-brand-navy">
                      All coupons
                      <span className="ml-2 text-sm font-normal text-brand-muted">
                        ({filteredCoupons.length} total)
                      </span>
                    </h2>
                    <span className="text-xs text-brand-muted hidden sm:inline">
                      Showing {(couponPage - 1) * COUPONS_PER_PAGE + 1}–
                      {Math.min(couponPage * COUPONS_PER_PAGE, filteredCoupons.length)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {paginatedCoupons.map((coupon) => (
                      <DealCard
                        key={coupon.id}
                        coupon={coupon}
                        tag={
                          coupon.isPopular
                            ? 'TRENDING'
                            : coupon.couponType === 'code'
                              ? 'PROMO CODE'
                              : 'DEAL'
                        }
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={couponPage}
                    totalPages={couponTotalPages}
                    onPageChange={setCouponPage}
                    label={`${filteredCoupons.length} coupons`}
                  />
                </>
              )}
            </>
          ) : (
            <>
              {filteredStores.length === 0 ? (
                <div className="bg-white rounded-2xl border border-tan p-12 text-center max-w-lg mx-auto">
                  <StoreIcon className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-bold text-brand-navy mb-2">No stores found</p>
                  {hasFilters && (
                    <button type="button" onClick={clearFilters} className="btn-cta px-6 py-2.5 text-sm mt-4">
                      View all stores
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-brand-navy">
                      All stores
                      <span className="ml-2 text-sm font-normal text-brand-muted">
                        ({filteredStores.length} total)
                      </span>
                    </h2>
                    <span className="text-xs text-brand-muted hidden sm:inline">
                      Showing {(storePage - 1) * STORES_PER_PAGE + 1}–
                      {Math.min(storePage * STORES_PER_PAGE, filteredStores.length)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {paginatedStores.map((store) => (
                      <StorePromoCard
                        key={store.id}
                        store={store}
                        dealCount={storeDealCounts.get(store.id || '') || 0}
                      />
                    ))}
                  </div>
                  <Pagination
                    currentPage={storePage}
                    totalPages={storeTotalPages}
                    onPageChange={setStorePage}
                    label={`${filteredStores.length} stores`}
                  />
                </>
              )}
            </>
          )}

          {!loading && (
            <div className="mt-12 text-center">
              <Link href="/stores" className="btn-outline text-sm inline-flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Browse full store directory
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function CouponsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4" />
              <p className="text-brand-muted">Loading promotions…</p>
            </div>
          </div>
        </div>
      }
    >
      <CouponsContent />
    </Suspense>
  );
}
