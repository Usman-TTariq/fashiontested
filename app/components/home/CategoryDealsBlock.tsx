'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/services/categoryService';
import { getCouponsByCategoryId, type Coupon } from '@/lib/services/couponService';
import DealCard from './DealCard';

interface CategoryDealsBlockProps {
  category: Category;
  title: string;
}

export default function CategoryDealsBlock({ category, title }: CategoryDealsBlockProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category.id) {
      setLoading(false);
      return;
    }
    getCouponsByCategoryId(category.id)
      .then((data) => setCoupons(data.filter((c) => c.isActive).slice(0, 5)))
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, [category.id]);

  if (!loading && coupons.length === 0) return null;

  return (
    <div className="mb-12 last:mb-0">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h3 className="home-section-title text-xl sm:text-2xl">{title}</h3>
        <Link
          href={`/categories/${category.slug || category.id}`}
          className="text-sm font-semibold text-brand-navy hover:text-brand-red transition-colors shrink-0"
        >
          See all →
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-xl border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {coupons.map((coupon) => (
            <DealCard key={coupon.id} coupon={coupon} tag="CATEGORY" />
          ))}
        </div>
      )}
    </div>
  );
}
