'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Facebook, Twitter, Instagram, Mail, ChevronUp } from 'lucide-react';
import ArticleImage from '@/app/components/ArticleImage';
import BrandLogo from '@/app/components/BrandLogo';
import { siteConfig } from '@/lib/seo/config';

export interface FooterPost {
  id?: string;
  title: string;
  date?: string;
  imageUrl?: string;
  category?: string;
}

export interface FooterBlogData {
  recent: FooterPost[];
  popular: FooterPost[];
  categories: { name: string; count: number }[];
}

interface FooterProps {
  blogData?: FooterBlogData;
}

const QUICK_LINKS = [
  { label: 'About', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
  { label: 'Imprint', href: '/terms-and-conditions' },
  { label: 'Promotions', href: '/promotions' },
  { label: 'Blog', href: '/blogs' },
] as const;

function FooterQuickLinks() {
  return (
    <div>
      <h3 className="text-base font-bold text-white mb-4 font-serif">Quick Links</h3>
      <ul>
        {QUICK_LINKS.map((link) => (
          <li key={link.href} className="border-b border-white/10 last:border-0">
            <Link
              href={link.href}
              className="block py-3 text-sm font-medium text-white/80 hover:text-brand-red transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterPostItem({ post }: { post: FooterPost }) {
  const content = (
    <div className="flex gap-3 group py-3">
      <div className="w-16 h-16 shrink-0 overflow-hidden bg-tan/40">
        <ArticleImage
          src={post.imageUrl}
          alt={post.title}
          category={post.category}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
          {post.title}
        </h4>
        {post.date && <p className="mt-1 text-xs text-white/60">{post.date}</p>}
      </div>
    </div>
  );

  if (post.id) {
    return (
      <Link href={`/blogs/${post.id}`} className="block border-b border-white/10 last:border-0">
        {content}
      </Link>
    );
  }

  return <div className="border-b border-white/10 last:border-0">{content}</div>;
}

function FooterNewsletterInline() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row w-full max-w-xl mx-auto overflow-hidden border border-tan bg-white"
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        className="flex-1 px-4 py-3 text-sm text-brand-navy outline-none min-w-0"
        aria-label="Email address"
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 bg-brand-red text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-brand-yellow-hover transition-colors shrink-0"
      >
        <Mail className="w-4 h-4" />
        Subscribe
      </button>
    </form>
  );
}

export default function Footer({ blogData }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recent = blogData?.recent ?? [];
  const popular = blogData?.popular ?? [];
  const categories = blogData?.categories ?? [];

  return (
    <footer className="relative bg-brand-navy text-white border-t border-brand-navy-light">
      {/* Blog columns + Quick Links */}
      <div className="border-b border-white/10">
        <div className="home-container py-10 sm:py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:items-stretch">
            <div>
              <h3 className="text-base font-bold text-white mb-4 font-serif">Recent Posts</h3>
              {recent.length === 0 ? (
                <p className="text-sm text-white/60">No posts yet.</p>
              ) : (
                recent.map((post) => (
                  <FooterPostItem key={`recent-${post.id || post.title}`} post={post} />
                ))
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-4 font-serif">Popular Posts</h3>
              {popular.length === 0 ? (
                <p className="text-sm text-white/60">No posts yet.</p>
              ) : (
                popular.map((post) => (
                  <FooterPostItem key={`popular-${post.id || post.title}`} post={post} />
                ))
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-white mb-4 font-serif">Popular Categories</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-white/60">No categories yet.</p>
              ) : (
                <ul>
                  {categories.map(({ name, count }) => (
                    <li key={name} className="border-b border-white/10 last:border-0">
                      <Link
                        href={`/blogs?category=${name.toLowerCase()}`}
                        className="flex items-center justify-between py-3 text-sm font-medium text-white/80 hover:text-brand-red transition-colors uppercase tracking-wide"
                      >
                        <span>{name}</span>
                        <span className="text-white/50 normal-case">({count})</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <FooterQuickLinks />
          </div>
        </div>
      </div>

      {/* Branding + newsletter + legal */}
      <div className="home-container py-10 sm:py-12 text-center relative">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <img src="/fashiontestedlogo.png" alt={siteConfig.name} className="w-14 h-14 object-contain" />
          <BrandLogo className="text-lg sm:text-xl font-bold tracking-[0.08em] text-white uppercase whitespace-nowrap" />
        </Link>

        <p className="max-w-2xl mx-auto text-sm text-white/70 leading-relaxed mb-6 px-4">
          {siteConfig.tagline}
        </p>

        {/* <div className="flex items-center justify-center gap-4 mb-8">
          {[
            { Icon: Facebook, label: 'Facebook' },
            { Icon: Twitter, label: 'Twitter' },
            { Icon: Instagram, label: 'Instagram' },
          ].map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="text-white/80 hover:text-brand-red transition-colors"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div> */}

        <div className="px-4 mb-8">
          <FooterNewsletterInline />
        </div>

        <p className="text-xs sm:text-sm text-white/60">
          Copyright © {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.{' '}
          <span className="hidden sm:inline">|</span>{' '}
          <Link href="/about-us" className="hover:text-brand-red transition-colors">
            About Us
          </Link>{' '}
          |{' '}
          <Link href="/terms-and-conditions" className="hover:text-brand-red transition-colors">
            Terms &amp; Conditions
          </Link>{' '}
          |{' '}
          <Link href="/privacy-policy" className="hover:text-brand-red transition-colors">
            Privacy Policy
          </Link>
        </p>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Back to top"
          className="absolute right-4 bottom-4 sm:right-0 sm:bottom-6 w-10 h-10 bg-brand-red text-white flex items-center justify-center hover:bg-brand-yellow-hover transition-colors shadow-md"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      </div>

      {/* Subtle skyline decoration */}
      <div
        className="h-16 sm:h-24 opacity-30 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(220,38,38,0.06) 0%, transparent 100%), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)',
        }}
        aria-hidden
      />
    </footer>
  );
}
