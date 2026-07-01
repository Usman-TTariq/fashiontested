'use client'

import { useState } from 'react'
import { getCategoryFallbackImage } from '@/lib/utils/articleImages'

interface ArticleImageProps {
  src?: string | null
  alt: string
  category?: string | null
  className?: string
}

export default function ArticleImage({ src, alt, category, className = '' }: ArticleImageProps) {
  const initial = src?.trim() || getCategoryFallbackImage(category)
  const [currentSrc, setCurrentSrc] = useState(initial)
  const fallback = getCategoryFallbackImage(category)

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback)
      }}
    />
  )
}
