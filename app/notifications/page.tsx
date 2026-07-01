import NotificationsPageClient from './NotificationsPageClient';
import SiteFooter from '@/app/components/SiteFooter'

export const metadata = {
  robots: { index: false },
};

export default function NotificationsPage() {
  return (
    <>
      <NotificationsPageClient />
      <SiteFooter />
    </>
  );
}
