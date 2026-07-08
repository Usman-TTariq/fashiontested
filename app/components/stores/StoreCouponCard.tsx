'use client';

import type { MouseEvent } from 'react';
import { Calendar, CheckCircle, Copy, ExternalLink, Flame, Sparkles } from 'lucide-react';
import type { Coupon } from '@/lib/services/couponService';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';

function formatDiscountLabel(coupon: Coupon): string {
  if (coupon.discountType === 'percentage' && coupon.discount) {
    return `${coupon.discount}% OFF`;
  }
  if (coupon.discount) {
    return `$${coupon.discount} OFF`;
  }
  return coupon.couponType === 'code' ? 'CODE' : 'DEAL';
}

function formatExpiry(timestamp: unknown): string | null {
  if (!timestamp) return null;
  try {
    const date =
      typeof timestamp === 'object' &&
      timestamp !== null &&
      'toDate' in timestamp &&
      typeof (timestamp as { toDate: () => Date }).toDate === 'function'
        ? (timestamp as { toDate: () => Date }).toDate()
        : new Date(timestamp as string);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

export default function StoreCouponCard({
  coupon,
  storeName,
  logoUrl,
  logoFallback,
  isExpired,
  isFeatured,
  copiedCode,
  onActivate,
}: {
  coupon: Coupon;
  storeName: string;
  logoUrl?: string;
  logoFallback: string;
  isExpired: boolean;
  isFeatured?: boolean;
  copiedCode: string | null;
  onActivate: () => void;
}) {
  const title = getCouponDisplayTitle(coupon);
  const expiryLabel = formatExpiry(coupon.expiryDate);
  const isCode = coupon.couponType === 'code';
  const ctaLabel = isCode
    ? copiedCode === coupon.code
      ? 'Copied!'
      : coupon.getCodeText || 'Get Code'
    : coupon.getDealText || 'Get Deal';
  const verifiedSubtext = isCode ? 'Verified and Hand Tested Code' : 'Verified and Hand Tested Deal';

  const handleActivate = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (!isExpired) onActivate();
  };

  return (
    <>
      {/* Mobile — compact horizontal row */}
      <article
        className={`md:hidden group flex items-center gap-2.5 bg-white rounded-lg border p-2.5 transition-all ${
          isFeatured ? 'border-brand-red/60' : 'border-gray-200'
        } ${isExpired ? 'opacity-60' : 'cursor-pointer active:bg-gray-50'}`}
        onClick={() => handleActivate()}
      >
        <div className="w-10 h-10 shrink-0 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            <img src={logoUrl} alt="" className="w-full h-full object-contain p-0.5" />
          ) : (
            <span className="text-sm font-bold text-brand-red">{logoFallback}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 leading-snug">{title}</h3>
          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{verifiedSubtext}</p>
        </div>

        <div className="shrink-0">
          {isExpired ? (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1.5 rounded">Expired</span>
          ) : (
            <button
              type="button"
              onClick={handleActivate}
              className="btn-cta py-2 px-3 text-xs font-bold whitespace-nowrap"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </article>

      {/* Tablet + desktop — rich card */}
      <article
        className={`hidden md:block group relative bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
          isFeatured
            ? 'border-brand-red shadow-md ring-1 ring-brand-red/30'
            : 'border-gray-200 hover:border-brand-red/50 hover:shadow-md'
        } ${isExpired ? 'opacity-60' : 'cursor-pointer'}`}
        onClick={() => handleActivate()}
      >
        {isFeatured && (
          <span className="absolute top-0 left-0 z-10 bg-brand-red text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-br-lg">
            Featured
          </span>
        )}

        <div className="flex flex-row items-stretch">
          <div className="flex flex-col items-center justify-center w-28 shrink-0 bg-brand-red/[0.04] border-r border-brand-red/20 px-4 py-5">
            <span className="text-3xl font-extrabold text-brand-red leading-none text-center">
              {formatDiscountLabel(coupon)}
            </span>
          </div>

          <div className="flex flex-1 flex-row items-center gap-3 p-4 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide bg-charcoal text-white px-2 py-0.5 rounded">
                  {isCode ? 'Code' : 'Deal'}
                </span>
                {coupon.isPopular && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide bg-brand-red/10 text-brand-red px-2 py-0.5 rounded">
                    <Flame className="w-3 h-3" />
                    Trending
                  </span>
                )}
                {coupon.isLatest && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide bg-brand-cyan/15 text-brand-red px-2 py-0.5 rounded">
                    <Sparkles className="w-3 h-3" />
                    New
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <p className="text-xs font-semibold text-brand-muted mb-0.5">{storeName}</p>
              <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2">{title}</h3>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                {expiryLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-red shrink-0" />
                    Expires {expiryLabel}
                  </span>
                )}
                {(coupon.currentUses ?? 0) > 0 && (
                  <span>Used {coupon.currentUses} times</span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {isExpired ? (
                <span className="block text-center bg-red-100 text-red-700 text-xs font-bold px-4 py-2.5 rounded-lg">
                  Expired
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleActivate}
                  className="btn-cta py-2.5 px-5 text-sm whitespace-nowrap"
                >
                  {isCode ? <Copy className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                  {ctaLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
