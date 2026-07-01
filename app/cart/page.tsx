import CartPageClient from './CartPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  robots: { index: false },
};

export default function CartPage() {
  return (
    <>
      <CartPageClient />
      <SiteFooter />
    </>
  );
}
