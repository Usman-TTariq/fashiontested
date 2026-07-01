'use client';

import { useEffect, useState } from 'react';
import { getLatestCoupons, Coupon } from '@/lib/services/couponService';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/services/favoritesService';
import { addNotification } from '@/lib/services/notificationsService';
import Link from 'next/link';
import CouponPopup from './CouponPopup';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';

export default function PopularCoupons() {
  const [coupons, setCoupons] = useState<(Coupon | null)[]>(Array(8).fill(null));
  const [loading, setLoading] = useState(true);
  const [revealedCoupons, setRevealedCoupons] = useState<Set<string>>(new Set());
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching latest coupons...');
        const data = await getLatestCoupons();
        console.log('✅ Fetched coupons:', data);
        console.log('📊 Number of coupons:', data.length);
        setCoupons(data);
      } catch (error) {
        console.error('❌ Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdate = () => setUpdateTrigger(prev => prev + 1);

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  // Get last 2 digits of code for code type coupons
  const getCodePreview = (coupon: Coupon): string => {
    if ((coupon.couponType || 'deal') === 'code' && coupon.code) {
      return coupon.getCodeText || 'Get Code';
    }
    return coupon.getDealText || 'Get Deal';
  };

  // Get last 2 digits for hover display
  const getLastTwoDigits = (coupon: Coupon): string | null => {
    if ((coupon.couponType || 'deal') === 'code' && coupon.code) {
      const code = coupon.code.trim();
      if (code.length >= 2) {
        return code.slice(-2);
      }
    }
    return null;
  };

  const handleGetDeal = (coupon: Coupon, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Copy code to clipboard FIRST (before showing popup) - only for code type
    if (coupon.couponType === 'code' && coupon.code) {
      const codeToCopy = coupon.code.trim();
      copyToClipboard(codeToCopy);
    }

    // Mark coupon as revealed
    if (coupon.id) {
      setRevealedCoupons(prev => new Set(prev).add(coupon.id!));
    }

    // Show popup
    setSelectedCoupon(coupon);
    setShowPopup(true);

    // Automatically open URL in new tab after a short delay (to ensure popup is visible first)
    if (coupon.url && coupon.url.trim()) {
      setTimeout(() => {
        window.open(coupon.url, '_blank', 'noopener,noreferrer');
      }, 500);
    }
  };

  const handlePopupContinue = () => {
    if (selectedCoupon?.url) {
      window.open(selectedCoupon.url, '_blank', 'noopener,noreferrer');
    }
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const copyToClipboard = (text: string) => {
    console.log('Attempting to copy:', text);

    // Method 1: Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Clipboard API success');
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
        // Fallback to execCommand
        copyToClipboardFallback(text);
      });
    } else {
      console.log('Using fallback method');
      // Use fallback for browsers without clipboard API or non-secure contexts
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      console.log('Using fallback copy method');
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Make it invisible but still selectable
      textArea.style.position = 'fixed';
      textArea.style.left = '0';
      textArea.style.top = '0';
      textArea.style.width = '2px';
      textArea.style.height = '2px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '-1';

      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      const successful = document.execCommand('copy');
      console.log('execCommand result:', successful);

      document.body.removeChild(textArea);

      if (successful) {
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      } else {
        // If execCommand fails, show the code to user
        addNotification({
          title: 'Copy Manually',
          message: `Code: ${text} (Please copy manually)`,
          type: 'info'
        });
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      addNotification({
        title: 'Copy Manually',
        message: `Code: ${text} (Please copy manually)`,
        type: 'info'
      });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, coupon: Coupon) => {
    e.stopPropagation();
    if (!coupon.id) return;

    if (isFavorite(coupon.id)) {
      removeFromFavorites(coupon.id);
      addNotification({
        title: 'Removed from Favorites',
        message: `${coupon.code} has been removed from your favorites.`,
        type: 'info'
      });
    } else {
      addToFavorites({
        couponId: coupon.id,
        code: coupon.code,
        storeName: coupon.storeName,
        discount: coupon.discount,
        discountType: coupon.discountType,
        description: coupon.description,
        logoUrl: coupon.logoUrl,
        url: coupon.url,
        addedAt: Date.now()
      });
      addNotification({
        title: 'Added to Favorites',
        message: `${coupon.code} has been added to your favorites!`,
        type: 'success'
      });
    }
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };


  return (
    <section className="py-16 section-white section-divider relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="section-eyebrow mb-4">Fresh Deals</span>
            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl mt-4">Latest Coupons</h2>
            <p className="section-subtitle mt-2">Freshly added deals &amp; verified discount codes</p>
          </div>
          <Link href="/coupons" className="btn-outline shrink-0">
            See All Coupons
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Coupons Grid - Always show 8 layout slots */}
        {loading ? (
          <>
            {/* Mobile: Horizontal Scrolling */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
              <div className="flex gap-3 min-w-max">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 w-[280px] flex-shrink-0 h-56 animate-pulse border border-gray-200 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      <div className="w-20 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2 mb-3 flex-grow">
                      <div className="w-full h-2 bg-gray-200 rounded"></div>
                      <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-full h-7 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 h-64 animate-pulse border border-gray-200 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2 mb-4 flex-grow">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mobile: Horizontal Scrolling Carousel */}
            <div className="md:hidden overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
              <div className="flex gap-3 min-w-max">
                {coupons.map((coupon, index) => (
                  coupon ? (
                    <div
                      key={coupon.id}
                      className={`bg-white rounded-lg p-3 w-[280px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col min-h-[200px] animate-scale-in ${index > 0 ? 'animate-delay-' + (index % 4 + 1) : ''}`}
                      style={{ overflow: 'visible' }}
                    >
                      {/* Logo and Brand Name */}
                      <div className="flex items-center gap-3 mb-3">
                        {coupon.logoUrl ? (
                          <div className="w-12 h-12 rounded flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0">
                            <img
                              src={coupon.logoUrl}
                              alt={coupon.storeName || coupon.code}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                const parent = target.parentElement;
                                if (parent) {
                                  const initial = coupon.code?.charAt(0) || coupon.storeName?.charAt(0) || '?';
                                  parent.innerHTML = `<span class="text-xs font-semibold text-gray-500">${initial}</span>`;
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-gray-500">
                              {coupon.code?.charAt(0) || coupon.storeName?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <h3 className="text-sm font-bold text-gray-900 flex-1 line-clamp-2">
                          {getCouponDisplayTitle(coupon)}
                        </h3>
                      </div>

                      {/* Expiry Date and Verified Badge */}
                      <div className="flex items-center justify-between mb-3 text-xs text-gray-500 flex-grow">
                        {coupon.expiryDate ? (
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(coupon.expiryDate) || '31 Dec, 2025'}</span>
                          </div>
                        ) : (
                          <span>31 Dec, 2025</span>
                        )}
                        <div className="flex items-center gap-1 text-brand-navy">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Verified</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mb-2 mt-auto">
                        <button
                          onClick={(e) => handleToggleFavorite(e, coupon)}
                          className={`p-2 rounded-lg transition-colors ${coupon.id && isFavorite(coupon.id)
                            ? 'bg-brand-cyan/15 text-[#C7395F]'
                            : 'bg-gray-100 text-gray-600 hover:bg-brand-red/15 hover:text-[#C7395F]'
                            }`}
                          title={coupon.id && isFavorite(coupon.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <svg className="w-4 h-4" fill={coupon.id && isFavorite(coupon.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>

                      {/* Get Deal Button */}
                      <button
                        onClick={(e) => handleGetDeal(coupon, e)}
                        className="w-full btn-cta py-2.5 text-sm"
                      >
                        <span className="flex-1 flex items-center justify-center">
                          {coupon.id && revealedCoupons.has(coupon.id) && coupon.couponType === 'code' && coupon.code ? (
                            <span className="font-bold text-sm sm:text-base drop-shadow-sm">
                              {coupon.code}
                            </span>
                          ) : (
                            <span className="drop-shadow-sm text-sm sm:text-base">
                              {getCodePreview(coupon)}
                            </span>
                          )}
                        </span>
                        {getLastTwoDigits(coupon) && !(coupon.id && revealedCoupons.has(coupon.id)) && (
                          <div className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all duration-300 ease-out flex items-center justify-center border-l-2 border-dashed border-white/70 ml-2 pl-2 whitespace-nowrap overflow-hidden bg-gradient-to-r from-transparent to-brand-navy-light/20" style={{ borderStyle: 'dashed' }}>
                            <span className="text-white font-bold text-xs drop-shadow-md">...{getLastTwoDigits(coupon)}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div
                      key={`empty-${index}`}
                      className="bg-gray-50 rounded-lg p-3 w-[280px] flex-shrink-0 border-2 border-dashed flex flex-col items-center justify-center min-h-[220px] border-gray-200"
                    >
                      <div className="text-gray-400 text-center">
                        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-xs font-medium">Layout {index + 1}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Empty Slot</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {coupons.map((coupon, index) => (
                coupon ? (
                  <div
                    key={coupon.id}
                    className="deal-card group p-5 flex flex-col relative overflow-hidden"
                  >
                    <div className="badge-verified absolute top-3 left-3 z-10">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, coupon)}
                      className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10 ${coupon.id && isFavorite(coupon.id)
                        ? 'bg-brand-cyan/15 text-brand-navy'
                        : 'text-gray-400 hover:text-brand-navy hover:bg-brand-red/10'
                        }`}
                    >
                      <svg className="w-4 h-4" fill={coupon.id && isFavorite(coupon.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>

                    {/* Coupon Logo */}
                    <div className="w-full h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center p-4 overflow-hidden mt-6 relative">
                      {coupon.logoUrl ? (
                        <img
                          src={coupon.logoUrl}
                          alt={coupon.storeName || coupon.code}
                          className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const initial = (coupon.storeName || coupon.code)?.charAt(0)?.toUpperCase() || '?';
                              parent.innerHTML = `<div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#C7395F] to-[#d45678] flex items-center justify-center"><span class="text-2xl font-bold text-white">${initial}</span></div>`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C7395F] to-[#d45678] flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {(coupon.storeName || coupon.code)?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {coupon.discount && (
                      <div className="flex justify-center mb-2 relative z-10">
                        <span className="badge-discount">{coupon.discount}</span>
                      </div>
                    )}

                    <h3 className="font-bold text-brand-navy text-base mb-2 group-hover:text-brand-navy-dark transition-colors line-clamp-2 text-center relative z-10">
                      {getCouponDisplayTitle(coupon)}
                    </h3>

                    <div className="flex items-center justify-center gap-1 mb-3 relative z-10">
                      <svg className="w-4 h-4 fill-brand-yellow text-brand-yellow" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">4.9</span>
                      <span className="text-xs text-gray-500">(120+ Reviews)</span>
                    </div>

                    {coupon.storeName && (
                      <p className="text-xs text-gray-500 text-center mb-4 line-clamp-1 relative z-10">
                        {coupon.storeName}
                      </p>
                    )}

                    <button
                      onClick={(e) => handleGetDeal(coupon, e)}
                      className="w-full btn-cta py-2.5 text-sm relative z-10"
                    >
                      <span className="flex items-center justify-center gap-2 flex-1">
                        {coupon.id && revealedCoupons.has(coupon.id) && coupon.couponType === 'code' && coupon.code ? (
                          <span className="font-bold">{coupon.code}</span>
                        ) : (
                          <>
                            {getCodePreview(coupon)}
                            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div
                    key={`empty-${index}`}
                    className="bg-gray-50 rounded-lg p-4 sm:p-5 border-2 border-dashed flex flex-col items-center justify-center min-h-[250px] border-gray-200"
                  >
                    <div className="text-gray-400 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-xs font-medium">Layout {index + 1}</p>
                      <p className="text-xs text-gray-400 mt-1">Empty Slot</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </>
        )}
      </div>

      {/* Coupon Popup */}
      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={handlePopupClose}
        onContinue={handlePopupContinue}
      />
    </section>
  );
}

