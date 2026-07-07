import CouponsPageClient from './CouponsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Promotions & Verified Deals',
  description: 'Browse hand-picked promo codes and exclusive deals from top brands on FashionTested. Verified daily — save more on every purchase.',
  alternates: { canonical: 'https://fashiontested.com/coupons' },
  openGraph: {
    title: 'Promotions & Verified Deals',
    description: 'Browse hand-picked promo codes and exclusive deals from top brands. Verified daily.',
    url: 'https://fashiontested.com/coupons',
  },
};

export default function CouponsPage() {
  return (
    <>
      <CouponsPageClient />
      <SiteFooter />
    </>
  );
}
