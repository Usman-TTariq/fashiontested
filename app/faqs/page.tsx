import FaqsPageClient from './FaqsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Support & FAQs',
  description: 'Find answers to common questions about FashionTested coupons, cashback, and account management.',
  alternates: { canonical: 'https://fashiontested.com/faqs' },
  openGraph: {
    title: 'Support & FAQs',
    description: 'Find answers to common questions about FashionTested coupons, cashback, and account management.',
    url: 'https://fashiontested.com/faqs',
  },
};

export default function FAQsPage() {
  return (
    <>
      <FaqsPageClient />
      <SiteFooter />
    </>
  );
}
