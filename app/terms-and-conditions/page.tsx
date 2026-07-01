import TermsAndConditionsPageClient from './TermsAndConditionsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  title: 'Terms and Conditions',
  description: 'Review the terms and conditions for using Favento coupon and cashback platform.',
  alternates: { canonical: 'https://favento.com/terms-and-conditions' },
  openGraph: {
    title: 'Terms and Conditions',
    description: 'Review the terms and conditions for using Favento coupon and cashback platform.',
    url: 'https://favento.com/terms-and-conditions',
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <TermsAndConditionsPageClient />
      <SiteFooter />
    </>
  );
}
