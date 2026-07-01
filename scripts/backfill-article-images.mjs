/**
 * Fix broken/missing article featured_image_url values in Supabase.
 *
 * Usage: node scripts/backfill-article-images.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(resolve(root, '.env'))
loadEnvFile(resolve(root, '.env.local'))

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const img = (id, w = 900) =>
  `https://images.unsplash.com/${id.startsWith('photo-') ? id : `photo-${id}`}?auto=format&fit=crop&w=${w}&q=80`

const CATEGORY_FALLBACKS = {
  FASHION: img('photo-1490481651871-ab68de25d43d'),
  LIFESTYLE: img('photo-1586023492125-27b2c045efd7'),
  BEAUTY: img('photo-1616394584738-fc6e612e71b9'),
  TRAVEL: img('photo-1613395877344-13d4a8e0d49e'),
  HEALTH: img('photo-1534438327276-14e5300c3a48'),
  ENTERTAINMENT: img('photo-1485846234645-a62644f84728'),
  FOOD: img('photo-1490645935967-10de6ba17061'),
}

/** Slug/title-specific fixes for known bad Unsplash IDs. */
const SLUG_OVERRIDES = {
  'talbots-a-place-where-you-are-not-moved-by-fast-fashion': img('photo-1490481651871-ab68de25d43d'),
  'how-retinol-benefits-the-skin-and-its-uses': img('photo-1616394584738-fc6e612e71b9'),
  'how-to-choose-the-best-moisturizer-for-your-skin-type': img('photo-1556228578-0d85b1a4d571'),
  'affordable-honeymoon-spots-without-breaking-the-bank': img('photo-1507525428034-b723cf961d3e'),
  'top-10-most-popular-countries-for-tourists-in-2026': img('photo-1529156069898-49953e39b3ac'),
  'tips-for-traveling-in-a-group-keep-everyone-happy': img('photo-1529156069898-49953e39b3ac'),
  'the-future-of-education-is-online-learning-here-to-stay': img('photo-1434030216411-0b793f4b4173'),
}

function parseCategory(excerpt) {
  const raw = excerpt?.trim() || ''
  const parts = raw.split('|||')
  return (parts[0] || 'LIFESTYLE').toUpperCase()
}

async function urlOk(url) {
  if (!url?.trim()) return false
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    return res.status === 200
  } catch {
    return false
  }
}

async function main() {
  const { data, error } = await supabase.from('articles').select('id,slug,title,excerpt,featured_image_url')
  if (error) {
    console.error('Failed to read articles:', error.message)
    process.exit(1)
  }

  let updated = 0
  for (const row of data || []) {
    const category = parseCategory(row.excerpt)
    const override = SLUG_OVERRIDES[row.slug]
    let nextUrl = row.featured_image_url

    if (override) {
      nextUrl = override
    } else if (!(await urlOk(nextUrl))) {
      nextUrl = CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.LIFESTYLE
    }

    if (!nextUrl || nextUrl === row.featured_image_url) continue

    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured_image_url: nextUrl, updated_at: new Date().toISOString() })
      .eq('id', row.id)

    if (updateError) {
      console.error(`Failed ${row.slug}:`, updateError.message)
      continue
    }

    updated++
    console.log(`Fixed: ${row.title}`)
  }

  console.log(`\nDone. Updated ${updated} article image(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
