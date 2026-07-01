import { Metadata } from 'next';
import BlogPageClient from './BlogPageClient';
import SiteFooter from '@/app/components/SiteFooter'
import { siteConfig } from '@/lib/seo/config';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { getNewsById } = await import('@/lib/services/newsService');
  const article = await getNewsById(id).catch(() => null);

  const title = article?.title || 'Blog Post';
  const description = article?.description || article?.content?.slice(0, 155) || `Read the latest articles on ${siteConfig.name} blog.`;
  const canonical = `${siteConfig.url}/blogs/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function BlogPage({ params }: Props) {
  const resolvedParams = await params;
  return (
    <>
      <BlogPageClient params={resolvedParams} />
      <SiteFooter />
    </>
  );
}
