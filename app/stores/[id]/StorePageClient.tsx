'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getStoreById, getStoreBySlug, Store, getStores } from '@/lib/services/storeService';
import { getCouponsByStoreId, Coupon } from '@/lib/services/couponService';
import { sortCouponsByOrder } from '@/lib/utils/couponOrder';
import { toJsDate } from '@/lib/utils/date';
import Navbar from '@/app/components/Navbar';
import CouponPopup from '@/app/components/CouponPopup';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import StoreCouponCard from '@/app/components/stores/StoreCouponCard';
import StorePageSidebar from '@/app/components/stores/StorePageSidebar';
import { ExternalLink, Tag, CheckCircle, Star } from 'lucide-react';

// Helper function to get favicon URL from store data
const getStoreFaviconUrl = (store: Store): string => {
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

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export default function StorePageClient({
  params,
  initialStore = null,
}: {
  params: { id: string };
  initialStore?: Store | null;
}) {
  const idOrSlug = params.id;

  const [store, setStore] = useState<Store | null>(initialStore);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(!initialStore);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!initialStore) {
        setLoading(true);
      }
      try {
        let storeData: Store | null = initialStore;

        if (!storeData) {
          try {
            const res = await fetch(`/api/stores/supabase/by-id/${encodeURIComponent(idOrSlug)}`);
            if (res.ok) {
              const data = await res.json();
              if (data?.success && data.store) {
                storeData = data.store as Store;
              }
            }
          } catch (apiError) {
            console.error('Error fetching store from API:', apiError);
          }
        }

        if (!storeData) {
          storeData = await getStoreBySlug(idOrSlug);
        }

        if (!storeData) {
          storeData = await getStoreById(idOrSlug);
        }

        if (storeData) {
          setStore(storeData);

          if (storeData.id) {
            try {
              const [firebaseCoupons, supabaseResponse, storesData] = await Promise.all([
                getCouponsByStoreId(storeData.id),
                fetch('/api/coupons/supabase').then((res) => res.json()).catch(() => ({ success: false, coupons: [] })),
                getStores()
              ]);

              const firebaseActive = (firebaseCoupons || []).filter((coupon) => coupon.isActive);
              const supabaseList: Coupon[] = Array.isArray(supabaseResponse?.coupons) ? (supabaseResponse.coupons as Coupon[]) : [];
              const supabaseForStore = supabaseList.filter((c) => Array.isArray(c.storeIds) && c.storeIds.includes(storeData!.id as string));

              const merged = [...firebaseActive, ...supabaseForStore];
              setCoupons(sortCouponsByOrder(merged, storeData.couponOrder));
              setAllStores(storesData);
            } catch (couponErr) {
              console.error('Error fetching coupons for store:', couponErr);
              setCoupons([]);
            }
          }
        } else {
          setStore(null);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchStoreData();
    }
  }, [idOrSlug, initialStore]);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
      });
    }
  };

  const handleCouponClick = (coupon: Coupon) => {
    if (coupon.couponType === 'code' && coupon.code) {
      const codeToCopy = coupon.code.trim();
      copyToClipboard(codeToCopy);
    }

    setSelectedCoupon(coupon);
    setShowPopup(true);

    if (coupon.url && coupon.url.trim()) {
      setTimeout(() => {
        window.open(coupon.url, '_blank', 'noopener,noreferrer');
      }, 500);
    }
  };

  const handleContinue = () => {
    if (selectedCoupon?.url) {
      window.open(selectedCoupon.url, '_blank', 'noopener,noreferrer');
    }
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return null;
    try {
      const date =
        typeof timestamp === 'object' &&
        timestamp !== null &&
        'toDate' in timestamp &&
        typeof (timestamp as { toDate: () => Date }).toDate === 'function'
          ? (timestamp as { toDate: () => Date }).toDate()
          : new Date(timestamp as string);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return null;
    }
  };

  // Get related stores (exclude current store)
  const relatedStores = allStores.filter(s => s.id !== store?.id).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red mb-4"></div>
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Store Not Found</h1>
            <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
            <Link href="/stores" className="btn-cta px-6 py-3 text-sm">
              Browse All Stores
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const storeDisplayName = store.subStoreName || store.name;
  const lastUpdatedLabel =
    formatDate(
      coupons.reduce<string | null>((latest, c) => {
        const d = c.updatedAt || c.createdAt;
        if (!d) return latest;
        if (!latest || new Date(d) > new Date(latest)) return d;
        return latest;
      }, null)
    ) || formatDate(store.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cyan/10 via-white to-brand-cyan/15">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-brand-red/10 to-brand-red/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-brand-cyan/10 to-brand-cyan/5 rounded-full blur-3xl"></div>
      </div>

      {/* Breadcrumbs */}
      <div className="relative z-10">
        <Breadcrumbs
          className="[&>div]:py-1.5 sm:[&>div]:py-3"
          items={[
            { label: 'Stores', href: '/stores' },
            { label: store?.name || 'Store Details' }
          ]}
        />
      </div>

      {/* Compact hero */}
      <div className="relative w-full py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gray-50 rounded-xl border border-gray-100 p-2 flex items-center justify-center mx-auto sm:mx-0">
                <img
                  src={store.logoUrl || getStoreFaviconUrl(store)}
                  alt={storeDisplayName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-1">
                  <span className="text-brand-red">{storeDisplayName}</span> Discount Codes
                </h1>
                <p className="text-sm text-gray-600 mb-3">
                  {coupons.length} verified offer{coupons.length !== 1 ? 's' : ''}
                  {lastUpdatedLabel ? ` · Updated ${lastUpdatedLabel}` : ''}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="inline-flex items-center gap-1 bg-brand-cyan/15 text-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-red" />
                    Verified Store
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {coupons.length} Active Offers
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-yellow-500 text-xs font-semibold text-gray-700">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    4.9
                  </span>
                </div>
              </div>
              <a
                href={store.trackingLink || store.trackingUrl || store.websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta shrink-0 w-full sm:w-auto justify-center py-2.5 px-5 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Store
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main + sidebar */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
            {/* Coupons column */}
            <div className="min-w-0">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Available <span className="text-brand-red">Coupons</span>
                </h2>
                <p className="text-gray-600 text-sm hidden md:block">
                  {coupons.length > 0
                    ? `${coupons.length} hand-tested offer${coupons.length !== 1 ? 's' : ''} — discount shown first`
                    : 'No active coupons available at the moment'}
                </p>
                <p className="text-gray-600 text-sm md:hidden">
                  {coupons.length > 0
                    ? `Found ${coupons.length} active coupon${coupons.length !== 1 ? 's' : ''}`
                    : 'No active coupons available at the moment'}
                </p>
              </div>

              {coupons.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-gray-500 text-lg mb-4">No coupons available for this store right now.</p>
                  <Link href="/stores" className="btn-cta px-6 py-2.5 text-sm">
                    Browse Other Stores
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {coupons.map((coupon, index) => {
                    const expiry = toJsDate(coupon.expiryDate);
                    const isExpired = expiry ? expiry < new Date() : false;
                    const isFeatured = index === 0 || Boolean(coupon.isPopular);

                    return (
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: index * 0.04 }}
                      >
                        <StoreCouponCard
                          coupon={coupon}
                          storeName={storeDisplayName}
                          logoUrl={coupon.logoUrl || getStoreFaviconUrl(store)}
                          logoFallback={storeDisplayName.charAt(0).toUpperCase()}
                          isExpired={isExpired}
                          isFeatured={isFeatured}
                          copiedCode={copiedCode}
                          onActivate={() => !isExpired && handleCouponClick(coupon)}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar — desktop right; mobile below coupons */}
            <div className="mt-8 lg:mt-0">
              <StorePageSidebar
                store={store}
                coupons={coupons}
                allStores={allStores}
                relatedStores={relatedStores}
                getLogoUrl={getStoreFaviconUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Back to Stores */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Link
          href="/stores"
          className="inline-flex items-center gap-2 text-brand-red hover:underline font-semibold text-sm transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to All Stores</span>
        </Link>
      </div>

      {/* Coupon Popup */}
      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedCoupon(null);
        }}
        onContinue={handleContinue}
      />
    </div>
  );
}
