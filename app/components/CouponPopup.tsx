'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coupon } from '@/lib/services/couponService';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';

interface CouponPopupProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function CouponPopup({ coupon, isOpen, onClose, onContinue }: CouponPopupProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !coupon) return null;

  const handleCopyCode = () => {
    if (coupon.couponType === 'code' && coupon.code) {
      navigator.clipboard.writeText(coupon.code.trim()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = coupon.code.trim();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 24 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 22, stiffness: 320 },
    },
    exit: { opacity: 0, scale: 0.9, y: 24, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08 + 0.15, duration: 0.35, type: 'spring' as const, stiffness: 220 },
    }),
  };

  return (
    <AnimatePresence>
      {isOpen && coupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute inset-0 bg-brand-red/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative max-w-md w-full"
          >
            <div className="absolute inset-0 rounded-2xl bg-tan/40 blur-xl -z-10" />

            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-tan bg-white">
              {/* Charcoal header strip */}
              <div className="relative bg-brand-red px-5 py-4 text-center">
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-70" />

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>

                <motion.h2
                  custom={0}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-white text-xl sm:text-2xl font-extrabold tracking-tight pr-8"
                >
                  {getCouponDisplayTitle(coupon)}
                </motion.h2>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Store logo card */}
                <motion.div
                  custom={1}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-xl p-4 border border-tan shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 mb-2 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-tan">
                      {coupon.logoUrl ? (
                        <img
                          src={coupon.logoUrl}
                          alt={coupon.storeName || 'Store logo'}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement && coupon.storeName) {
                              target.parentElement.innerHTML = `<span class="text-3xl font-bold text-brand-red">${coupon.storeName.charAt(0)}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-3xl font-bold text-brand-red">
                          {coupon.storeName?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <p className="text-brand-red text-sm font-bold text-center">
                      {coupon.storeName || 'Store'}
                    </p>
                    {coupon.url && (
                      <p className="text-[#99998A] text-xs mt-0.5 text-center">
                        {getDomainFromUrl(coupon.url)}
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Coupon code */}
                {coupon.couponType === 'code' && coupon.code && (
                  <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="relative bg-brand-red rounded-xl p-5 cursor-pointer overflow-hidden border border-brand-red"
                    onClick={handleCopyCode}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-red/40 to-transparent pointer-events-none" />

                    <div className="relative z-10 text-center">
                      <motion.div
                        animate={copied ? { scale: [1, 1.05, 1] } : {}}
                        className="text-white text-3xl sm:text-4xl font-black mb-2 tracking-wider select-all"
                      >
                        {coupon.code}
                      </motion.div>
                      <p className="text-white/70 text-xs font-semibold tracking-wide uppercase">
                        {copied ? (
                          <span className="inline-flex items-center gap-1.5 text-brand-red">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </span>
                        ) : (
                          'Click the code to auto copy'
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Deal type */}
                {coupon.couponType === 'deal' && coupon.url && (
                  <motion.div
                    custom={2}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative bg-brand-red rounded-xl p-5 border border-brand-red"
                  >
                    <div className="text-center">
                      <p className="text-white text-lg font-bold mb-1">Exclusive Deal Available!</p>
                      <p className="text-white/70 text-sm">
                        Click &ldquo;Continue to Store&rdquo; to access this deal
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  custom={3}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-2.5 pt-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleCopyCode();
                      onContinue();
                    }}
                    className="btn-cta w-full py-3.5 text-base rounded-xl"
                  >
                    Continue to Store
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-2.5 text-sm font-semibold text-brand-red bg-white border border-tan rounded-xl hover:bg-tan/40 transition-colors"
                  >
                    Close
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
