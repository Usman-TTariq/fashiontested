import StoresPageClient from './StoresPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'All Stores – Coupons & Cashback',
  description: 'Browse all stores on Favento and find the best coupons, discount codes, and cashback deals in one place.',
  alternates: { canonical: 'https://favento.com/stores' },
  openGraph: {
    title: 'All Stores – Coupons & Cashback',
    description: 'Browse all stores on Favento and find the best coupons, discount codes, and cashback deals in one place.',
    url: 'https://favento.com/stores',
  },
};

export default function StoresPage() {
  return (
    <>
      <StoresPageClient />
      <SiteFooter />
    </>
  );
}
