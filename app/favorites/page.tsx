import FavoritesPageClient from './FavoritesPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  robots: { index: false },
};

export default function FavoritesPage() {
  return (
    <>
      <FavoritesPageClient />
      <SiteFooter />
    </>
  );
}
