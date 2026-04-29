'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const DIST_COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']

export default function Group13Page() {
  const { data } = useDashboardData()
  const { group13Data, g13DistData, g13MajorData, g13StoreData, distSummary } = data

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const distNames = distSummary.map(d => d.name)

  // 유통사별 breakdown (선택 그룹 기준)
  const distBarData = useMemo(() => {
    if (selectedGroup) {
      return g13DistData
        .filter(d => d.group13 === selectedGroup)
        .sort((a, b) => b.count - a.count)
        .map(d => ({ name: d.distName, count: d.count }))
    }
    // 전체: 유통사별 합계
    const agg: Record<string, number> = {}
    for (const d of g13DistData) agg[d.distName] = (agg[d.distName] || 0) + d.count
    return Object.entries(agg).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }))
  }, [selectedGroup, g13DistData])

  // 대분류별 breakdown (선택 그룹 기준)
  const majorRows = useMemo(() => {
    if (!selectedGroup) return []
    return g13MajorData
      .filter(d => d.group13 === selectedGroup)
      .sort((a, b) => b.count - a.count)
  }, [selectedGroup, g13MajorData])

  // 지점별 top 20 (선택 그룹 기준)
  const storeRows = useMemo(() => {
    const rows = selectedGroup
      ? g13StoreData.filter(d => d.group13 === selectedGroup)
      : g13StoreData
    return rows.slice(0, 20)
  }, [selectedGroup, g13StoreData])

  const total = selectedGroup
    ? (group13Data.find(g => g.name === selectedGroup)?.count ?? 0)
    : data.meta.mappedRecords

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">13그룹 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          13개 그룹핑 기준 · 유통사별 / 지점별 비중 분석
        </p>
      </div>

      {/* 그룹 선택 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGroup(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !selectedGroup
              ? 'bg-pink-500 text-white border-pink-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          전체
        </button>
        {group13Data.map(g => (
          <button
            key={g.name}
            onClick={() => setSelectedGroup(g.name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              selectedGroup === g.name
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* KPI: 선택 그룹 총 레코드 + 유통사별 */}
      {selectedGroup && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
            <p className="text-xs text-pink-500 font-semibold">총 레코드</p>
            <p className="text-xl font-bold text-pink-700 mt-0.5">{total.toLocaleString('ko-KR')}</p>
          </div>
          {distBarData.map((d, i) => (
            <div key={d.name} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold truncate" style={{ color: DIST_COLORS[i % DIST_COLORS.length] }}>{d.name}</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{d.count.toLocaleString('ko-KR')}</p>
              <p className="text-xs text-gray-400 mt-0.5">{((d.count / total) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}

      {/* 차트 2열 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 유통사별 바 차트 */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">유통사별 레코드 수</h3>
          <p className="text-xs text-gray-400 mb-4">
            {selectedGroup ? `${selectedGroup} 그룹 기준` : '전체 기준'}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distBarData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('ko-KR')} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={72} />
              <Tooltip formatter={(v) => [(v as number).toLocaleString('ko-KR'), '레코드']} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {distBarData.map((_, i) => (
                  <Cell key={i} fill={DIST_COLORS[i % DIST_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 대분류별 가로 바 (그룹 선택 시) / 전체 그룹 분포 (전체 선택 시) */}
        {selectedGroup ? (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">대분류별 분포</h3>
            <p className="text-xs text-gray-400 mb-4">{selectedGroup} 그룹 내 비중</p>
            <div className="space-y-2.5">
              {majorRows.map(r => {
                const pct = total > 0 ? Math.round(r.count / total * 100) : 0
                return (
                  <div key={r.major} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-36 shrink-0 truncate">{r.major}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-pink-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-gray-500 w-28 text-right">
                      {r.count.toLocaleString('ko-KR')} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">13그룹별 비중</h3>
            <p className="text-xs text-gray-400 mb-4">전체 매핑 레코드 기준</p>
            <div className="space-y-2.5">
              {group13Data.slice(0, 10).map(g => {
                const pct = Math.round(g.count / data.meta.mappedRecords * 100)
                return (
                  <div key={g.name} className="flex items-center gap-3 cursor-pointer group" onClick={() => setSelectedGroup(g.name)}>
                    <span className="text-xs text-gray-600 w-36 shrink-0 truncate group-hover:text-pink-600 transition-colors">{g.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-pink-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-gray-500 w-28 text-right">
                      {g.count.toLocaleString('ko-KR')} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 전체 뷰: 그룹 × 유통사 매트릭스 */}
      {!selectedGroup && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">13그룹 × 유통사 교차표</h3>
            <p className="text-xs text-gray-400 mt-0.5">행 클릭 시 해당 그룹 상세 분석</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                  <th className="py-3 px-4 font-semibold text-gray-600">13그룹</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 text-right">합계</th>
                  {distNames.map(d => (
                    <th key={d} className="py-3 px-4 font-semibold text-gray-600 text-right">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group13Data.map(g => {
                  const distCounts = distNames.map(dn =>
                    g13DistData.find(d => d.group13 === g.name && d.distName === dn)?.count ?? 0
                  )
                  return (
                    <tr
                      key={g.name}
                      className="border-b border-gray-50 hover:bg-pink-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedGroup(g.name)}
                    >
                      <td className="py-2.5 px-4 font-medium text-gray-800">{g.name}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-gray-900">
                        {g.count.toLocaleString('ko-KR')}
                      </td>
                      {distCounts.map((c, i) => (
                        <td key={distNames[i]} className="py-2.5 px-4 text-right tabular-nums text-gray-600">
                          {c ? c.toLocaleString('ko-KR') : <span className="text-gray-300">–</span>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 지점별 TOP 20 */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">
            지점별 현황 (TOP 20)
            {selectedGroup && <span className="ml-2 text-pink-500">— {selectedGroup}</span>}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left">
                <th className="py-3 px-4 font-semibold text-gray-600 w-10">순위</th>
                <th className="py-3 px-4 font-semibold text-gray-600">유통사</th>
                <th className="py-3 px-4 font-semibold text-gray-600">점포</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-right">레코드</th>
                <th className="py-3 px-4 font-semibold text-gray-600 text-right">비중</th>
              </tr>
            </thead>
            <tbody>
              {storeRows.map((r, i) => (
                <tr key={`${r.distName}_${r.storeName}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-4 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="py-2.5 px-4">
                    <span className="text-xs font-semibold text-pink-500">{r.distName}</span>
                  </td>
                  <td className="py-2.5 px-4 font-medium text-gray-800">{r.storeName}</td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-gray-700">
                    {r.count.toLocaleString('ko-KR')}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums text-gray-500">
                    {total > 0 ? ((r.count / total) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
