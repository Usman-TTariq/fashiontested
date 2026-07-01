/**
 * Seed ~20 demo stores and 100 mixed code/deal coupons into Supabase.
 *
 * Usage: node scripts/seed-dummy-data.mjs
 * Re-run safe: skips stores that already exist; only adds coupons if demo total < target.
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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const DEMO_SLUG_PREFIX = 'demo-'
const TARGET_COUPONS = 100

const favicon = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

const demoStores = [
  { name: 'Amazon', slug: 'amazon', domain: 'amazon.com' },
  { name: 'Nike', slug: 'nike', domain: 'nike.com' },
  { name: 'Walmart', slug: 'walmart', domain: 'walmart.com' },
  { name: 'Target', slug: 'target', domain: 'target.com' },
  { name: 'Best Buy', slug: 'best-buy', domain: 'bestbuy.com' },
  { name: 'Apple', slug: 'apple', domain: 'apple.com' },
  { name: 'Sephora', slug: 'sephora', domain: 'sephora.com' },
  { name: 'Adidas', slug: 'adidas', domain: 'adidas.com' },
  { name: 'eBay', slug: 'ebay', domain: 'ebay.com' },
  { name: 'H&M', slug: 'hm', domain: 'hm.com' },
  { name: 'Costco', slug: 'costco', domain: 'costco.com' },
  { name: 'Home Depot', slug: 'home-depot', domain: 'homedepot.com' },
  { name: 'Lowe\'s', slug: 'lowes', domain: 'lowes.com' },
  { name: 'Macy\'s', slug: 'macys', domain: 'macys.com' },
  { name: 'Gap', slug: 'gap', domain: 'gap.com' },
  { name: 'Old Navy', slug: 'old-navy', domain: 'oldnavy.com' },
  { name: 'Ulta', slug: 'ulta', domain: 'ulta.com' },
  { name: 'Chewy', slug: 'chewy', domain: 'chewy.com' },
  { name: 'Wayfair', slug: 'wayfair', domain: 'wayfair.com' },
  { name: 'Shein', slug: 'shein', domain: 'shein.com' },
]

const codeOffers = [
  { label: '20% Off Sitewide', pct: 20, codePrefix: 'SAVE' },
  { label: '15% Off Your Order', pct: 15, codePrefix: 'OFF' },
  { label: '25% Off Select Items', pct: 25, codePrefix: 'DEAL' },
  { label: '10% Off First Purchase', pct: 10, codePrefix: 'NEW' },
  { label: '30% Off Clearance', pct: 30, codePrefix: 'CLR' },
  { label: '$10 Off $50+', pct: 10, codePrefix: 'TEN' },
  { label: 'Free Shipping Code', pct: 0, codePrefix: 'SHIP' },
  { label: 'Buy One Get One 50% Off', pct: 50, codePrefix: 'BOGO' },
]

const dealOffers = [
  { label: 'Flash Sale — Limited Time', desc: 'Automatic discount at checkout, no code needed.' },
  { label: 'Free Shipping Deal', desc: 'Free standard shipping on eligible orders.' },
  { label: 'Clearance Event', desc: 'Up to 70% off clearance items while stocks last.' },
  { label: 'Member Exclusive Deal', desc: 'Sign in to unlock member-only pricing.' },
  { label: 'Seasonal Sale', desc: 'Seasonal markdowns applied automatically.' },
]

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function randomCode(prefix, storeSlug) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}${storeSlug.replace(/-/g, '').slice(0, 4).toUpperCase()}${suffix}`
}

function expiryInDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildCouponsForStore(store, storeIndex) {
  const rows = []
  const slug = store.slug.replace(DEMO_SLUG_PREFIX, '')
  const couponsPerStore = Math.ceil(TARGET_COUPONS / demoStores.length)
  const codeCount = Math.ceil(couponsPerStore * 0.55)
  const dealCount = couponsPerStore - codeCount

  for (let i = 0; i < codeCount; i++) {
    const offer = codeOffers[(storeIndex + i) % codeOffers.length]
    rows.push({
      store_id: store.id,
      store_name: store.store_name,
      store_ids: [store.id],
      title: `${store.store_name} — ${offer.label}`,
      code: randomCode(offer.codePrefix, slug),
      description: `Use this code for ${offer.label.toLowerCase()} at ${store.store_name}.`,
      discount_type: 'percentage',
      discount_value: offer.pct,
      discount: offer.pct ? `${offer.pct}% Off` : 'Free Shipping',
      coupon_type: 'code',
      get_code_text: 'Get Code',
      get_deal_text: null,
      logo_url: store.store_logo_url,
      url: store.website_url,
      status: 'active',
      max_uses: 500,
      current_uses: Math.floor(Math.random() * 120),
      expiry_date: expiryInDays(30 + ((storeIndex + i) * 17) % 300),
      featured: storeIndex < 6 && i === 0,
      is_latest: storeIndex < 4 && i === 1,
    })
  }

  for (let i = 0; i < dealCount; i++) {
    const offer = dealOffers[(storeIndex + i) % dealOffers.length]
    rows.push({
      store_id: store.id,
      store_name: store.store_name,
      store_ids: [store.id],
      title: `${store.store_name} — ${offer.label}`,
      code: '',
      description: offer.desc,
      discount_type: 'percentage',
      discount_value: 0,
      discount: 'Special Deal',
      coupon_type: 'deal',
      get_code_text: null,
      get_deal_text: 'Get Deal',
      logo_url: store.store_logo_url,
      url: store.website_url,
      status: 'active',
      max_uses: 1000,
      current_uses: Math.floor(Math.random() * 80),
      expiry_date: expiryInDays(45 + ((storeIndex + i) * 23) % 280),
      featured: false,
      is_latest: false,
    })
  }

  return rows
}

async function ensureDemoStores() {
  const demoSlugs = demoStores.map((s) => `${DEMO_SLUG_PREFIX}${s.slug}`)

  const { data: existing, error } = await supabase
    .from('stores')
    .select('id, store_name, slug, store_logo_url, website_url')
    .in('slug', demoSlugs)

  if (error) throw new Error(`Failed to read stores: ${error.message}`)

  const existingBySlug = new Map((existing || []).map((s) => [s.slug, s]))
  const toInsert = []

  for (const [idx, s] of demoStores.entries()) {
    const slug = `${DEMO_SLUG_PREFIX}${s.slug}`
    if (existingBySlug.has(slug)) continue

    toInsert.push({
      store_name: s.name,
      slug,
      description: `Demo store — ${s.name} coupons and deals for testing.`,
      store_logo_url: favicon(s.domain),
      website_url: `https://www.${s.domain}`,
      tracking_link: `https://www.${s.domain}`,
      voucher_text: 'Save Today',
      seoTitle: `${s.name} Coupons & Deals`,
      seoDescription: `Demo ${s.name} promo codes and deals.`,
      isTrending: idx < 8,
      layout_position: idx < 8 ? idx + 1 : null,
      country: 'US',
      status: 'active',
    })
  }

  if (toInsert.length) {
    const { data: inserted, error: insertError } = await supabase
      .from('stores')
      .insert(toInsert)
      .select('id, store_name, slug, store_logo_url, website_url')

    if (insertError) throw new Error(`Store insert failed: ${insertError.message}`)

    for (const row of inserted || []) {
      existingBySlug.set(row.slug, row)
    }
    console.log(`Inserted ${inserted?.length ?? 0} demo stores`)
  } else {
    console.log('All demo stores already exist')
  }

  return demoSlugs.map((slug) => existingBySlug.get(slug)).filter(Boolean)
}

async function countDemoCoupons(storeIds) {
  if (!storeIds.length) return 0
  const { count, error } = await supabase
    .from('coupons')
    .select('id', { count: 'exact', head: true })
    .in('store_id', storeIds)

  if (error) throw new Error(`Coupon count failed: ${error.message}`)
  return count || 0
}

async function main() {
  console.log('Seeding demo stores and coupons...\n')

  const stores = await ensureDemoStores()
  if (!stores.length) {
    console.error('No demo stores available')
    process.exit(1)
  }

  const storeIds = stores.map((s) => s.id)
  const existingCount = await countDemoCoupons(storeIds)
  console.log(`Existing demo coupons: ${existingCount}`)

  if (existingCount >= TARGET_COUPONS) {
    console.log(`Already have ${existingCount} demo coupons (target ${TARGET_COUPONS}). Nothing to add.`)
    return
  }

  const allCouponRows = []
  for (const [idx, store] of stores.entries()) {
    allCouponRows.push(...buildCouponsForStore(store, idx))
  }

  const needed = TARGET_COUPONS - existingCount
  const toInsert = allCouponRows.slice(0, needed)

  const BATCH = 25
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('coupons').insert(batch)
    if (error) throw new Error(`Coupon insert failed: ${error.message}`)
    inserted += batch.length
    console.log(`  + ${inserted}/${toInsert.length} coupons`)
  }

  const codeCount = toInsert.filter((c) => c.coupon_type === 'code').length
  const dealCount = toInsert.filter((c) => c.coupon_type === 'deal').length

  console.log('\nDone!')
  console.log(`  Stores: ${stores.length}`)
  console.log(`  Coupons added: ${inserted} (${codeCount} codes, ${dealCount} deals)`)
  console.log(`  Total demo coupons now: ~${existingCount + inserted}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
