import Link from 'next/link'
import ArticleImage from '@/app/components/ArticleImage'
import type { NewsArticle } from '@/lib/services/newsService'
import { BLOG_CATEGORIES, formatArticleMetaLine } from '@/lib/utils/articleMeta'

interface BlogCentricHomeProps {
  articles: NewsArticle[]
}

function formatHeroMeta(article: NewsArticle): string {
  return formatArticleMetaLine({
    date: article.date,
    author: article.author,
  })
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

function BentoHeroCard({
  article,
  className = '',
  titleLines = 2,
}: {
  article: NewsArticle
  className?: string
  titleLines?: 2 | 3
}) {
  if (!article.id) return null

  return (
    <Link
      href={`/blogs/${article.id}`}
      className={`group relative block overflow-hidden bg-brand-navy min-h-[220px] ${className}`}
    >
      <ArticleImage
        src={article.imageUrl}
        alt={article.title}
        category={article.category}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-end p-4 sm:p-5">
        {article.category && (
          <span className="mb-2 inline-block w-fit bg-brand-navy px-2 py-1 text-[10px] font-bold tracking-[0.15em] text-white uppercase">
            {article.category}
          </span>
        )}
        <h3
          className={`font-bold leading-snug text-white ${
            titleLines === 3
              ? 'text-lg sm:text-xl md:text-2xl line-clamp-3'
              : 'text-sm sm:text-base line-clamp-2'
          }`}
        >
          {article.title}
        </h3>
        {(article.date || article.author) && (
          <p className="mt-2 text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] text-white/90 uppercase">
            {formatHeroMeta(article)}
          </p>
        )}
      </div>
    </Link>
  )
}

function BentoHeroSection({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null

  const [left, topMiddle, right, bottomLeft, bottomRight] = articles

  if (articles.length < 5) {
    return (
      <section className="hero-full-bleed bg-white section-divider">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-2 w-full">
          {articles.map((article) => (
            <BentoHeroCard key={article.id} article={article} className="min-h-[260px]" titleLines={3} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="hero-full-bleed bg-white section-divider">
      <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-1 sm:gap-2 w-full md:min-h-[520px] lg:min-h-[560px]">
          {left && (
            <BentoHeroCard
              article={left}
              className="md:row-span-2 md:min-h-full min-h-[320px]"
              titleLines={3}
            />
          )}

          {topMiddle && (
            <BentoHeroCard
              article={topMiddle}
              className="md:col-start-2 md:row-start-1 min-h-[240px]"
              titleLines={2}
            />
          )}

          {right && (
            <BentoHeroCard
              article={right}
              className="md:col-start-3 md:row-start-1 md:row-span-2 md:min-h-full min-h-[320px]"
              titleLines={3}
            />
          )}

          {(bottomLeft || bottomRight) && (
            <div className="md:col-start-2 md:row-start-2 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 min-h-[200px]">
              {bottomLeft && <BentoHeroCard article={bottomLeft} className="min-h-[200px]" titleLines={2} />}
              {bottomRight && <BentoHeroCard article={bottomRight} className="min-h-[200px]" titleLines={2} />}
            </div>
          )}
        </div>
      </section>
    )
  }

const CATEGORY_LABEL_COLORS: Record<string, string> = {
  FASHION: 'bg-brand-brown text-white',
  LIFESTYLE: 'bg-brand-cyan text-brand-navy',
  BEAUTY: 'bg-brand-red text-white',
  TRAVEL: 'bg-brand-navy-light text-white',
  HEALTH: 'bg-brand-navy text-white',
  ENTERTAINMENT: 'bg-brand-navy-dark text-white',
  FOOD: 'bg-brand-brown text-white',
}

function CategoryLabel({ category }: { category: string }) {
  const color = CATEGORY_LABEL_COLORS[category.toUpperCase()] || 'bg-brand-navy text-white'
  return (
    <Link
      href={`/blogs?category=${category.toLowerCase()}`}
      className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] uppercase mb-5 ${color}`}
    >
      {category}
    </Link>
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
      <Link href={`/blogs/${article.id}`} className="group block overflow-hidden bg-gray-100">
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          category={article.category}
          className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <Link href={`/blogs/${article.id}`}>
        <h3 className="mt-4 text-xl sm:text-2xl md:text-[1.65rem] font-bold text-brand-navy leading-snug hover:text-brand-red transition-colors">
          {article.title}
        </h3>
      </Link>
      {showExcerpt && article.description && (
        <p className="mt-3 text-sm sm:text-[15px] text-gray-600 leading-relaxed line-clamp-4">
          {article.description}
        </p>
      )}
      <p className="mt-4 text-[10px] sm:text-[11px] font-medium tracking-[0.08em] text-brand-muted uppercase">
        {formatArticleMetaFull(article)}
      </p>
    </article>
  )
}

function GridPostCard({ article }: { article: NewsArticle }) {
  if (!article.id) return null

  return (
    <article>
      <Link href={`/blogs/${article.id}`} className="group block overflow-hidden bg-gray-100">
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          category={article.category}
          className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <Link href={`/blogs/${article.id}`}>
        <h4 className="mt-3 text-sm sm:text-[15px] font-bold text-brand-navy leading-snug line-clamp-3 hover:text-brand-red transition-colors">
          {article.title}
        </h4>
      </Link>
      <p className="mt-2 text-[10px] sm:text-[11px] font-medium tracking-[0.08em] text-brand-muted uppercase">
        {formatArticleMetaShort(article)}
      </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left — featured category */}
        {leftFeatured && (
          <div className={rightCategory && gridPosts.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <CategoryLabel category={leftCategory} />
            <FeaturedPostLarge article={leftFeatured} showExcerpt={showExcerpt} />
          </div>
        )}

        {/* Right — 2×2 grid */}
        {rightCategory && gridPosts.length > 0 && (
          <div className="lg:col-span-5">
            <CategoryLabel category={rightCategory} />
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {gridPosts.map((article) => (
                <GridPostCard key={article.id} article={article} />
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
  showExcerpt = true,
}: {
  article: NewsArticle
  showExcerpt?: boolean
}) {
  if (!article.id) return null

  return (
    <article className="border-b border-tan py-9 sm:py-10 last:border-b-0">
      <div className="flex flex-col md:flex-row md:items-stretch gap-5 md:gap-8 lg:gap-10">
        <Link
          href={`/blogs/${article.id}`}
          className="group block w-full md:w-[44%] lg:w-[42%] md:max-w-[480px] shrink-0 overflow-hidden bg-gray-100"
        >
          <ArticleImage
            src={article.imageUrl}
            alt={article.title}
            category={article.category}
            className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="flex flex-1 min-w-0 flex-col md:py-1">
          <Link href={`/blogs/${article.id}`} className="group/title">
            <h3 className="text-xl sm:text-[1.35rem] lg:text-[1.5rem] font-bold text-brand-navy leading-snug group-hover/title:text-brand-red transition-colors">
              {article.title}
            </h3>
          </Link>

          {showExcerpt && article.description && (
            <p className="mt-4 text-sm sm:text-[15px] text-gray-600 leading-relaxed line-clamp-4">
              {article.description}
            </p>
          )}

          <p className="mt-5 md:mt-auto md:pt-6 text-[10px] sm:text-[11px] font-medium tracking-[0.08em] text-brand-muted uppercase">
            {formatArticleMetaFull(article)}
          </p>
        </div>
      </div>
    </article>
  )
}

function SidebarVerticalPost({ article }: { article: NewsArticle }) {
  if (!article.id) return null

  return (
    <article className="mb-10 last:mb-0 pb-10 last:pb-0 border-b border-tan last:border-b-0">
      <Link href={`/blogs/${article.id}`} className="group block overflow-hidden bg-gray-100 mb-4">
        <ArticleImage
          src={article.imageUrl}
          alt={article.title}
          category={article.category}
          className="w-full aspect-[16/10] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </Link>
      <Link href={`/blogs/${article.id}`} className="group/title">
        <h4 className="text-base sm:text-lg font-bold text-brand-navy leading-snug line-clamp-3 group-hover/title:text-brand-red transition-colors">
          {article.title}
        </h4>
      </Link>
      {article.description && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
          {article.description}
        </p>
      )}
      <p className="mt-4 text-[10px] sm:text-[11px] font-medium tracking-[0.08em] text-brand-muted uppercase">
        {formatArticleMetaFull(article)}
      </p>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {listPosts.length > 0 && (
          <div className={sidebarPosts.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <CategoryLabel category={leftCategory} />
            {listPosts.map((article) => (
              <HorizontalListPost
                key={article.id}
                article={article}
                showExcerpt
              />
            ))}
          </div>
        )}

        {rightCategory && sidebarPosts.length > 0 && (
          <div className="lg:col-span-4">
            <CategoryLabel category={rightCategory} />
            {sidebarPosts.map((article) => (
              <SidebarVerticalPost key={article.id} article={article} />
            ))}
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
    <main className="bg-cream">
      {/* Bento hero — 5 featured posts */}
      <BentoHeroSection articles={featured} />

      {/* Main content — full width blog sections */}
      <section className="home-section bg-white section-divider">
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
