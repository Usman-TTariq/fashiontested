import PrivacyPolicyPageClient from './PrivacyPolicyPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read FashionTested privacy policy to understand how we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://fashiontested.com/privacy-policy' },
  openGraph: {
    title: 'Privacy Policy',
    description: 'Read FashionTested privacy policy to understand how we collect, use, and protect your personal information.',
    url: 'https://fashiontested.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PrivacyPolicyPageClient />
      <SiteFooter />
    </>
  );
}
