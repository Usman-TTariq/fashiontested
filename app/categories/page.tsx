import CategoriesPageClient from './CategoriesPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Coupon Categories – Shop by Deal Type',
  description: 'Explore coupon categories on FashionTested. Find deals on fashion, electronics, food, travel, and more.',
  alternates: { canonical: 'https://fashiontested.com/categories' },
  openGraph: {
    title: 'Coupon Categories – Shop by Deal Type',
    description: 'Explore coupon categories on FashionTested. Find deals on fashion, electronics, food, travel, and more.',
    url: 'https://fashiontested.com/categories',
  },
};

export default function CategoriesPage() {
  return (
    <>
      <CategoriesPageClient />
      <SiteFooter />
    </>
  );
}
