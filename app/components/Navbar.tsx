"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCategories, Category } from "@/lib/services/categoryService";
import { Coupon } from "@/lib/services/couponService";
import { getStores, Store } from "@/lib/services/storeService";
import { getFavoritesCount } from "@/lib/services/favoritesService";
import { getUnreadCount, initializeSampleNotifications } from "@/lib/services/notificationsService";
import { BLOG_CATEGORIES } from "@/lib/utils/articleMeta";
import { getCouponSubtitle } from "@/lib/utils/search";
import { getCouponDisplayTitle } from "@/lib/utils/couponDisplay";
import { siteConfig } from "@/lib/seo/config";
import BrandLogo from "@/app/components/BrandLogo";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Search, Menu, X, ChevronDown, User,
  Phone, Heart, Moon, Loader2,
  MapPin, ChevronLeft, ChevronRight, Facebook, Twitter, Instagram, Youtube
} from "lucide-react";

type SearchResults = {
  stores: Store[];
  categories: Category[];
  coupons: Coupon[];
};

interface SearchSuggestionsDropdownProps {
  show: boolean;
  loading: boolean;
  query: string;
  results: SearchResults;
  onStoreClick: (store: Store) => void;
  onCategoryClick: (category: Category) => void;
  onCouponClick: (coupon: Coupon) => void;
  onViewAll: () => void;
}

