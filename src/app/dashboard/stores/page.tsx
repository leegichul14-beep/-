import StoreCategoryTable from '@/components/StoreCategoryTable'
import type { StoreCategoryRatio } from '@/lib/supabase/types'

interface SearchParams { distributor?: string; region?: string }

// TODO: Supabase 연결 후 실제 쿼리로 교체
const MOCK_DATA: StoreCategoryRatio[] = [
  { store_id:'1', store_name:'현대 판교점', distributor_name:'현대', category_name:'영여성', brand_count:42, ratio_pct:34.1 },
  { store_id:'1', store_name:'현대 판교점', distributor_name:'현대', category_name:'여성', brand_count:28, ratio_pct:22.8 },
  { store_id:'1', store_name:'현대 판교점', distributor_name:'현대', category_name:'잡화', brand_count:23, ratio_pct:18.7 },
  { store_id:'1', store_name:'현대 판교점', distributor_name:'현대', category_name:'스포츠/아웃도어', brand_count:18, ratio_pct:14.6 },
  { store_id:'1', store_name:'현대 판교점', distributor_name:'현대', category_name:'기타', brand_count:12, ratio_pct:9.8 },
  { store_id:'2', store_name:'롯데 본점', distributor_name:'롯데', category_name:'영여성', brand_count:38, ratio_pct:24.5 },
  { store_id:'2', store_name:'롯데 본점', distributor_name:'롯데', category_name:'잡화', brand_count:44, ratio_pct:28.4 },
  { store_id:'2', store_name:'롯데 본점', distributor_name:'롯데', category_name:'여성', brand_count:30, ratio_pct:19.4 },
  { store_id:'2', store_name:'롯데 본점', distributor_name:'롯데', category_name:'스포츠/아웃도어', brand_count:22, ratio_pct:14.2 },
  { store_id:'2', store_name:'롯데 본점', distributor_name:'롯데', category_name:'기타', brand_count:21, ratio_pct:13.5 },
  { store_id:'3', store_name:'신세계 강남점', distributor_name:'신세계', category_name:'컨템포러리', brand_count:55, ratio_pct:32.0 },
  { store_id:'3', store_name:'신세계 강남점', distributor_name:'신세계', category_name:'잡화', brand_count:46, ratio_pct:26.7 },
  { store_id:'3', store_name:'신세계 강남점', distributor_name:'신세계', category_name:'영여성', brand_count:35, ratio_pct:20.3 },
  { store_id:'3', store_name:'신세계 강남점', distributor_name:'신세계', category_name:'여성', brand_count:26, ratio_pct:15.1 },
  { store_id:'3', store_name:'신세계 강남점', distributor_name:'신세계', category_name:'기타', brand_count:10, ratio_pct:5.8 },
]

const DISTRIBUTORS = [{ name: '현대' }, { name: '롯데' }, { name: '신세계' }, { name: 'AK' }, { name: '갤러리아' }]

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const distributors = DISTRIBUTORS
  const data = params.distributor
    ? MOCK_DATA.filter(d => d.distributor_name === params.distributor)
    : MOCK_DATA

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
