import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/StatCard'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import DistributorBarChart from '@/components/charts/DistributorBarChart'

export const revalidate = 60

export default async function DashboardPage() {
  const supabase = await createClient()

  // 전체 활성 입점 수
  const { count: totalCount } = await supabase
    .from('v_active_listings')
    .select('*', { count: 'exact', head: true })

  // 유통사별 카운트
  const { data: byDistributorRaw } = await supabase
    .from('v_active_listings')
    .select('distributor_name, channel_type')
  const byDistributor = byDistributorRaw as { distributor_name: string; channel_type: string }[] | null

  // 카테고리별 카운트
  const { data: byCategoryRaw } = await supabase
    .from('v_active_listings')
    .select('category_name')
  const byCategory = byCategoryRaw as { category_name: string | null }[] | null

  // 미매핑 수
  const { count: unmappedCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'unmapped')

  // 온라인 채널 집계
  const { data: onlineData } = await supabase
    .from('brands')
    .select('on_musinsa, on_zigzag, on_29cm, on_wconcept')
    .eq('is_active', true)

  const online = (onlineData ?? []) as { on_musinsa: boolean; on_zigzag: boolean; on_29cm: boolean; on_wconcept: boolean }[]
  const onlineStats = {
    musinsa: online.filter(b => b.on_musinsa).length,
    zigzag:  online.filter(b => b.on_zigzag).length,
    cm29:    online.filter(b => b.on_29cm).length,
    wconcept:online.filter(b => b.on_wconcept).length,
  }

  // 집계 계산
  const distMap: Record<string, number> = {}
  const catMap: Record<string, number> = {}
  for (const row of byDistributor ?? []) {
    if (row.channel_type !== 'offline') continue
    distMap[row.distributor_name] = (distMap[row.distributor_name] ?? 0) + 1
  }
  for (const row of byCategory ?? []) {
    const k = row.category_name ?? '미분류'
    catMap[k] = (catMap[k] ?? 0) + 1
  }

  const distData = Object.entries(distMap).map(([name, count]) => ({ name, count }))
  const catData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">전체 현황</h2>
        <p className="text-sm text-gray-500 mt-0.5">전국 오프라인·온라인 입점 컨텐츠 요약</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 활성 입점" value={(totalCount ?? 0).toLocaleString('ko-KR')} accent />
        <StatCard label="미매핑 건수" value={(unmappedCount ?? 0).toLocaleString('ko-KR')} sub="보강 필요" />
        <StatCard label="무신사 입점" value={onlineStats.musinsa} sub="브랜드" />
        <StatCard label="29CM 입점"   value={onlineStats.cm29}    sub="브랜드" />
      </div>

      {/* 온라인 채널 바 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '무신사',   val: onlineStats.musinsa,  color: 'bg-indigo-500' },
          { label: '지그재그', val: onlineStats.zigzag,   color: 'bg-purple-500' },
          { label: '29CM',     val: onlineStats.cm29,     color: 'bg-rose-500' },
          { label: 'W컨셉',   val: onlineStats.wconcept, color: 'bg-teal-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={`w-8 h-1.5 rounded-full ${color} mb-3`} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900">{val}개</p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">유통사별 입점 수</h3>
          <DistributorBarChart data={distData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">카테고리 비중</h3>
          <CategoryPieChart data={catData} />
        </div>
      </div>
    </div>
  )
}
