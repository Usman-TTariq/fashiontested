import { createClient } from '@/lib/supabase/client'

export interface Category {
  id?: string
  name: string
  slug?: string
  logoUrl?: string
  backgroundColor: string
  createdAt?: string
  updatedAt?: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function slugifyCategoryName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export function getCategorySlug(category: Pick<Category, 'name' | 'slug'>): string {
  return category.slug || slugifyCategoryName(category.name)
}

export function getCategoryPath(category: Pick<Category, 'name' | 'slug'>): string {
  return `/categories/${getCategorySlug(category)}`
}

function mapCategoryRow(item: Record<string, unknown>): Category {
  const name = String(item.name ?? '')
  return {
    id: item.id as string | undefined,
    name,
    slug: (item.slug as string | undefined) || slugifyCategoryName(name),
    logoUrl: (item.icon_url as string | undefined),
    backgroundColor: (item.background_color as string | undefined) || '#000000',
    createdAt: item.created_at as string | undefined,
    updatedAt: item.updated_at as string | undefined,
  }
}

const supabase = createClient()

function dataURItoBlob(dataURI: string): Blob {
  const parts = dataURI.split(',')
  if (parts.length < 2) {
    throw new Error('Invalid data URI format')
  }

  const header = parts[0]
  const data = parts[1]
  const mimeString = header.split(':')[1].split(';')[0]

  if (header.includes('base64')) {
    try {
      const byteString = atob(data)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], { type: mimeString })
    } catch (error) {
      console.error('Error decoding base64 data URI:', error)
      throw error
    }
  } else {
    try {
      const decodedData = decodeURIComponent(data)
      return new Blob([decodedData], { type: mimeString })
    } catch (error) {
      console.error('Error decoding URL-encoded data URI:', error)
      return new Blob([data], { type: mimeString })
    }
  }
}

export async function createCategory(
  name: string,
  backgroundColor: string,
  logoFile?: File,
  logoUrl?: string
) {
  try {
    let finalLogoUrl = logoUrl

    if (logoFile) {
      // Upload to Supabase Storage
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `category_${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`
      const filePath = `category-logos/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('category-logos')
        .upload(filePath, logoFile)

      if (uploadError) {
        console.error('Error uploading logo:', uploadError)
      } else {
        const { data: urlData } = supabase.storage
          .from('category-logos')
          .getPublicUrl(filePath)
        finalLogoUrl = urlData.publicUrl
      }
    } else if (logoUrl && logoUrl.startsWith('data:image')) {
      try {
        const blob = dataURItoBlob(logoUrl)
        const fileName = `category_${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.svg`
        const filePath = `category-logos/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category-logos')
          .upload(filePath, blob, {
            contentType: 'image/svg+xml',
          })

        if (uploadError) {
          console.error('Error uploading data URI logo:', uploadError)
          finalLogoUrl = logoUrl
        } else {
          const { data: urlData } = supabase.storage
            .from('category-logos')
            .getPublicUrl(filePath)
          finalLogoUrl = urlData.publicUrl
          console.log('Uploaded data URI logo to Supabase Storage:', finalLogoUrl)
        }
      } catch (uploadError) {
        console.error('Error uploading data URI logo to Supabase Storage:', uploadError)
        finalLogoUrl = logoUrl
      }
    }

    const insertData: any = {
      name,
      icon_url: finalLogoUrl,
      slug: slugifyCategoryName(name),
    }

    // Only add background_color if provided
    if (backgroundColor) {
      insertData.background_color = backgroundColor
    }

    // Don't manually set created_at/updated_at - let database defaults handle it
    // If columns don't exist, they will be created by the database defaults

    const { data, error } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // Log full error for debugging
      console.error('Error creating category:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
      
      // If any column doesn't exist, provide helpful error
      if (error.code === 'PGRST204') {
        const missingColumn = error.message?.match(/'([^']+)'/)?.[1] || 'unknown column'
        return {
          success: false,
          error: {
            message: `Database schema error: ${missingColumn} column missing. Please run fix_categories_schema.sql in Supabase SQL Editor.`,
            code: error.code,
            originalError: error.message || 'Unknown error'
          }
        }
      }
      
      // Return a serializable error object
      return {
        success: false,
        error: {
          message: error.message || 'Failed to create category',
          details: error.details || null,
          hint: error.hint || null,
          code: error.code || 'UNKNOWN_ERROR'
        }
      }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error creating category:', error)
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to create category',
        code: 'UNKNOWN_ERROR',
      },
    }
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting categories:', error)
      return []
    }

    return (data || []).map((item: any) => mapCategoryRow(item))
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      console.error('Error getting category:', error)
      return null
    }

    return mapCategoryRow(data)
  } catch (error) {
    console.error('Error getting category:', error)
    return null
  }
}

