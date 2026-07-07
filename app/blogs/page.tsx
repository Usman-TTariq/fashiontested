import BlogsPageClient from './BlogsPageClient';
import SiteFooter from '@/app/components/SiteFooter'
import { Suspense } from 'react';

export const metadata = {
  title: 'Blog – Savings Tips, Deals & Lifestyle Articles',
  description: 'Read inspiring blogs, money-saving tips, coupon guides, and the latest deal news on FashionTested.',
  alternates: { canonical: 'https://fashiontested.com/blogs' },
  openGraph: {
    title: 'Blog – Savings Tips, Deals & Lifestyle Articles',
    description: 'Read inspiring blogs, money-saving tips, coupon guides, and the latest deal news.',
    url: 'https://fashiontested.com/blogs',
  },
};

export default function BlogsPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
        <BlogsPageClient />
      </Suspense>
      <SiteFooter />
    </>
  );
}
