import Footer from '@/app/components/Footer';
import { getFooterBlogData } from '@/lib/server/newsServer';

export default async function SiteFooter() {
  const blogData = await getFooterBlogData();
  return <Footer blogData={blogData} />;
}
