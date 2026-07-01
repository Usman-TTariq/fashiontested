import { supabaseServer } from '@/lib/supabase/server';
import type { Store } from '@/lib/services/storeService';

function mapRowToStore(row: Record<string, unknown>): Store {
  return {
    id: row.id != null ? String(row.id) : undefined,
    storeId: row.store_id != null
      ? (typeof row.store_id === 'number' ? row.store_id : parseInt(String(row.store_id), 10))
      : undefined,
    name: String(row.store_name || row.name || ''),
    subStoreName: (row.sub_store_name || row.subStoreName) as string | undefined,
    slug: row.slug as string | undefined,
    description: String(row.description || ''),
    logoUrl: (row.store_logo_url || row.logo_url) as string | undefined,
    websiteUrl: row.website_url as string | undefined,
    trackingLink: row.tracking_link as string | undefined,
    country: row.country as string | undefined,
    status: row.status as string | undefined,
    voucherText: row.voucher_text as string | undefined,
    seoTitle: (row.seo_title || row.seoTitle) as string | undefined,
    seoDescription: (row.seo_description || row.seoDescription) as string | undefined,
    isTrending: (row.isTrending ?? row.featured) as boolean | undefined,
    layoutPosition: row.layout_position as number | null | undefined,
    categoryId: row.category_id as string | null | undefined,
    couponOrder: row.coupon_order as string[] | null | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

export async function getStoreBySlugOrIdServer(idOrSlug: string): Promise<Store | null> {
  const supabase = supabaseServer();
  const safeId = idOrSlug?.trim() ?? '';
  if (!safeId) return null;

  let { data } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', safeId)
    .limit(1)
    .maybeSingle();

  if (!data) {
    const { data: ciData } = await supabase
      .from('stores')
      .select('*')
      .ilike('slug', safeId)
      .limit(1)
      .maybeSingle();
    data = ciData;
  }

  if (!data) {
    const { data: idData } = await supabase
      .from('stores')
      .select('*')
      .eq('id', safeId)
      .limit(1)
      .maybeSingle();
    data = idData;
  }

  if (!data) {
    const nameGuess = safeId.replace(/-/g, ' ');
    const { data: nameData } = await supabase
      .from('stores')
      .select('*')
      .ilike('store_name', nameGuess)
      .limit(1)
      .maybeSingle();
    data = nameData;
  }

  return data ? mapRowToStore(data as Record<string, unknown>) : null;
}
