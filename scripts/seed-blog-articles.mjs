/**
 * Seed blog articles with categories, authors, and Unsplash images.
 * Inspired by blog-centric sites like thrilltosuccess.com
 *
 * Usage: node scripts/seed-blog-articles.mjs
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
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)
}

function excerpt(category, author, popularity, description) {
  return `${category}|||${author}|||${popularity}|||${description}`
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const articles = [
  // FASHION
  {
    title: 'Talbots: A Place Where You Are Not Moved by Fast Fashion',
    category: 'FASHION', author: 'John Wellman', popularity: 92,
    image: img('photo-1490481651871-ab68de25d43d'),
    days: 3,
    description: 'Talbots has timeless pieces you can enjoy wearing season after season. Build a wardrobe that lasts beyond trends.',
    content: '<p>Fast fashion fades quickly, but classic tailoring and quality fabrics never go out of style. Talbots focuses on pieces that transition from office to weekend effortlessly.</p><p>Look for seasonal promotions and clearance sections updated regularly — smart shoppers can refresh their closet without overspending.</p>',
  },
  {
    title: 'Everlane: Where Every Product Is Crystal Clear',
    category: 'FASHION', author: 'Micah Fields', popularity: 88,
    image: img('photo-1445205170230-053b83016050'),
    days: 12,
    description: 'Ethical production, transparent pricing, and exceptional quality define the Everlane shopping experience.',
    content: '<p>Everlane built its reputation on radical transparency — showing customers exactly what goes into each product.</p><p>From organic cotton tees to Italian leather shoes, every item is designed to minimize waste while maximizing wear.</p>',
  },
  {
    title: 'From Catwalk to Sidewalk: Translating Runway Shoes to Everyday Wear',
    category: 'FASHION', author: 'Betty Anderson', popularity: 76,
    image: img('photo-1543163521-1bf539c55dd2'),
    days: 45,
    description: 'Runway trends can feel unreachable — here is how to adapt bold footwear for daily outfits.',
    content: '<p>Statement heels and sculptural sneakers dominate fashion weeks, but real life demands comfort and versatility.</p><p>Pair bold shoes with neutral basics, keep proportions balanced, and invest in one trend piece per season.</p>',
  },
  {
    title: 'Summer Wardrobe Essentials That Actually Save You Money',
    category: 'FASHION', author: 'Carla Jones', popularity: 71,
    image: img('photo-1469334031218-e382a71b716b'),
    days: 8,
    description: 'Build a capsule summer wardrobe with fewer, better pieces instead of impulse buys every weekend.',
    content: '<p>A linen shirt, tailored shorts, and one versatile dress cover most warm-weather plans.</p><p>Shop end-of-season sales for next year and use coupon codes on full-price items only when you truly need them.</p>',
  },
  {
    title: 'How to Shop Smart During Holiday Fashion Sales',
    category: 'FASHION', author: 'Tina Capri', popularity: 84,
    image: img('photo-1490481651871-ab68de25d43d'),
    days: 20,
    description: 'Holiday sales are tempting — use these strategies to buy what you need at the best price.',
    content: '<p>Make a list before browsing, compare prices across retailers, and stack promo codes with cashback offers when possible.</p>',
  },

  // LIFESTYLE
  {
    title: 'The New Wellness Wearable That Eases Stress and Improves Sleep',
    category: 'LIFESTYLE', author: 'John Wellman', popularity: 95,
    image: img('photo-1576243345690-4e4b79b63288'),
    days: 1,
    description: 'Wearable tech is evolving beyond step counts — new devices track recovery, stress, and sleep quality.',
    content: '<p>Modern wellness wearables combine heart-rate variability, skin temperature, and movement data to paint a fuller picture of your health.</p><p>If you are shopping for one, compare subscription costs and battery life before committing.</p>',
  },
  {
    title: 'Gear for Creators — Quality, Variety, and Value',
    category: 'LIFESTYLE', author: 'John Wellman', popularity: 90,
    image: img('photo-1516035069371-29a1b244cc32'),
    days: 5,
    description: 'Whether you film, stream, or podcast, the right gear does not have to drain your budget.',
    content: '<p>Start with lighting and audio — viewers forgive average video more easily than bad sound.</p><p>Look for bundle deals and refurbished equipment from trusted retailers.</p>',
  },
  {
    title: 'Best Practices for Working from Home Comfortably',
    category: 'LIFESTYLE', author: 'Emma Gray', popularity: 82,
    image: img('photo-1586023492125-27b2c045efd7'),
    days: 60,
    description: 'Ergonomic setup, natural light, and clear boundaries make remote work sustainable long term.',
    content: '<p>Invest in a supportive chair, raise your monitor to eye level, and take movement breaks every hour.</p><p>Separate work and rest spaces when possible — your future self will thank you.</p>',
  },
  {
    title: 'Misen: Improving Your Kitchen with Quality Cookware',
    category: 'LIFESTYLE', author: 'Steve Asher', popularity: 74,
    image: img('photo-1556911220-e15b29be8c8f'),
    days: 90,
    description: 'Good pans heat evenly, last years, and make weeknight cooking genuinely enjoyable.',
    content: '<p>Stainless steel and carbon steel each have strengths — choose based on what you cook most often.</p>',
  },
  {
    title: 'Ice Barrel: Chilling Adventures in Wellness and Savings',
    category: 'LIFESTYLE', author: 'Micah Fields', popularity: 68,
    image: img('photo-1544367567-0f2fcb009e0b'),
    days: 120,
    description: 'Cold plunge therapy has gone mainstream — here is what to know before you buy.',
    content: '<p>Cold exposure may support recovery and mental clarity for some users. Start gradually and consult a doctor if you have heart conditions.</p>',
  },
  {
    title: 'Tips and Techniques for Pool Upkeep and Cleaning',
    category: 'LIFESTYLE', author: 'James Lee Burke', popularity: 65,
    image: img('photo-1571902943202-507ec2618e8f'),
    days: 200,
    description: 'Regular testing, skimming, and filter care keep your pool swim-ready all season.',
    content: '<p>Test water chemistry weekly, brush walls to prevent algae, and run your pump on a consistent schedule.</p>',
  },

  // BEAUTY
  {
    title: 'Skincare Routine for Flawless Skin',
    category: 'BEAUTY', author: 'Carla Jones', popularity: 91,
    image: img('photo-1616394584738-fc6e612e71b9'),
    days: 4,
    description: 'A simple cleanse, treat, moisturize, and SPF routine beats a shelf full of unused products.',
    content: '<p>Social media routines with ten steps are overwhelming. Focus on consistency with a gentle cleanser, active serum for your main concern, moisturizer, and daily sunscreen.</p>',
  },
  {
    title: 'Top 5 Cleansers for Oily Skin Approved by Dermatologists',
    category: 'BEAUTY', author: 'Carla Jones', popularity: 87,
    image: img('photo-1556228578-0d85b1a4d571'),
    days: 15,
    description: 'The right cleanser removes excess oil without stripping your skin barrier.',
    content: '<p>Look for gel or foaming formulas with salicylic acid or niacinamide. Avoid over-washing — twice daily is enough for most people.</p>',
  },
  {
    title: 'How Retinol Benefits the Skin and Its Uses',
    category: 'BEAUTY', author: 'Micah Fields', popularity: 83,
    image: img('photo-1616394584738-fc6e612e71b9'),
    days: 30,
    description: 'Retinol supports collagen production and helps with texture, fine lines, and uneven tone.',
    content: '<p>Start with a low concentration twice weekly, always use SPF in the morning, and expect a few weeks of adjustment.</p>',
  },
  {
    title: 'Discover the Top Summer Swimsuit Styles for 2026',
    category: 'BEAUTY', author: 'Betty Anderson', popularity: 79,
    image: img('photo-1507525428034-b723cf961d3e'),
    days: 18,
    description: 'From one-pieces to high-waist bikinis — find the cut that flatters your shape and budget.',
    content: '<p>Try mix-and-match separates for a custom fit. Shop sales early in the season for the best size selection.</p>',
  },
  {
    title: 'How to Choose the Best Moisturizer for Your Skin Type',
    category: 'BEAUTY', author: 'Micah Fields', popularity: 72,
    image: img('photo-1556228578-0d85b1a4d571'),
    days: 55,
    description: 'Lightweight gels for oily skin, rich creams for dry skin — matching texture matters.',
    content: '<p>Apply moisturizer to damp skin to lock in hydration. Look for ceramides and hyaluronic acid on ingredient lists.</p>',
  },

  // TRAVEL
  {
    title: 'Best Places in Greece to Visit for a Memorable Adventure',
    category: 'TRAVEL', author: 'John Wellman', popularity: 94,
    image: img('photo-1613395877344-13d4a8e0d49e'),
    days: 2,
    description: 'From Athens to Naxos — iconic islands, ancient history, and beaches worth the trip.',
    content: '<p>Athens offers world-class museums and food. Santorini delivers views; Naxos and Paros offer a quieter pace.</p><p>Book ferries early in peak season and travel in shoulder months for better prices.</p>',
  },
  {
    title: 'Affordable Honeymoon Spots Without Breaking the Bank',
    category: 'TRAVEL', author: 'Micah Fields', popularity: 86,
    image: img('photo-1507525428034-b723cf961d3e'),
    days: 25,
    description: 'Portugal, Mexico, and Southeast Asia offer romance and value if you plan ahead.',
    content: '<p>Compare all-inclusive packages vs. independent travel. Off-peak weeks can cut costs nearly in half.</p>',
  },
  {
    title: 'Top 10 Most Popular Countries for Tourists in 2026',
    category: 'TRAVEL', author: 'John Wellman', popularity: 80,
    image: img('photo-1529156069898-49953e39b3ac'),
    days: 40,
    description: 'France, Spain, the US, and Japan continue to dominate global travel wish lists.',
    content: '<p>Each destination offers a mix of culture, cuisine, and natural beauty. Research visa requirements and local customs before booking.</p>',
  },
  {
    title: 'Tips for Traveling in a Group: Keep Everyone Happy',
    category: 'TRAVEL', author: 'Steve Asher', popularity: 70,
    image: img('photo-1529156069898-49953e39b3ac'),
    days: 70,
    description: 'Shared itineraries, clear budgets, and downtime prevent group-trip burnout.',
    content: '<p>Assign one organizer for logistics but rotate activity choices. Build free time into every day.</p>',
  },

  // HEALTH
  {
    title: 'BODi: Save 35% on Supplements and Build Your Summer Wellness Stack',
    category: 'HEALTH', author: 'John Wellman', popularity: 96,
    image: img('photo-1571019614242-c5c5dee9f50b'),
    days: 0,
    description: 'Protein, greens, and recovery support — stack smart supplements with a balanced diet.',
    content: '<p>Supplements fill gaps, not replace whole foods. Look for third-party tested brands and promo codes before checkout.</p>',
  },
  {
    title: 'Start the New Year Strong with BODi Fitness & Wellness Deals',
    category: 'HEALTH', author: 'Tina Capri', popularity: 89,
    image: img('photo-1534438327276-14e5300c3a48'),
    days: 6,
    description: 'Home workouts, meal plans, and coaching bundles make consistency easier.',
    content: '<p>Choose a program you will actually follow. Free trials let you test before committing to annual plans.</p>',
  },
  {
    title: 'Exercise for Different Age Groups: Adapt Workouts to Your Life Stage',
    category: 'HEALTH', author: 'Emma Gray', popularity: 81,
    image: img('photo-1517836357463-d25dfeac3438'),
    days: 35,
    description: 'Teens, adults, and seniors all benefit from movement tailored to their needs and limits.',
    content: '<p>Focus on mobility, strength, and cardio in proportions that match your goals. Recovery becomes more important with age.</p>',
  },
  {
    title: 'Journey Towards Health and Strength with Titan Fitness',
    category: 'HEALTH', author: 'John Wellman', popularity: 77,
    image: img('photo-1532029837206-abbe2b7620e3'),
    days: 100,
    description: 'Home gym equipment deals can help you train consistently without a membership.',
    content: '<p>Start with adjustable dumbbells, a bench, and resistance bands before buying large machines.</p>',
  },
  {
    title: 'The Role of Comfort in Reducing Stress and Anxiety',
    category: 'HEALTH', author: 'Micah Fields', popularity: 73,
    image: img('photo-1506126613408-eca07ce68773'),
    days: 65,
    description: 'Calming spaces, quality sleep, and mindful routines support mental well-being.',
    content: '<p>Small changes — better bedding, softer lighting, short walks — compound into meaningful stress relief over time.</p>',
  },

  // ENTERTAINMENT
  {
    title: 'What Is Artificial Intelligence and Its Hazards',
    category: 'ENTERTAINMENT', author: 'James Lee Burke', popularity: 85,
    image: img('photo-1677442136019-21780ecad995'),
    days: 10,
    description: 'AI tools are powerful — understanding risks around misinformation and privacy matters.',
    content: '<p>Verify AI-generated content, protect personal data in prompts, and stay informed about regulation and ethics.</p>',
  },
  {
    title: 'The Future of Education: Is Online Learning Here to Stay?',
    category: 'ENTERTAINMENT', author: 'Steve Asher', popularity: 78,
    image: img('photo-1434030216411-0b793f4b4173'),
    days: 50,
    description: 'Hybrid models blend classroom interaction with flexible digital coursework.',
    content: '<p>Online learning works best with structure, community, and clear outcomes — not passive video watching alone.</p>',
  },
  {
    title: 'Streaming in 2026: How to Save on Subscriptions',
    category: 'ENTERTAINMENT', author: 'Tina Capri', popularity: 88,
    image: img('photo-1485846234645-a62644f84728'),
    days: 7,
    description: 'Rotate services monthly, share family plans legally, and watch for bundle deals.',
    content: '<p>Most people only actively use one or two platforms at a time. Cancel what you are not watching.</p>',
  },
  {
    title: 'Best Family Movie Nights on a Budget',
    category: 'ENTERTAINMENT', author: 'Betty Anderson', popularity: 66,
    image: img('photo-1478720568477-152d9b164e26'),
    days: 80,
    description: 'Free library apps, discounted tickets, and homemade snacks beat expensive outings.',
    content: '<p>Check community screenings, use loyalty programs, and pair streaming free trials with themed nights at home.</p>',
  },

  // FOOD
  {
    title: '10 Healthy Foods You Must Include in Your Diet',
    category: 'FOOD', author: 'James Lee Burke', popularity: 90,
    image: img('photo-1490645935967-10de6ba17061'),
    days: 9,
    description: 'Leafy greens, legumes, nuts, and whole grains form the foundation of balanced eating.',
    content: '<p>Variety matters more than any single superfood. Eat the rainbow and cook at home when you can.</p>',
  },
  {
    title: 'Yummy Pizza Recipe: Make Pizza at Home',
    category: 'FOOD', author: 'Carla Jones', popularity: 84,
    image: img('photo-1513104890138-7c749659a591'),
    days: 22,
    description: 'Crispy crust, quality sauce, and less cheese than takeout — homemade pizza wins on taste and cost.',
    content: '<p>Cold ferment your dough 24–48 hours for better flavor. Preheat your oven as hot as it safely goes.</p>',
  },
  {
    title: '6 Diets That Support Health and Your Ideal Waistline',
    category: 'FOOD', author: 'Emma Gray', popularity: 75,
    image: img('photo-1498837167922-ddd27525d352'),
    days: 48,
    description: 'Mediterranean, DASH, and flexitarian patterns score well for long-term adherence.',
    content: '<p>The best diet is one you can maintain. Prioritize protein, fiber, and whole foods over extreme restriction.</p>',
  },
  {
    title: 'The Art of Perfect Ice Cream at Home',
    category: 'FOOD', author: 'Micah Fields', popularity: 69,
    image: img('photo-1563805042-7684c019e1cb'),
    days: 110,
    description: 'Custard base, proper churning, and freezer time create creamy results without an shop visit.',
    content: '<p>Use full-fat dairy, chill your base thoroughly, and let ice cream ripen in the freezer before serving.</p>',
  },
]

async function main() {
  const slugs = articles.map((a) => slugify(a.title))

  const { data: existing, error: fetchError } = await supabase
    .from('articles')
    .select('slug')
    .in('slug', slugs)

  if (fetchError) {
    console.error('Failed to read articles:', fetchError.message)
    process.exit(1)
  }

  const existingSlugs = new Set((existing || []).map((a) => a.slug))
  const toInsert = articles.filter((a) => !existingSlugs.has(slugify(a.title)))

  if (!toInsert.length) {
    console.log(`All ${articles.length} blog articles already exist.`)
    return
  }

  console.log(`Inserting ${toInsert.length} blog articles...`)

  const rows = toInsert.map((a) => ({
    title: a.title,
    slug: slugify(a.title),
    excerpt: excerpt(a.category, a.author, a.popularity, a.description),
    content: a.content,
    featured_image_url: a.image,
    published: true,
    created_at: daysAgo(a.days),
    updated_at: new Date().toISOString(),
  }))

  const BATCH = 10
  let inserted = 0
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase.from('articles').insert(batch)
    if (error) {
      console.error('Insert failed:', error.message)
      process.exit(1)
    }
    inserted += batch.length
    console.log(`  + ${inserted}/${rows.length}`)
  }

  console.log(`\nDone! ${inserted} articles seeded across FASHION, LIFESTYLE, BEAUTY, TRAVEL, HEALTH, ENTERTAINMENT, FOOD.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
