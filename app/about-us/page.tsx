import AboutUsPageClient from './AboutUsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'About FashionTested – Our Story & Mission',
  description: 'Learn about FashionTested – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.',
  alternates: { canonical: 'https://fashiontested.com/about-us' },
  openGraph: {
    title: 'About FashionTested – Our Story & Mission',
    description: 'Learn about FashionTested – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.',
    url: 'https://fashiontested.com/about-us',
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
