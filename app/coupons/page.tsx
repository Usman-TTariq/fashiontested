import CouponsPageClient from './CouponsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Promotions & Verified Deals',
  description: 'Browse hand-picked promo codes and exclusive deals from top brands on Favento. Verified daily — save more on every purchase.',
  alternates: { canonical: 'https://favento.com/coupons' },
  openGraph: {
    title: 'Promotions & Verified Deals',
    description: 'Browse hand-picked promo codes and exclusive deals from top brands. Verified daily.',
    url: 'https://favento.com/coupons',
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
