'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import StatCard from '@/components/StatCard'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const G13_COLORS = [
  '#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#6366f1','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#a855f7','#e879f9',
]

export default function DashboardPage() {
  const { data, folderName } = useDashboardData()
  const { meta, distSummary, group13Data, g13DistData } = data

  const [selectedDist, setSelectedDist] = useState<string | null>(null)

  // 카테고리 데이터 (선택 유통사 기준)
  const group13Rows = useMemo(() => {
    if (selectedDist) {
      const filtered = g13DistData.filter(d => d.distName === selectedDist)
      const total    = filtered.reduce((s, d) => s + d.count, 0)
      return {
        rows:  filtered.sort((a, b) => b.count - a.count).map(d => ({ name: d.group13, count: d.count })),
        total,
      }
    }
    return {
      rows:  [...group13Data].sort((a, b) => b.count - a.count),
      total: meta.mappedRecords,
    }
  }, [selectedDist, g13DistData, group13Data, meta.mappedRecords])

  return (
    <div className="space-y-6">

      {/* 헤더 */}
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
        {selectedDist && (
          <button
            onClick={() => setSelectedDist(null)}
            className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ✕ 전체 보기
          </button>
        )}
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 조사 레코드"   value={meta.totalRecords.toLocaleString('ko-KR')} accent />
        <StatCard label="매핑 완료"        value={meta.mappedRecords.toLocaleString('ko-KR')} sub={`${Math.round(meta.mappedRecords / meta.totalRecords * 100)}% 완료`} />
        <StatCard label="미매핑 보강 필요" value={meta.unmappedRecords.toLocaleString('ko-KR')} sub="보강 필요" />
        <StatCard label="조사 점포 수"     value={`${meta.totalStores}개`} sub={`${distSummary.length}개 유통사`} />
      </div>

      {/* 유통사별 KPI 카드 — 클릭 시 카테고리 필터 */}
      <div>
        <p className="text-xs text-gray-400 mb-2 px-1">유통사를 클릭하면 카테고리 비중이 해당 유통사 기준으로 변경됩니다</p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-8">
          {distSummary.map(d => {
            const isSelected = selectedDist === d.name
            const isOther    = selectedDist !== null && !isSelected
            return (
              <button
                key={d.name}
                onClick={() => setSelectedDist(isSelected ? null : d.name)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-pink-400 bg-pink-50 shadow-md ring-2 ring-pink-200'
                    : isOther
                      ? 'border-gray-100 bg-white opacity-40'
                      : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-sm cursor-pointer'
                }`}
              >
                <p className="text-xs font-semibold text-pink-500 truncate">{d.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-0.5">{d.total.toLocaleString('ko-KR')}</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-pink-400 h-1.5 rounded-full" style={{ width: `${d.mappedPct}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-400">{d.storeCount}점 · 매핑 {d.mappedPct}%</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* 카테고리 세로 바 차트 2열: 건수 + 비율 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 건수 차트 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">카테고리별 레코드 수</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedDist
                  ? <><span className="font-semibold text-pink-500">{selectedDist}</span> 기준</>
                  : '전체 · 상단 유통사 카드 클릭으로 변경'}
              </p>
            </div>
            {selectedDist && (
              <span className="text-xs text-pink-500 font-semibold bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                {group13Rows.total.toLocaleString('ko-KR')}건
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={group13Rows.rows} margin={{ left: 8, right: 16, top: 8, bottom: 80 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-40}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v as number).toLocaleString('ko-KR')} />
              <Tooltip
                formatter={(v) => [(v as number).toLocaleString('ko-KR'), '레코드']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#9ca3af', formatter: (v: unknown) => (v as number).toLocaleString('ko-KR') }}>
                {group13Rows.rows.map((_, i) => (
                  <Cell key={i} fill={G13_COLORS[i % G13_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 비율 차트 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700">카테고리별 비율 (%)</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedDist
                ? <><span className="font-semibold text-pink-500">{selectedDist}</span> 기준</>
                : '전체 · 상단 유통사 카드 클릭으로 변경'}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart
              data={group13Rows.rows.map(g => ({
                name: g.name,
                pct: group13Rows.total > 0 ? parseFloat((g.count / group13Rows.total * 100).toFixed(1)) : 0,
              }))}
              margin={{ left: 8, right: 16, top: 8, bottom: 80 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-40}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={v => `${v}%`}
                domain={[0, 'auto']}
              />
              <Tooltip
                formatter={(v) => [`${v}%`, '비율']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fill: '#9ca3af', formatter: (v: unknown) => `${v}%` }}>
                {group13Rows.rows.map((_, i) => (
                  <Cell key={i} fill={G13_COLORS[i % G13_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 카테고리 상세 분포 바 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          카테고리별 상세 분포
          {selectedDist
            ? <span className="ml-2 text-pink-500 font-normal text-sm">— {selectedDist}</span>
            : <span className="ml-2 text-gray-400 font-normal text-xs">전체</span>
          }
        </h3>
        <div className="space-y-2.5">
          {group13Rows.rows.map((g, i) => {
            const pct = group13Rows.total > 0 ? Math.round(g.count / group13Rows.total * 100) : 0
            return (
              <div key={g.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-44 shrink-0 truncate">{g.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: G13_COLORS[i % G13_COLORS.length] }}
                  />
                </div>
                <span className="text-xs tabular-nums text-gray-500 w-28 text-right">
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
