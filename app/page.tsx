import Navbar from './components/Navbar'
import SiteFooter from './components/SiteFooter'
import BlogCentricHome from './components/home/BlogCentricHome'
import { getArticlesForHome } from '@/lib/server/newsServer'
import { siteConfig } from '@/lib/seo/config'

export const metadata = {
  title: 'Success Blogs, Coupons & Thrilling Experiences',
  description: `Inspiring blogs, exclusive promo codes, and money-saving tips from ${siteConfig.name} — your path to smarter shopping.`,
}

export const revalidate = 60

export default async function Home() {
  const articles = await getArticlesForHome()

  return (
    <div className="min-h-screen bg-cream">
      <Navbar variant="home" />
      <BlogCentricHome articles={articles} />
      <SiteFooter />
    </div>
  )
}
