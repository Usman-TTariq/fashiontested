import { createClient } from '@/lib/supabase/client'
import { parseArticleExcerpt, buildArticleExcerpt } from '@/lib/utils/articleMeta'
import { resolveArticleImageUrl } from '@/lib/utils/articleImages'

export interface NewsArticle {
  id?: string
  title: string
  description: string
  content?: string
  imageUrl: string
  articleUrl?: string
  date?: string
  layoutPosition?: number | null
  createdAt?: string
  updatedAt?: string
  category?: string
  author?: string
  popularity?: number
  slug?: string
}

const supabase = createClient()

function mapArticleRow(item: Record<string, unknown>): NewsArticle {
  const meta = parseArticleExcerpt(item.excerpt as string)
  const createdAt = item.created_at as string | undefined

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

export { buildArticleExcerpt }

export async function createNewsFromUrl(
  title: string,
  articleUrl: string,
  imageUrl: string,
  description?: string,
  content?: string,
  layoutPosition?: number | null,
  date?: string
) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: title || '',
        excerpt: description || '',
        content: content || '',
        featured_image_url: imageUrl,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating news article:', error)
      return { success: false, error }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error creating news article from URL:', error)
    return { success: false, error }
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting news:', error)
      return []
    }

    return (data || []).map((item: any) => mapArticleRow(item))
  } catch (error) {
    console.error('Error getting news:', error)
    return []
  }
}

export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()

    if (error || !data) {
      console.error('Error getting news:', error)
      return null
    }

    return mapArticleRow(data as Record<string, unknown>)
  } catch (error) {
    console.error('Error getting news:', error)
    return null
  }
}

export async function getNewsWithLayout(): Promise<(NewsArticle | null)[]> {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error('Error getting news with layout:', error)
      return Array(4).fill(null)
    }

    const layoutSlots: (NewsArticle | null)[] = Array(4).fill(null)
    ;(data || []).forEach((item: any, index: number) => {
      if (index < 4) {
        layoutSlots[index] = {
          ...mapArticleRow(item),
          layoutPosition: index + 1,
        }
      }
    })

    return layoutSlots
  } catch (error) {
    console.error('Error getting news with layout:', error)
    return Array(4).fill(null)
  }
}

export async function updateNews(id: string, updates: Partial<NewsArticle>) {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updates.title) updateData.title = updates.title
    if (updates.description) {
      const existing = await getNewsById(id)
      const meta = existing
        ? { category: existing.category, author: existing.author, popularity: existing.popularity }
        : { category: 'LIFESTYLE', author: 'Editorial Team', popularity: 0 }
      updateData.excerpt = buildArticleExcerpt(
        meta.category || 'LIFESTYLE',
        meta.author || 'Editorial Team',
        updates.description,
        meta.popularity || 0
      )
    }
    if (updates.content) updateData.content = updates.content
    if (updates.imageUrl) updateData.featured_image_url = updates.imageUrl

    const { error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating news:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating news:', error)
    return { success: false, error }
  }
}

export async function deleteNews(id: string) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting news:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting news:', error)
    return { success: false, error }
  }
}
