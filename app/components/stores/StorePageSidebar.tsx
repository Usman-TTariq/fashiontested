'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Star } from 'lucide-react';
import type { Store } from '@/lib/services/storeService';
import type { Coupon } from '@/lib/services/couponService';

function storeHref(store: Store) {
  return store.slug ? `/stores/${store.slug}` : store.id ? `/stores/${store.id}` : '/stores';
}

function getAboutText(store: Store): string {
  const desc = store.description?.trim();
  if (desc && !/\bdemo\b/i.test(desc) && !/for testing/i.test(desc)) {
    return desc;
  }
  return `Save money with verified ${store.name} coupon codes and exclusive promo deals. FashionTested hand-tests every offer so you get working discounts.`;
}

function getLastUpdated(coupons: Coupon[], store: Store): string {
  const dates: number[] = [];
  for (const c of coupons) {
    if (c.updatedAt) dates.push(new Date(c.updatedAt).getTime());
    else if (c.createdAt) dates.push(new Date(c.createdAt).getTime());
  }
  if (store.createdAt) dates.push(new Date(store.createdAt).getTime());
  if (dates.length === 0) {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  return new Date(Math.max(...dates)).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StorePageSidebar({
  store,
  coupons,
  allStores,
  relatedStores,
  getLogoUrl,
}: {
  store: Store;
  coupons: Coupon[];
  allStores: Store[];
  relatedStores: Store[];
  getLogoUrl: (store: Store) => string;
}) {
  const codeCount = coupons.filter((c) => c.couponType === 'code').length;
  const dealCount = coupons.filter((c) => c.couponType !== 'code').length;
  const storeName = store.subStoreName || store.name;
  const lastUpdated = getLastUpdated(coupons, store);

  const stats = [
    { label: 'Total Offers', value: coupons.length },
    { label: 'Coupon Codes', value: codeCount },
    { label: 'Deals', value: dealCount },
    { label: 'Stores on Site', value: allStores.length },
  ];

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Store identity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 shrink-0 bg-gray-50 rounded-lg border border-gray-100 p-2 flex items-center justify-center">
            <img
              src={store.logoUrl || getLogoUrl(store)}
              alt={storeName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{storeName}</h2>
            <div className="flex items-center gap-1 mt-1 text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs text-gray-600 font-medium">4.9 · Verified store</span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-2">About {storeName}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{getAboutText(store)}</p>
        <p className="text-xs font-semibold text-brand-red mt-3">Last updated: {lastUpdated}</p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Today&apos;s {storeName} stats</h3>
        <dl className="space-y-2">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <dt className="text-gray-600">{label}</dt>
              <dd className="font-bold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Related stores */}
      {relatedStores.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Top stores</h3>
          <ul className="space-y-2">
            {relatedStores.slice(0, 6).map((related) => (
              <li key={related.id}>
                <Link
                  href={storeHref(related)}
                  className="flex items-center gap-2.5 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-8 h-8 shrink-0 bg-gray-50 rounded border border-gray-100 p-1 flex items-center justify-center">
                    <img
                      src={related.logoUrl || getLogoUrl(related)}
                      alt={related.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-800 group-hover:text-brand-red line-clamp-1">
                    {related.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/stores"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-red mt-3 hover:underline"
          >
            View all {allStores.length} stores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Trust + disclosure */}
      {/* <div className="bg-brand-cyan/10 rounded-xl border border-brand-red/10 p-4">
        <div className="flex items-start gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
          <p className="text-xs text-gray-700 leading-relaxed">
            Offers are verified by our editorial team. We may earn a commission when you shop through
            our links at no extra cost to you.
          </p>
        </div>
        <p className="text-[10px] text-gray-500">
          Affiliate disclosure · FashionTested editorial team
        </p>
      </div> */}
    </aside>
  );
}
