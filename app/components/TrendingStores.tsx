"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MoveRight, Star, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getStores, Store } from "@/lib/services/storeService";

export default function TrendingStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Trending Stores";

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await getStores();
        setStores(data.slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch stores", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, []);

  // Helper function to extract domain from URL (including tracking URLs)
  const extractDomain = (url: string): string | null => {
    if (!url) return null;
    try {
      // Handle tracking URLs that might redirect
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  };

  // Get favicon URL with fallback to tracking link
  const getFaviconUrl = (store: Store): string | null => {
    // Try website URL first
    if (store.websiteUrl) {
      const domain = extractDomain(store.websiteUrl);
      if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    // Fallback to tracking link
    if (store.trackingLink) {
      const domain = extractDomain(store.trackingLink);
      if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="w-full px-2 sm:px-4 md:px-6 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white h-80 rounded-xl shadow-sm animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 section-cream section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="section-eyebrow mb-4">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              Top Picks
            </span>
            <h2 className="section-title text-3xl md:text-4xl mt-4">
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="text-brand-accent"
              >
                |
              </motion.span>
            </h2>
            <p className="section-subtitle mt-2">Discover top-rated stores with exclusive deals</p>
          </div>
          <Link href="/stores" className="btn-outline shrink-0">
            View All <MoveRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="store-card group p-5 flex flex-col relative overflow-hidden"
            >
              <div className="badge-verified absolute top-3 left-3 z-10">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </div>

              <button className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-brand-navy hover:bg-brand-red/15 transition-colors z-10" aria-label="Add to favorites">
                <Heart className="w-4 h-4" />
              </button>

              <div className="w-full h-36 bg-surface rounded-xl mb-4 flex items-center justify-center p-4 mt-5 border border-[var(--border-subtle)]">
                {getFaviconUrl(store) ? (
                  <img
                    src={getFaviconUrl(store)!}
                    alt={store.name}
                    className="w-16 h-16 object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-14 h-14 rounded-xl bg-brand-navy flex items-center justify-center"><span class="text-xl font-bold text-white">${store.name.charAt(0).toUpperCase()}</span></div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-brand-navy flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{store.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-brand-navy transition-colors line-clamp-1 text-center">
                {store.name}
              </h3>

              {store.voucherText && (
                <div className="flex justify-center mb-3">
                  <span className="badge-discount">{store.voucherText}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                <span className="text-sm font-semibold text-brand-navy">4.9</span>
                <span className="text-xs text-gray-500">(120+)</span>
              </div>

              <p className="text-xs text-gray-500 text-center mb-4 line-clamp-2 flex-grow">
                {store.description || `Get the best deals and coupons for ${store.name}.`}
              </p>

              <Link
                href={store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`}
                className="btn-cta w-full text-sm py-2.5"
              >
                Visit Store
                <MoveRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
