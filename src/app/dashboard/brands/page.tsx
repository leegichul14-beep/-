import { createClient } from '@/lib/supabase/server'
import BrandSearchClient from '@/components/BrandSearchClient'

export const revalidate = 60

export default async function BrandsPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color_hex')
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">브랜드 검색</h2>
        <p className="text-sm text-gray-500 mt-0.5">브랜드명·카테고리로 검색하고 온라인 채널 입점 현황을 확인합니다</p>
      </div>
      <BrandSearchClient categories={categories ?? []} />
    </div>
  )
}
