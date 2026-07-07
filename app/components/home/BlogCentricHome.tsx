import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import ArticleImage from '@/app/components/ArticleImage'
import type { NewsArticle } from '@/lib/services/newsService'
import { BLOG_CATEGORIES, formatArticleMetaLine } from '@/lib/utils/articleMeta'

interface BlogCentricHomeProps {
  articles: NewsArticle[]
}

function formatArticleMetaFull(article: NewsArticle): string {
  return formatArticleMetaLine({
    category: article.category,
    date: article.date,
    author: article.author,
  })
}

function formatArticleMetaShort(article: NewsArticle): string {
  return formatArticleMetaLine({
    category: article.category,
    date: article.date,
  })
}

function formatCardIndex(index: number): string {
  return String(index).padStart(3, '0')
}

function BentoHeroCard({
  article,
  index,
  className = '',
  size = 'medium',
}: {
  article: NewsArticle
  index: number
  className?: string
  size?: 'large' | 'medium' | 'small'
}) {
  if (!article.id) return null

  const titleClass =
    size === 'large'
      ? 'text-xl sm:text-2xl md:text-[1.65rem] line-clamp-3'
      : size === 'small'
        ? 'text-base sm:text-lg line-clamp-2'
        : 'text-lg sm:text-xl line-clamp-2'

  return (
    <div className={`group relative ${className}`}>
      <Link
        href={`/blogs/${article.id}`}
        className="relative block h-full min-h-[inherit] overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] bg-neutral-900 shadow-sm transition-shadow duration-300 hover:shadow-lg"
      >
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          category={article.category}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 sm:p-5">
          {article.category && (
            <span className="inline-flex rounded-full border border-white/70 bg-white/15 px-3.5 py-1.5 text-xs font-medium capitalize text-white backdrop-blur-sm">
              {article.category.toLowerCase()}
            </span>
          )}
          {article.date && (
            <span className="ml-auto inline-flex shrink-0 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {article.date}
            </span>
          )}
        </div>

        <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 pb-16 pr-16 sm:p-5 sm:pb-[4.5rem] sm:pr-[4.5rem]">
          <span className="mb-1.5 text-xs font-medium tracking-[0.2em] text-white/75">
            {formatCardIndex(index)}
          </span>
          <h3 className={`font-bold leading-snug text-white ${titleClass}`}>{article.title}</h3>
        </div>
      </Link>

      {/* Scooped corner cutout */}
      {/* <div
        className="pointer-events-none absolute bottom-0 right-0 z-10 size-[4.25rem] rounded-tl-[100%] bg-cream sm:size-[4.75rem]"
        aria-hidden
      /> */}

      <span
        className="pointer-events-none absolute bottom-3 right-3 z-20 flex size-11 items-center justify-center rounded-full bg-white text-brand-navy shadow-md transition-transform duration-300 group-hover:scale-105 sm:bottom-3.5 sm:right-3.5 sm:size-12"
        aria-hidden
      >
        <ArrowUpRight className="size-5" strokeWidth={2} />
      </span>
    </div>
  )
}

