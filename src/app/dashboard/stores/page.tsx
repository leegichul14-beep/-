import StoreCategoryTable from '@/components/StoreCategoryTable'
import rawData from '@/data/dashboard-data.json'

interface SearchParams { distributor?: string }

const ALL_ROWS = rawData.storeRatioData as {
  distributor_name: string; store_name: string;
  category_name: string; brand_count: number; ratio_pct: number
}[]

const DISTRIBUTORS = [...new Set(ALL_ROWS.map(r => r.distributor_name))].map(n => ({ name: n }))

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const data = params.distributor
    ? ALL_ROWS.filter(d => d.distributor_name === params.distributor)
    : ALL_ROWS

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
        {DISTRIBUTORS?.map(d => (
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
