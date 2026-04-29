'use client'

import { useDashboardData } from '@/contexts/DataContext'
import StatCard from '@/components/StatCard'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import DistributorBarChart from '@/components/charts/DistributorBarChart'

const CAT_MERGE: Record<string, string> = {
  '[PB] 영여성': '영여성', '[PB] 아동': '아동', '[PB] 캐주얼': '캐주얼',
  '[PB] 남성': '남성', '[PB] 잡화': '잡화',
  '[PB] 스포츠/아웃도어': '스포츠/아웃도어', '[PB] 골프': '골프',
}
const CAT_SKIP = new Set(['서비스/기타', '리빙'])

export default function DashboardPage() {
  const { data, folderName } = useDashboardData()
  const { meta, distSummary, majorData, group13Data } = data

  // 유통사 차트
  const distChartData = distSummary.map(d => ({ name: d.name, count: d.mapped }))

  // 대분류 차트 (PB 통합, 서비스/리빙 제외)
  const catMerged: Record<string, number> = {}
  for (const d of majorData) {
    const key = CAT_MERGE[d.name] ?? d.name
    if (CAT_SKIP.has(key)) continue
    catMerged[key] = (catMerged[key] ?? 0) + d.count
  }
  const catChartData = Object.entries(catMerged)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">전체 현황</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {meta.totalStores}개 점포 · {meta.totalRecords.toLocaleString('ko-KR')}건 분석
            {folderName && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                📂 {folderName}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 조사 레코드"   value={meta.totalRecords.toLocaleString('ko-KR')} accent />
        <StatCard label="매핑 완료"        value={meta.mappedRecords.toLocaleString('ko-KR')}   sub={`${Math.round(meta.mappedRecords / meta.totalRecords * 100)}% 완료`} />
        <StatCard label="미매핑 보강 필요" value={meta.unmappedRecords.toLocaleString('ko-KR')} sub="보강 필요" />
        <StatCard label="조사 점포 수"     value={`${meta.totalStores}개`} sub={`${distSummary.length}개 유통사`} />
      </div>

      {/* 유통사별 KPI 바 */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${distSummary.length}, minmax(0,1fr))` }}>
        {distSummary.map(d => (
          <div key={d.name} className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-semibold text-pink-500 truncate">{d.name}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{d.total.toLocaleString('ko-KR')}</p>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${d.mappedPct}%` }} />
            </div>
            <p className="mt-1 text-xs text-gray-400">{d.storeCount}점 · 매핑 {d.mappedPct}%</p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">유통사별 매핑 레코드 수</h3>
          <p className="text-xs text-gray-400 mb-4">매핑 완료 기준</p>
          <DistributorBarChart data={distChartData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">카테고리별 비중</h3>
          <p className="text-xs text-gray-400 mb-4">PB 포함 · 서비스/리빙 제외</p>
          <CategoryPieChart data={catChartData} />
        </div>
      </div>

      {/* 13그룹 분포 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">13그룹별 분포 (전체)</h3>
        <div className="space-y-2">
          {group13Data.map(g => {
            const pct = Math.round(g.count / meta.mappedRecords * 100)
            return (
              <div key={g.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-40 shrink-0 truncate">{g.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-pink-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs tabular-nums text-gray-500 w-24 text-right">
                  {g.count.toLocaleString('ko-KR')} ({pct}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
