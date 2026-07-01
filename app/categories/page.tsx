import CategoriesPageClient from './CategoriesPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Coupon Categories – Shop by Deal Type',
  description: 'Explore coupon categories on Favento. Find deals on fashion, electronics, food, travel, and more.',
  alternates: { canonical: 'https://favento.com/categories' },
  openGraph: {
    title: 'Coupon Categories – Shop by Deal Type',
    description: 'Explore coupon categories on Favento. Find deals on fashion, electronics, food, travel, and more.',
    url: 'https://favento.com/categories',
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
