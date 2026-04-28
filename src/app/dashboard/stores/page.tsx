import { createClient } from '@/lib/supabase/server'
import StoreCategoryTable from '@/components/StoreCategoryTable'

export const revalidate = 60

interface SearchParams { distributor?: string; region?: string }

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('v_store_category_ratio')
    .select('*')
    .order('brand_count', { ascending: false })

  if (params.distributor) {
    query = query.eq('distributor_name', params.distributor)
  }

  const { data } = await query

  // 유통사 목록
  const { data: distributorsRaw } = await supabase
    .from('distributors')
    .select('name')
    .eq('type', 'offline')
    .order('sort_order')
  const distributors = distributorsRaw as { name: string }[] | null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">점포별 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">점포별 카테고리 비중 및 입점 현황</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 flex-wrap">
        <a
          href="/dashboard/stores"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !params.distributor
              ? 'bg-pink-500 text-white border-pink-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          전체
        </a>
        {distributors?.map(d => (
          <a
            key={d.name}
            href={`/dashboard/stores?distributor=${d.name}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              params.distributor === d.name
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {d.name}
          </a>
        ))}
      </div>

      <StoreCategoryTable data={data ?? []} />
    </div>
  )
}
