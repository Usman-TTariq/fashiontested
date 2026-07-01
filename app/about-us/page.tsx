import AboutUsPageClient from './AboutUsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'About Favento – Our Story & Mission',
  description: 'Learn about Favento – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.',
  alternates: { canonical: 'https://favento.com/about-us' },
  openGraph: {
    title: 'About Favento – Our Story & Mission',
    description: 'Learn about Favento – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.',
    url: 'https://favento.com/about-us',
  },
};

export default function AboutUsPage() {
  return (
    <>
      <AboutUsPageClient />
      <SiteFooter />
    </>
  );
}