function BentoHeroSection({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null

  const [left, topMiddle, right, bottomLeft, bottomRight] = articles

  if (articles.length < 5) {
    return (
      <section className="w-full bg-white px-[12px] pt-[10px] border-b-0">
        <div className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <BentoHeroCard
              key={article.id}
              article={article}
              index={i + 1}
              className="min-h-[300px]"
              size="large"
            />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-white px-[12px] pt-[10px] border-b-0">
      <div className="grid w-full grid-cols-1 gap-1 sm:gap-2 md:grid-cols-3 md:grid-rows-2 md:min-h-[540px] lg:min-h-[580px]">
          {left && (
            <BentoHeroCard
              article={left}
              index={1}
              className="min-h-[320px] md:row-span-2 md:min-h-full"
              size="large"
            />
          )}

          {topMiddle && (
            <BentoHeroCard
              article={topMiddle}
              index={2}
              className="min-h-[240px] md:col-start-2 md:row-start-1"
              size="medium"
            />
          )}

          {right && (
            <BentoHeroCard
              article={right}
              index={3}
              className="min-h-[320px] md:col-start-3 md:row-start-1 md:row-span-2 md:min-h-full"
              size="large"
            />
          )}

          {(bottomLeft || bottomRight) && (
            <div className="grid min-h-[220px] grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2 md:col-start-2 md:row-start-2">
              {bottomLeft && (
                <BentoHeroCard article={bottomLeft} index={4} className="min-h-[220px]" size="small" />
              )}
              {bottomRight && (
                <BentoHeroCard article={bottomRight} index={5} className="min-h-[220px]" size="small" />
              )}
            </div>
          )}
      </div>
    </section>
  )
}

const CATEGORY_LABEL_COLORS: Record<string, string> = {
  FASHION: 'bg-brand-navy text-white',
  LIFESTYLE: 'bg-brand-red text-white',
  BEAUTY: 'bg-brand-navy-light text-white',
  TRAVEL: 'bg-brand-red text-white',
  HEALTH: 'bg-brand-navy text-white',
  ENTERTAINMENT: 'bg-brand-red text-white',
  FOOD: 'bg-brand-navy text-white',
}

function CategoryLabel({ category }: { category: string }) {
  const isRed = CATEGORY_LABEL_COLORS[category.toUpperCase()]?.includes('brand-red')
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <Link
        href={`/blogs?category=${category.toLowerCase()}`}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors ${
          isRed
            ? 'bg-brand-red text-white hover:bg-brand-yellow-hover'
            : 'bg-brand-navy text-white hover:bg-brand-navy-light'
        }`}
      >
        {category}
      </Link>
      <Link
        href={`/blogs?category=${category.toLowerCase()}`}
        className="hidden text-xs font-semibold text-brand-red hover:underline sm:inline"
      >
        View all →
      </Link>
    </div>
  )
}

function EditorialOverlayCard({
  article,
  index,
  size = 'medium',
  className = '',
}: {
  article: NewsArticle
  index?: number
  size?: 'large' | 'medium' | 'small'
  className?: string
}) {
  if (!article.id) return null

  const titleClass =
    size === 'large'
      ? 'text-xl sm:text-2xl md:text-[1.75rem] line-clamp-3'
      : size === 'small'
        ? 'text-sm sm:text-[15px] line-clamp-3'
        : 'text-base sm:text-lg line-clamp-2'

  const radiusClass = size === 'large' ? 'rounded-[1.75rem] sm:rounded-[2rem]' : 'rounded-2xl sm:rounded-[1.25rem]'
  const paddingClass = size === 'large' ? 'p-5 sm:p-6 pb-16 pr-16 sm:pb-[4.25rem] sm:pr-[4.25rem]' : 'p-4 pb-14 pr-14 sm:p-4 sm:pb-[3.75rem] sm:pr-[3.75rem]'
  const btnSizeClass =
    size === 'large'
      ? 'absolute bottom-3.5 right-3.5 size-11 sm:size-12'
      : 'absolute bottom-2.5 right-2.5 size-9 sm:size-10'

  return (
    <div className={`group relative ${className}`}>
      <Link
        href={`/blogs/${article.id}`}
        className={`relative block h-full min-h-[inherit] overflow-hidden bg-neutral-900 shadow-sm transition-shadow duration-300 hover:shadow-lg ${radiusClass}`}
      >
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          category={article.category}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4 sm:p-5">
          {article.category && (
            <span className="inline-flex rounded-full border border-white/70 bg-white/15 px-3 py-1 text-[10px] font-medium capitalize text-white backdrop-blur-sm sm:text-xs">
              {article.category.toLowerCase()}
            </span>
          )}
          {article.date && (
            <span className="ml-auto inline-flex shrink-0 rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium text-white backdrop-blur-sm sm:text-xs">
              {article.date}
            </span>
          )}
        </div>

        <div className={`relative flex h-full min-h-[inherit] flex-col justify-end ${paddingClass}`}>
          {index != null && (
            <span className="mb-1 text-[10px] font-medium tracking-[0.2em] text-white/70 sm:text-xs">
              {formatCardIndex(index)}
            </span>
          )}
          <h3 className={`font-bold leading-snug text-white ${titleClass}`}>{article.title}</h3>
        </div>
      </Link>

      <span
        className={`pointer-events-none absolute z-20 flex items-center justify-center rounded-full bg-white text-brand-navy shadow-md transition-transform duration-300 group-hover:scale-105 ${btnSizeClass}`}
        aria-hidden
      >
        <ArrowUpRight className={size === 'large' ? 'size-5' : 'size-4'} strokeWidth={2} />
      </span>
    </div>
  )
}

function FeaturedPostLarge({
  article,
  showExcerpt = false,
}: {
  article: NewsArticle
  showExcerpt?: boolean
}) {
  if (!article.id) return null

  return (
    <article>
      <EditorialOverlayCard article={article} index={1} size="large" className="min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]" />
      {showExcerpt && article.description && (
        <p className="mt-4 text-sm sm:text-[15px] text-brand-muted leading-relaxed line-clamp-3 px-1">
          {article.description}
        </p>
      )}
      {!showExcerpt && (
        <p className="mt-4 px-1 text-[10px] font-medium tracking-[0.08em] text-brand-muted uppercase sm:text-[11px]">
          {formatArticleMetaFull(article)}
        </p>
      )}
    </article>
  )
}

function GridPostCard({ article, index }: { article: NewsArticle; index: number }) {
  if (!article.id) return null

  return (
    <article>
      <EditorialOverlayCard article={article} index={index} size="small" className="min-h-[200px] sm:min-h-[220px]" />
    </article>
  )
}

function CategorySplitRow({
  leftCategory,
  rightCategory,
  leftPosts,
  rightPosts,
  showExcerpt = false,
  usedIds,
}: {
  leftCategory: string
  rightCategory: string | null
  leftPosts: NewsArticle[]
  rightPosts: NewsArticle[]
  showExcerpt?: boolean
  usedIds?: Set<string>
}) {
  const leftFeatured = leftPosts[0]
  const gridPosts = rightPosts.slice(0, 4)

  if (!leftFeatured && gridPosts.length === 0) return null

  if (leftFeatured?.id) usedIds?.add(leftFeatured.id)
  gridPosts.forEach((p) => p.id && usedIds?.add(p.id))

  return (
    <section className="mb-14 sm:mb-16 last:mb-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
        {leftFeatured && (
          <div className={rightCategory && gridPosts.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <CategoryLabel category={leftCategory} />
            <FeaturedPostLarge article={leftFeatured} showExcerpt={showExcerpt} />
          </div>
        )}

        {rightCategory && gridPosts.length > 0 && (
          <div className="lg:col-span-5 lg:border-l lg:border-tan lg:pl-8">
            <CategoryLabel category={rightCategory} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {gridPosts.map((article, i) => (
                <GridPostCard key={article.id} article={article} index={i + 2} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function HorizontalListPost({
  article,
  index,
  showExcerpt = true,
}: {
  article: NewsArticle
  index: number
  showExcerpt?: boolean
}) {
  if (!article.id) return null

  return (
    <article className="mb-6 border-b border-tan pb-6 last:mb-0 last:border-b-0 last:pb-0">
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5">
          <EditorialOverlayCard
            article={article}
            index={index}
            size="medium"
            className="min-h-[240px] sm:min-h-[260px] md:min-h-[280px]"
          />
        </div>

        <div className="flex flex-col justify-center md:col-span-7 md:py-2">
          <Link href={`/blogs/${article.id}`} className="group/title md:hidden">
            <h3 className="mb-3 text-lg font-bold leading-snug text-brand-navy group-hover/title:text-brand-red transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          {showExcerpt && article.description && (
            <p className="text-sm leading-relaxed text-brand-muted line-clamp-4 sm:text-[15px]">
              {article.description}
            </p>
          )}

          <p className="mt-4 text-[10px] font-medium tracking-[0.08em] text-brand-muted uppercase sm:text-[11px]">
            {formatArticleMetaFull(article)}
          </p>

          <Link
            href={`/blogs/${article.id}`}
            className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-red transition-colors hover:text-brand-yellow-hover"
          >
            Read article
            <ArrowUpRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </article>
  )
}

function SidebarVerticalPost({ article, index }: { article: NewsArticle; index: number }) {
  if (!article.id) return null

  return (
    <article className="mb-4 last:mb-0">
      <EditorialOverlayCard
        article={article}
        index={index}
        size="medium"
        className="min-h-[240px] sm:min-h-[260px]"
      />
      {article.description && (
        <p className="mt-3 line-clamp-2 px-1 text-sm leading-relaxed text-brand-muted">
          {article.description}
        </p>
      )}
    </article>
  )
}

function CategoryMagazineRow({
  leftCategory,
  rightCategory,
  leftPosts,
  rightPosts,
  usedIds,
}: {
  leftCategory: string
  rightCategory: string | null
  leftPosts: NewsArticle[]
  rightPosts: NewsArticle[]
  usedIds?: Set<string>
}) {
  const listPosts = leftPosts.filter((p) => !p.id || !usedIds?.has(p.id)).slice(0, 3)
  const sidebarPosts = rightPosts.filter((p) => !p.id || !usedIds?.has(p.id)).slice(0, 2)

  listPosts.forEach((p) => p.id && usedIds?.add(p.id))
  sidebarPosts.forEach((p) => p.id && usedIds?.add(p.id))

  if (listPosts.length === 0 && sidebarPosts.length === 0) return null

  return (
    <section className="mb-14 sm:mb-16 last:mb-0">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
        {listPosts.length > 0 && (
          <div className={sidebarPosts.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <CategoryLabel category={leftCategory} />
            {listPosts.map((article, i) => (
              <HorizontalListPost key={article.id} article={article} index={i + 1} showExcerpt />
            ))}
          </div>
        )}

        {rightCategory && sidebarPosts.length > 0 && (
          <div className="lg:col-span-4 lg:border-l lg:border-tan lg:pl-8">
            <CategoryLabel category={rightCategory} />
            <div className="space-y-4">
              {sidebarPosts.map((article, i) => (
                <SidebarVerticalPost key={article.id} article={article} index={listPosts.length + i + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function BlogCentricHome({ articles }: BlogCentricHomeProps) {
  const featured = articles.slice(0, 5)
  const heroIds = new Set(featured.map((a) => a.id).filter(Boolean) as string[])

  const articlesByCategory = BLOG_CATEGORIES.map((cat) => ({
    category: cat,
    posts: articles.filter(
      (a) => a.category?.toUpperCase() === cat && !heroIds.has(a.id || '')
    ),
  })).filter((group) => group.posts.length > 0)

  const categoryPairs: {
    left: string
    right: string | null
    leftPosts: NewsArticle[]
    rightPosts: NewsArticle[]
    showExcerpt: boolean
  }[] = []

  for (let i = 0; i < BLOG_CATEGORIES.length; i += 2) {
    const leftCat = BLOG_CATEGORIES[i]
    const rightCat = BLOG_CATEGORIES[i + 1] ?? null
    const leftPosts = articlesByCategory.find((g) => g.category === leftCat)?.posts ?? []
    const rightPosts = rightCat
      ? articlesByCategory.find((g) => g.category === rightCat)?.posts ?? []
      : []

    if (leftPosts.length === 0 && rightPosts.length === 0) continue

    categoryPairs.push({
      left: leftCat,
      right: rightCat,
      leftPosts,
      rightPosts,
      showExcerpt: i >= 2,
    })
  }

  const usedInSections = new Set<string>(heroIds)

  return (
    <main className="bg-white">
      {/* Bento hero — 5 featured posts */}
      <BentoHeroSection articles={featured} />

      {/* Main content — full width blog sections */}
      <section className="home-section bg-white border-t-0">
        <div className="home-container">
          <header className="text-center mb-10 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy leading-tight">
              Success Blogs, Coupons, Thrilling Experiences
            </h1>
            <p className="mt-3 text-sm sm:text-base text-brand-muted max-w-2xl mx-auto">
              Inspiring stories, money-saving tips, and exclusive deals — your path to smarter shopping starts here.
            </p>
          </header>

          {categoryPairs.length === 0 ? (
            <div className="bg-white rounded-xl border border-[var(--border-subtle)] p-10 text-center">
              <p className="text-brand-muted mb-4">Blog posts are on the way.</p>
              <Link href="/blogs" className="text-brand-red font-semibold hover:underline">
                Browse all articles →
              </Link>
            </div>
          ) : (
            <>
              {categoryPairs[0] && (
                <CategorySplitRow
                  leftCategory={categoryPairs[0].left}
                  rightCategory={categoryPairs[0].right}
                  leftPosts={categoryPairs[0].leftPosts}
                  rightPosts={categoryPairs[0].rightPosts}
                  showExcerpt={categoryPairs[0].showExcerpt}
                  usedIds={usedInSections}
                />
              )}

              {categoryPairs.slice(1).map(({ left, right, leftPosts, rightPosts }) => (
                <CategoryMagazineRow
                  key={`mag-${left}`}
                  leftCategory={left}
                  rightCategory={right}
                  leftPosts={leftPosts}
                  rightPosts={rightPosts}
                  usedIds={usedInSections}
                />
              ))}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
