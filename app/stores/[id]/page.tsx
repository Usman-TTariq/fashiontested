import { Metadata } from 'next';
import StorePageClient from './StorePageClient';
import SiteFooter from '@/app/components/SiteFooter';
import { siteConfig } from '@/lib/seo/config';
import { getStoreBySlugOrIdServer } from '@/lib/services/storeServer';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const store = await getStoreBySlugOrIdServer(id).catch(() => null);

  const title = store?.seoTitle || (store?.name ? `${store.name} Coupons & Promo Codes ${new Date().getFullYear()}` : 'Store Not Found');
  const description = store?.seoDescription || (store?.name ? `Find the latest ${store.name} coupons, promo codes, and cashback offers on ${siteConfig.name}. Verified deals updated daily.` : '');
  const canonical = `${siteConfig.url}/stores/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function StorePage({ params }: Props) {
  const resolvedParams = await params;
  const initialStore = await getStoreBySlugOrIdServer(resolvedParams.id).catch(() => null);
  return (
    <>
      <StorePageClient params={resolvedParams} initialStore={initialStore} />
      <SiteFooter />
    </>
  );
}
