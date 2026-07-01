import { supabaseServer } from '@/lib/supabase/server'
import { parseArticleExcerpt, BLOG_CATEGORIES } from '@/lib/utils/articleMeta'
import { resolveArticleImageUrl } from '@/lib/utils/articleImages'
import type { NewsArticle } from '@/lib/services/newsService'

export interface FooterBlogPost {
  id?: string
  title: string
  date?: string
  imageUrl?: string
  category?: string
}

export interface FooterBlogData {
  recent: FooterBlogPost[]
  popular: FooterBlogPost[]
  categories: { name: string; count: number }[]
}

function toFooterPost(article: NewsArticle): FooterBlogPost {
  return {
    id: article.id,
    title: article.title,
    date: article.date,
    imageUrl: article.imageUrl,
    category: article.category,
  }
}

export function buildFooterBlogData(articles: NewsArticle[]): FooterBlogData {
  const recent = articles.slice(0, 3).map(toFooterPost)
  const recentIds = new Set(recent.map((post) => post.id).filter(Boolean) as string[])

  const popular = [...articles]
    .sort((a, b) => {
      const byPopularity = (b.popularity || 0) - (a.popularity || 0)
      if (byPopularity !== 0) return byPopularity
      return (b.createdAt || '').localeCompare(a.createdAt || '')
    })
    .filter((article) => article.id && !recentIds.has(article.id))
    .slice(0, 3)
    .map(toFooterPost)

  const categories = BLOG_CATEGORIES.map((name) => ({
    name,
    count: articles.filter((a) => a.category?.toUpperCase() === name).length,
  })).filter((c) => c.count > 0)

  return { recent, popular, categories }
}

function mapRow(item: Record<string, unknown>): NewsArticle {
  const meta = parseArticleExcerpt(item.excerpt as string)
  const createdAt = item.created_at as string

  return {
    id: item.id != null ? String(item.id) : undefined,
    title: String(item.title || ''),
    description: meta.description,
    content: (item.content as string) || '',
    imageUrl: resolveArticleImageUrl(item.featured_image_url as string, meta.category),
    articleUrl: '',
    date: createdAt
      ? new Date(createdAt).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : undefined,
    layoutPosition: null,
    createdAt,
    updatedAt: item.updated_at as string | undefined,
    category: meta.category,
    author: meta.author,
    popularity: meta.popularity,
    slug: (item.slug as string) || undefined,
  }
}

export async function getArticlesForHome(): Promise<NewsArticle[]> {
  const supabase = supabaseServer()

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getArticlesForHome error:', error)
    return []
  }

  return (data || []).map((row) => mapRow(row as Record<string, unknown>))
}

export async function getFooterBlogData(): Promise<FooterBlogData> {
  const articles = await getArticlesForHome()
  return buildFooterBlogData(articles)
}
