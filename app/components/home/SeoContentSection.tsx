'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStores, Store } from '@/lib/services/storeService';
import { getCategories, Category } from '@/lib/services/categoryService';

export default function SeoContentSection() {
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    Promise.all([getStores(), getCategories()])
      .then(([s, c]) => {
        setStores(s.slice(0, 12));
        setCategories(c.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="home-section bg-[var(--surface-alt)] section-divider">
      <div className="home-container">
        <div className="max-w-4xl">
          <h2 className="home-section-title mb-4">
            Favento is your place to save every day
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-brand-muted leading-relaxed">
            <p>
              Welcome to Favento — your trusted destination for verified coupon codes,
              exclusive promo deals, and savings from hundreds of top online retailers. We help
              smart shoppers find the best discounts on fashion, electronics, travel, home goods,
              and more.
            </p>
            <p>
              Every coupon on our site is checked and updated regularly so you can shop with
              confidence. Whether you&apos;re looking for percentage-off codes, free shipping offers,
              or limited-time deals, Favento makes it easy to save on every purchase.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-brand-navy mb-4">Popular Stores</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {stores.map((store) => (
                <li key={store.id}>
                  <Link
                    href={store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`}
                    className="text-sm text-brand-muted hover:text-brand-red transition-colors"
                  >
                    {store.name} Coupons
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-brand-navy mb-4">Shop by Category</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.id}`}
                    className="text-sm text-brand-muted hover:text-brand-red transition-colors"
                  >
                    {cat.name} Deals
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