function SearchSuggestionsDropdown({
  show,
  loading,
  query,
  results,
  onStoreClick,
  onCategoryClick,
  onCouponClick,
  onViewAll,
}: SearchSuggestionsDropdownProps) {
  if (!show || !query.trim()) return null;

  const hasResults =
    results.stores.length > 0 ||
    results.categories.length > 0 ||
    results.coupons.length > 0;

  return (
    <div className="absolute left-0 right-0 top-full z-[200] mt-2 max-h-[min(24rem,70vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl">
      {loading && !hasResults ? (
        <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching...
        </div>
      ) : !hasResults ? (
        <div className="p-4 text-center text-sm text-gray-500">
          No results for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <>
          {results.stores.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">Stores</div>
              {results.stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onStoreClick(store)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-white">
                    <img
                      src={store.logoUrl || getStoreFaviconUrl(store)}
                      alt={store.name}
                      className="h-8 w-8 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">{store.name}</div>
                    {store.description && (
                      <div className="truncate text-xs text-gray-500">{store.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.coupons.length > 0 && (
            <div className={`p-2 ${results.stores.length > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                Deals &amp; Coupons
              </div>
              {results.coupons.map((coupon) => (
                <button
                  key={coupon.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCouponClick(coupon)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {coupon.logoUrl ? (
                      <img src={coupon.logoUrl} alt="" className="h-8 w-8 object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-brand-navy">
                        {(coupon.storeName || coupon.code || 'D').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {getCouponDisplayTitle(coupon)}
                    </div>
                    <div className="truncate text-xs text-gray-500">{getCouponSubtitle(coupon)}</div>
                  </div>
                  {coupon.discount > 0 && (
                    <span className="shrink-0 rounded bg-brand-cyan/40 px-2 py-0.5 text-[10px] font-bold text-brand-navy">
                      {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {results.categories.length > 0 && (
            <div
              className={`p-2 ${
                results.stores.length > 0 || results.coupons.length > 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-gray-500">Categories</div>
              {results.categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onCategoryClick(category)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-50"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: category.backgroundColor || '#C7395F' }}
                  >
                    {category.logoUrl ? (
                      <img src={category.logoUrl} className="h-6 w-6 object-contain" alt="" />
                    ) : (
                      category.name.charAt(0)
                    )}
                  </div>
                  <div className="truncate text-sm font-semibold text-gray-900">{category.name}</div>
                </button>
              ))}
            </div>
          )}

          <div className="sticky bottom-0 border-t border-gray-100 bg-white p-2">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={onViewAll}
              className="w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-cyan/30"
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to get favicon URL from store data
const getStoreFaviconUrl = (store: Store): string => {
  // Try to extract domain from websiteUrl or trackingLink
  let domain = '';

  if (store.websiteUrl) {
    try {
      domain = new URL(store.websiteUrl).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid websiteUrl:', store.websiteUrl);
    }
  } else if (store.trackingLink) {
    try {
      domain = new URL(store.trackingLink).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid trackingLink:', store.trackingLink);
    }
  }

  // If no domain found, try to construct from store name
  if (!domain && store.name) {
    // Check if name already looks like a domain (contains a dot)
    const nameLower = store.name.toLowerCase();
    if (nameLower.includes('.')) {
      // Name already looks like a domain, use it as-is
      domain = nameLower.replace(/\s+/g, '');
    } else {
      // Convert store name to potential domain (e.g., "SamBoat" -> "samboat.com")
      domain = nameLower.replace(/\s+/g, '') + '.com';
    }
  }

  // Return Google's favicon service URL
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

function HomeLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
      <img
        src={siteConfig.logo}
        alt={siteConfig.name}
        className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
      />
      <BrandLogo className="text-[15px] sm:text-lg font-bold tracking-wide text-brand-navy uppercase whitespace-nowrap leading-none" />
    </Link>
  );
}

interface HomeSearchPanelProps {
  open: boolean;
  searchQuery: string;
  showSuggestions: boolean;
  searchLoading: boolean;
  searchResults: SearchResults;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e?: React.FormEvent) => void;
  onClose: () => void;
  onShowSuggestions: () => void;
  onStoreClick: (store: Store) => void;
  onCategoryClick: (category: Category) => void;
  onCouponClick: (coupon: Coupon) => void;
  onViewAll: () => void;
}

function HomeSearchPanel({
  open,
  searchQuery,
  showSuggestions,
  searchLoading,
  searchResults,
  onSearchChange,
  onSearchSubmit,
  onClose,
  onShowSuggestions,
  onStoreClick,
  onCategoryClick,
  onCouponClick,
  onViewAll,
}: HomeSearchPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="relative z-[130] border-t border-tan bg-cream"
        >
          <div className="home-container py-4">
            <form onSubmit={onSearchSubmit} className="relative mx-auto max-w-2xl">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Search stores, coupons, deals..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={onShowSuggestions}
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-brand-navy px-4 py-1.5 text-xs font-bold text-brand-cyan hover:bg-brand-navy-dark transition-colors"
                >
                  Search
                </button>
              </div>

              <SearchSuggestionsDropdown
                show={showSuggestions}
                loading={searchLoading}
                query={searchQuery}
                results={searchResults}
                onStoreClick={onStoreClick}
                onCategoryClick={onCategoryClick}
                onCouponClick={onCouponClick}
                onViewAll={onViewAll}
              />
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar({ variant = "default" }: { variant?: "default" | "home" }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomeNav = variant === "home";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [homeSearchOpen, setHomeSearchOpen] = useState(false);
  const [homeActiveDropdown, setHomeActiveDropdown] = useState<string | null>(null);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingStores, setTrendingStores] = useState<Store[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>({
    stores: [],
    categories: [],
    coupons: [],
  });

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > (isHomeNav ? 40 : 120));
  });

  const promotions = [
    "Get 35% Off Code FG6556KD",
    "Free Shipping on Orders Over $50",
    "New Arrivals - Check Them Out!"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, stores] = await Promise.all([
          getCategories(),
          getStores()
        ]);
        setCategories(cats);
        setTrendingStores(stores);
      } catch (error) {
        console.error('Error fetching navbar data:', error);
      }
    };
    fetchData();
    initializeSampleNotifications();
    updateCounts();

    const handleUpdate = () => updateCounts();
    window.addEventListener('notificationUpdated', handleUpdate);
    window.addEventListener('favoritesUpdated', handleUpdate);

    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => {
      window.removeEventListener('notificationUpdated', handleUpdate);
      window.removeEventListener('favoritesUpdated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const updateCounts = () => {
    setFavoritesCount(getFavoritesCount());
    setNotificationsCount(getUnreadCount());
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setShowSuggestions(false);
      setHomeSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setShowSuggestions(false);
      setSearchResults({ stores: [], categories: [], coupons: [] });
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
  };

  useEffect(() => {
    const term = searchQuery.trim();
    if (term.length < 1) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && data.results) {
          setSearchResults({
            stores: data.results.stores || [],
            categories: data.results.categories || [],
            coupons: data.results.coupons || [],
          });
          setShowSuggestions(true);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search suggest error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSuggestionClick = (type: 'store' | 'category' | 'coupon', item: Store | Category | Coupon) => {
    setShowSuggestions(false);
    setHomeSearchOpen(false);
    if (type === 'store') {
      const store = item as Store;
      router.push(`/stores/${store.slug || store.id}`);
    } else if (type === 'category') {
      const category = item as Category;
      router.push(`/categories/${category.id}`);
    } else {
      const coupon = item as Coupon;
      if (coupon.url?.trim()) {
        window.open(coupon.url, '_blank', 'noopener,noreferrer');
      } else {
        router.push(`/search?q=${encodeURIComponent(getCouponDisplayTitle(coupon))}`);
      }
    }
    setSearchQuery('');
  };

  // --- Dropdown Components ---

  // 1. Categories Mega Menu
  const CategoriesMenu = () => (
    <div className="grid grid-cols-4 gap-4 p-5 w-[650px] bg-white rounded-b-xl shadow-xl border border-gray-100 mt-2">
      <div className="col-span-3 grid grid-cols-2 gap-x-6 gap-y-2">
        {categories.slice(0, 10).map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.id}`} className="flex items-center gap-2 group/item p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: cat.backgroundColor || '#ccc' }}>
              {cat.logoUrl ? <img src={cat.logoUrl} className="w-4 h-4 object-contain" /> : cat.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover/item:text-[#C7395F] transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
      <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <h4 className="font-bold text-gray-900 mb-1 text-sm">All Categories</h4>
        <p className="text-[10px] text-gray-500 mb-3">Explore thousands of products</p>
        <Link href="/categories" className="text-[10px] bg-brand-navy text-white px-3 py-1.5 rounded-lg hover:bg-brand-navy-dark transition-colors">
          View All
        </Link>
      </div>
    </div>
  );

  // 2. Stores Mega Menu
  const StoresMenu = () => (
    <div className="grid grid-cols-4 gap-4 p-5 w-[650px] bg-white rounded-b-xl shadow-xl border border-gray-100 mt-2">
      <div className="col-span-3 grid grid-cols-2 gap-x-6 gap-y-2">
        {trendingStores.slice(0, 10).map((store) => (
          <Link key={store.id} href={store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`} className="flex items-center gap-2 group/item p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
              <img
                src={store.logoUrl || getStoreFaviconUrl(store)}
                alt={store.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // If logoUrl failed, try favicon
                  const faviconUrl = getStoreFaviconUrl(store);
                  if (target.src !== faviconUrl && store.logoUrl) {
                    target.src = faviconUrl;
                  } else {
                    // If both failed, show gradient badge
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#C7395F] to-brand-navy-light flex items-center justify-center text-white text-xs font-bold">${store.name.charAt(0).toUpperCase()}</div>`;
                    }
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover/item:text-[#C7395F] transition-colors truncate">{store.name}</span>
          </Link>
        ))}
      </div>
      <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <h4 className="font-bold text-gray-900 mb-1 text-sm">Top Stores</h4>
        <p className="text-[10px] text-gray-500 mb-3">Find best coupons</p>
        <Link href="/stores" className="text-[10px] bg-brand-navy text-white px-3 py-1.5 rounded-lg hover:bg-brand-navy-dark transition-colors">
          View All
        </Link>
      </div>
    </div>
  );

  // 3. Simple List Menu
  const SimpleMenu = ({ items }: { items: { label: string; href: string }[] }) => (
    <div className="w-48 bg-white rounded-b-xl shadow-xl border border-gray-100 py-2">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm text-gray-600 hover:text-[#C7395F] hover:bg-gray-50 font-medium">
          {item.label}
        </Link>
      ))}
    </div>
  );

  const navLinks = [
    { name: "Home", path: "/", component: null },
    { name: "Stores", path: "/stores", component: <StoresMenu /> },
    { name: "Categories", path: "/categories", component: <CategoriesMenu /> },
    {
      name: "Pages",
      path: "/pages",
      component: <SimpleMenu items={[
        { label: "About Us", href: "/about-us" },
        { label: "Contact Us", href: "/contact-us" },
        { label: "Privacy Policy", href: "/privacy-policy" }
      ]} />
    },
    {
      name: "Blogs",
      path: "/blogs",
      component: <SimpleMenu items={[
        { label: "All Articles", href: "/blogs" },
        { label: "Fashion", href: "/blogs?category=fashion" },
        { label: "Lifestyle", href: "/blogs?category=lifestyle" },
        { label: "Travel", href: "/blogs?category=travel" },
      ]} />
    },
  ];

  const homeNavItems = [
    { name: "Home", href: "/", dropdown: null as { label: string; href: string }[] | null },
    {
      name: "Fashion",
      href: "/blogs?category=fashion",
      dropdown: [
        { label: "Fashion Articles", href: "/blogs?category=fashion" },
        { label: "Beauty", href: "/blogs?category=beauty" },
        { label: "Fashion Stores", href: "/stores" },
      ],
    },
    {
      name: "Lifestyle",
      href: "/blogs?category=lifestyle",
      dropdown: [
        { label: "Lifestyle Articles", href: "/blogs?category=lifestyle" },
        { label: "Health & Wellness", href: "/blogs?category=health" },
        { label: "Food & Dining", href: "/blogs?category=food" },
      ],
    },
    {
      name: "Featured",
      href: "/blogs",
      dropdown: [
        { label: "Latest Blogs", href: "/blogs" },
        { label: "Popular Coupons", href: "/coupons" },
        { label: "Top Stores", href: "/stores" },
        { label: "All Categories", href: "/categories" },
      ],
    },
    { name: "Promotions", href: "/coupons", dropdown: null },
  ];

  if (isHomeNav) {
    return (
      <header className="sticky top-0 z-[120] bg-cream border-b border-tan">
        <div className="home-container">
          <div className="relative flex items-center justify-center py-5 min-h-[76px]">
            <button
              type="button"
              className="absolute left-0 lg:hidden p-1 text-brand-navy"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <HomeLogo />

            <button
              type="button"
              onClick={() => {
                setHomeSearchOpen((open) => !open);
                if (homeSearchOpen) {
                  setShowSuggestions(false);
                  setSearchQuery('');
                }
              }}
              className="absolute right-0 inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2.5 text-sm font-bold text-brand-cyan hover:bg-brand-navy-dark transition-colors"
              aria-expanded={homeSearchOpen}
            >
              {homeSearchOpen ? <X className="h-4 w-4" strokeWidth={2.5} /> : <Search className="h-4 w-4" strokeWidth={2.5} />}
              <span>{homeSearchOpen ? 'Close' : 'Search'}</span>
            </button>
          </div>
        </div>

        <HomeSearchPanel
          open={homeSearchOpen}
          searchQuery={searchQuery}
          showSuggestions={showSuggestions}
          searchLoading={searchLoading}
          searchResults={searchResults}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearch}
          onClose={() => {
            setHomeSearchOpen(false);
            setShowSuggestions(false);
            setSearchQuery('');
            setSearchLoading(false);
          }}
          onShowSuggestions={() => {
            if (searchQuery.trim().length > 0) setShowSuggestions(true);
          }}
          onStoreClick={(store) => handleSuggestionClick('store', store)}
          onCategoryClick={(category) => handleSuggestionClick('category', category)}
          onCouponClick={(coupon) => handleSuggestionClick('coupon', coupon)}
          onViewAll={() => handleSearch()}
        />

        <nav className="hidden lg:block bg-brand-navy border-t border-brand-navy-light">
          <div className="home-container flex items-center justify-between h-11">
            <ul className="flex items-center">
              {homeNavItems.map((item) => (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setHomeActiveDropdown(item.name)}
                  onMouseLeave={() => setHomeActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href.split("?")[0]))
                        ? "text-white"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          homeActiveDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>
                  <AnimatePresence>
                    {item.dropdown && homeActiveDropdown === item.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 z-50 pt-1"
                      >
                        <SimpleMenu items={item.dropdown} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
            <Link
              href="/contact-us"
              className="rounded-md bg-brand-cyan px-4 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-cyan/80 transition-colors shrink-0"
            >
              Contact Us
            </Link>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-tan bg-brand-navy lg:hidden"
            >
              <div className="px-4 py-5 space-y-1">
                {homeNavItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 text-sm font-medium text-white/90 hover:text-white"
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <div className="pl-3 pb-2 space-y-1">
                        {item.dropdown.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 text-xs text-white/70 hover:text-white"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <Link
                  href="/contact-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-4 inline-block rounded-md bg-brand-cyan px-4 py-2 text-sm font-semibold text-brand-navy"
                >
                  Contact Us
                </Link>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-white/15 pt-4">
                  {BLOG_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/blogs?category=${cat.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-semibold tracking-wide text-white/60 uppercase hover:text-white"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    );
  }

  return (
    <>

      {/* 1. TOP BAR — cyan promo strip (like K&F red announcement) */}
      <div className="promo-bar text-[11px] py-2.5 relative z-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-full">
          <div className="hidden md:flex items-center gap-5">
            <Link href="/stores" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity font-semibold tracking-wide">
              <MapPin className="w-3.5 h-3.5" /> Find a Store
            </Link>
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity group relative font-semibold tracking-wide">
              USD ($) <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform" />
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center gap-3">
            <button onClick={() => setPromoIndex((prev) => (prev - 1 + promotions.length) % promotions.length)} className="hover:opacity-70 transition-opacity"><ChevronLeft className="w-4 h-4" /></button>
            <AnimatePresence mode="wait">
              <motion.span key={promoIndex} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="font-bold tracking-wider text-center min-w-[200px]">
                {promotions[promoIndex]}
              </motion.span>
            </AnimatePresence>
            <button onClick={() => setPromoIndex((prev) => (prev + 1) % promotions.length)} className="hover:opacity-70 transition-opacity"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="hover:opacity-70 transition-opacity"><Facebook className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-70 transition-opacity"><Twitter className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-70 transition-opacity"><Instagram className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:opacity-70 transition-opacity"><Youtube className="w-3.5 h-3.5" /></a>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE BAR — navy header */}
      <div className="bg-brand-navy py-2 border-b border-brand-navy-light relative z-[110] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">

            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                src={siteConfig.logo}
                alt={siteConfig.name}
                className="w-10 h-10 object-contain"
              />
              <BrandLogo className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-nowrap" accentClassName="text-brand-cyan" />
            </Link>


            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto relative">
              <form onSubmit={handleSearch} className="flex w-full bg-white rounded-full p-1 shadow-lg items-center relative z-20 h-[46px]">
                <div className="pl-4 pr-2 flex items-center">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  placeholder="Search for stores, coupons, categories..."
                  className="flex-1 px-2 py-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                />
                <button type="submit" className="mr-1 bg-brand-navy text-brand-cyan px-6 py-2 rounded-full font-bold text-xs hover:bg-brand-navy-dark transition-all shadow-sm hover:shadow-md">
                  Search
                </button>
              </form>

              <SearchSuggestionsDropdown
                show={showSuggestions}
                loading={searchLoading}
                query={searchQuery}
                results={searchResults}
                onStoreClick={(store) => handleSuggestionClick('store', store)}
                onCategoryClick={(category) => handleSuggestionClick('category', category)}
                onCouponClick={(coupon) => handleSuggestionClick('coupon', coupon)}
                onViewAll={() => handleSearch()}
              />
            </div>

            <div className="flex items-center gap-6 text-white">
              <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-white/20">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center"><Phone className="w-4 h-4 text-[#C7395F]" /></div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-brand-cyan/90 font-medium tracking-wide">Hotline:</span>
                  <span className="text-sm font-bold">196475</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden sm:block hover:text-brand-red transition-colors"><Moon className="w-5 h-5" /></button>
                <Link href="/favorites" className="relative hover:text-brand-red transition-colors">
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-cyan rounded-full"></span>}
                </Link>
                <Link href="/profile" className="hover:text-brand-red transition-colors"><User className="w-5 h-5" /></Link>
                <button className="lg:hidden p-1 ml-1 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR (White - Sticky) */}
      <div className={`w-full bg-white border-b border-gray-200 hidden lg:block sticky top-0 z-[100] transition-shadow duration-300 ${isScrolled ? "shadow-md" : ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-7">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group h-14 flex items-center" onMouseEnter={() => setActiveDropdown(link.name)} onMouseLeave={() => setActiveDropdown(null)}>
                  <Link href={link.path} className={`text-[13px] font-bold flex items-center gap-1 hover:text-brand-navy transition-colors uppercase tracking-wide h-14 ${pathname === link.path ? "text-brand-navy nav-link-active" : "text-gray-700"}`}>
                    {link.name}
                    {link.component && (
                      <ChevronDown className={`w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:rotate-180 transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180 text-[#C7395F]' : ''}`} />
                    )}
                  </Link>
                  <AnimatePresence>
                    {activeDropdown === link.name && link.component && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 z-50 pt-2">
                        {link.component}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <Link href="/submit-coupon" className="text-[13px] font-bold text-gray-600 hover:text-[#C7395F] transition-colors uppercase tracking-wide">Submit Coupon</Link>
              <Link href="/support" className="text-[13px] font-bold text-gray-600 hover:text-[#C7395F] transition-colors uppercase tracking-wide">Support & FAQs</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden fixed inset-x-0 top-[140px] z-50 bg-[#C7395F] border-t border-white/10 shadow-xl overflow-hidden">
            <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto text-white">
              <div className="mb-6">
                <form onSubmit={handleSearch} className="flex w-full bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
                  <input type="search" placeholder="Search products..." className="flex-1 px-4 py-2 bg-transparent outline-none text-white placeholder:text-gray-300 text-sm" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} />
                  <button type="submit" className="bg-brand-yellow text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-brand-yellow-hover"><Search className="w-4 h-4" /></button>
                </form>
              </div>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} className="block py-2 border-b border-white/10 font-medium text-sm">{link.name}</Link>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/submit-coupon" onClick={() => setMobileMenuOpen(false)} className="py-2 text-xs text-gray-300">Submit Coupon</Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="py-2 text-xs text-gray-300">Support & FAQs</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
