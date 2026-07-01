export interface ParsedArticleMeta {
  category: string
  author: string
  popularity: number
  description: string
}

const DEFAULT: ParsedArticleMeta = {
  category: 'LIFESTYLE',
  author: 'Editorial Team',
  popularity: 0,
  description: '',
}

/** Parse excerpt stored as CATEGORY|||AUTHOR|||POPULARITY|||description */
export function parseArticleExcerpt(excerpt: string | null | undefined): ParsedArticleMeta {
  const raw = excerpt?.trim() || ''
  if (!raw) return { ...DEFAULT }

  const parts = raw.split('|||')
  if (parts.length >= 4) {
    return {
      category: (parts[0] || DEFAULT.category).toUpperCase(),
      author: parts[1] || DEFAULT.author,
      popularity: parseInt(parts[2], 10) || 0,
      description: parts.slice(3).join('|||'),
    }
  }

  return { ...DEFAULT, description: raw }
}

export function buildArticleExcerpt(
  category: string,
  author: string,
  description: string,
  popularity = 0
): string {
  return `${category.toUpperCase()}|||${author}|||${popularity}|||${description}`
}

export const BLOG_CATEGORIES = [
  'FASHION',
  'LIFESTYLE',
  'BEAUTY',
  'TRAVEL',
  'HEALTH',
  'ENTERTAINMENT',
  'FOOD',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

/** Display line: CATEGORY / DATE / BY AUTHOR */
export function formatArticleMetaLine(input: {
  category?: string | null
  date?: string | null
  author?: string | null
}): string {
  const cat = input.category?.trim().toUpperCase() || ''
  const date = input.date?.trim().toUpperCase() || ''
  const author = input.author?.trim()
    ? `BY ${input.author.trim().toUpperCase()}`
    : ''
  return [cat, date].filter(Boolean).join(' / ') + (author ? `${cat || date ? ' / ' : ''}${author}` : '')
}