export async function getCategoryBySlug(slugOrId: string): Promise<Category | null> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slugOrId)
      .maybeSingle()

    if (data) {
      return mapCategoryRow(data)
    }

    if (UUID_REGEX.test(slugOrId)) {
      return getCategoryById(slugOrId)
    }

    if (error) {
      console.error('Error getting category by slug:', error)
    }

    const { data: allCategories, error: listError } = await supabase
      .from('categories')
      .select('*')

    if (listError || !allCategories) {
      return null
    }

    const match = allCategories.find(
      (item: any) => slugifyCategoryName(item.name) === slugOrId || item.slug === slugOrId
    )

    return match ? mapCategoryRow(match) : null
  } catch (error) {
    console.error('Error getting category by slug:', error)
    return null
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>,
  logoFile?: File
) {
  try {
    let logoUrl = updates.logoUrl

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `category_${Date.now()}_${updates.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'category'}.${fileExt}`
      const filePath = `category-logos/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('category-logos')
        .upload(filePath, logoFile)

      if (uploadError) {
        console.error('Error uploading logo:', uploadError)
      } else {
        const { data: urlData } = supabase.storage
          .from('category-logos')
          .getPublicUrl(filePath)
        logoUrl = urlData.publicUrl
      }
    } else if (logoUrl && logoUrl.startsWith('data:image')) {
      try {
        const blob = dataURItoBlob(logoUrl)
        const fileName = `category_${Date.now()}_${updates.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'category'}.svg`
        const filePath = `category-logos/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category-logos')
          .upload(filePath, blob, {
            contentType: 'image/svg+xml',
          })

        if (uploadError) {
          console.error('Error uploading data URI logo:', uploadError)
        } else {
          const { data: urlData } = supabase.storage
            .from('category-logos')
            .getPublicUrl(filePath)
          logoUrl = urlData.publicUrl
          console.log('Uploaded data URI logo to Supabase Storage:', logoUrl)
        }
      } catch (uploadError) {
        console.error('Error uploading data URI logo to Supabase Storage:', uploadError)
      }
    }

    const updateData: any = {}

    if (updates.name) {
      updateData.name = updates.name
      updateData.slug = slugifyCategoryName(updates.name)
    }
    if (logoUrl !== undefined) updateData.icon_url = logoUrl
    if (updates.backgroundColor) updateData.background_color = updates.backgroundColor

    // Don't manually set updated_at - let database default/trigger handle it
    // If column doesn't exist, user needs to run fix_categories_schema.sql

    const { error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating category:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // If any column doesn't exist, provide helpful error
      if (error.code === 'PGRST204') {
        const missingColumn = error.message?.match(/'([^']+)'/)?.[1] || 'unknown column'
        return {
          success: false,
          error: {
            message: `Database schema error: ${missingColumn} column missing. Please run fix_categories_schema.sql in Supabase SQL Editor.`,
            code: error.code,
            originalError: error.message
          }
        }
      }
      
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error }
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error }
  }
}
