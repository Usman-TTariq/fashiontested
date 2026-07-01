import ContactUsPageClient from './ContactUsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Favento team. We are available 24/7 to help with coupons, cashback, and account support.',
  alternates: { canonical: 'https://favento.com/contact-us' },
  openGraph: {
    title: 'Contact Us',
    description: 'Get in touch with the Favento team. We are available 24/7 to help with coupons, cashback, and account support.',
    url: 'https://favento.com/contact-us',
  },
};

export default function ContactUsPage() {
  return (
    <>
      <ContactUsPageClient />
      <SiteFooter />
    </>
  );
}
