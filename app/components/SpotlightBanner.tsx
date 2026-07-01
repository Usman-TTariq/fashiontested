'use client';

import { useEffect, useState } from 'react';
import { getBannerByLayoutPosition, Banner } from '@/lib/services/bannerService';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function SpotlightBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      try {
        const data = await getBannerByLayoutPosition(5);
        setBanner(data);
      } catch (error) {
        console.error('Error fetching spotlight banner:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  const missionPoints = [
    'Verified coupons from top brands',
    'Cashback rewards on every purchase',
    'Updated daily with fresh deals',
  ];

  if (loading) {
    return (
      <div className="section-dark py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 bg-white/10 rounded-2xl h-80 animate-pulse" />
            <div className="w-full md:w-1/2 bg-white/10 rounded-2xl h-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!banner) return null;

  return (
    <section className="section-dark py-16 section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="w-full md:w-1/2 space-y-6">
            <span className="section-eyebrow">Our Mission</span>
            <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">
              Smart Shopping Starts Here
            </h2>
            <p className="text-white/75 text-base leading-relaxed max-w-lg">
              Favento helps you find verified coupons and cashback offers from thousands of trusted retailers — so you save more on every purchase.
            </p>
            <ul className="space-y-3">
              {missionPoints.map((point) => (
                <li key={point} className="flex items-center gap-3 text-white/90 text-sm">
                  <Check className="check-cyan w-5 h-5" strokeWidth={3} />
                  {point}
                </li>
              ))}
            </ul>
            <Link href="/coupons" className="btn-cta inline-flex px-8 py-3 text-sm uppercase tracking-wide">
              Get My Coupon Code
            </Link>
          </div>

          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-3">
              <span className="badge-discount absolute top-5 left-5 z-10">20% OFF</span>
              <div className="aspect-[618/568] max-h-[420px] flex items-center justify-center">
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
