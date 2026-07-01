import SearchPageClient from './SearchPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  robots: { index: false },
};

export default function SearchPage() {
  return (
    <>
      <SearchPageClient />
      <SiteFooter />
    </>
  );
}
