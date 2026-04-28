'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

interface Distributor { name: string; short_code: string | null }
interface Category    { name: string; color_hex: string }

interface Props {
  distributors: Distributor[]
  categories:   Category[]
}

interface ResultRow {
  category_name: string | null
  brand_count: number
}

export default function PeriodAnalysisClient({ distributors, categories }: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [distributor, setDistributor] = useState('전체')
  const [results, setResults] = useState<ResultRow[]>([])
  const [loading, setLoading] = useState(false)

  const catColorMap = Object.fromEntries(categories.map(c => [c.name, c.color_hex]))

  async function search() {
    if (!startDate || !endDate) return
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('listings')
      .select(`
        id,
        start_date,
        end_date,
        brands ( category_id, categories ( name ) ),
        stores ( distributor_id, distributors ( name ) )
      `)
      .lte('start_date', endDate)
      .or(`end_date.is.null,end_date.gte.${startDate}`)
      .in('status', ['active', 'closed'])

    const { data, error } = await query

    if (error || !data) { setLoading(false); return }

    // 카테고리별 집계
    const catMap: Record<string, number> = {}
    for (const row of data as any[]) {
      if (distributor !== '전체') {
        const distName = row.stores?.distributors?.name
        if (distName !== distributor) continue
      }
      const catName = row.brands?.categories?.name ?? '미분류'
      catMap[catName] = (catMap[catName] ?? 0) + 1
    }

    const rows: ResultRow[] = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([category_name, brand_count]) => ({ category_name, brand_count }))

    setResults(rows)
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* 필터 패널 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="block border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="block border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">유통사</label>
            <select
              value={distributor}
              onChange={e => setDistributor(e.target.value)}
              className="block border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option>전체</option>
              {distributors.map(d => (
                <option key={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={search}
            disabled={loading || !startDate || !endDate}
            className="px-5 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors"
          >
            {loading ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      {/* 결과 차트 */}
      {results.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            카테고리별 입점 현황 ({startDate} ~ {endDate})
          </h3>
          <p className="text-xs text-gray-400 mb-4">총 {results.reduce((s, r) => s + r.brand_count, 0)}개</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={results} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="category_name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}개`, '입점 수']} />
              <Bar
                dataKey="brand_count"
                name="입점 수"
                radius={[4, 4, 0, 0]}
                fill="#EC4899"
              />
            </BarChart>
          </ResponsiveContainer>

          {/* 테이블 */}
          <table className="w-full text-sm mt-6 border-t border-gray-100 pt-4">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
                <th className="py-2 pr-4">카테고리</th>
                <th className="py-2 pr-4 text-right">입점 수</th>
                <th className="py-2 text-right">비중</th>
              </tr>
            </thead>
            <tbody>
              {results.map(r => {
                const total = results.reduce((s, x) => s + x.brand_count, 0)
                const pct = total > 0 ? ((r.brand_count / total) * 100).toFixed(1) : '0.0'
                return (
                  <tr key={r.category_name} className="border-t border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-800">{r.category_name ?? '미분류'}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{r.brand_count}</td>
                    <td className="py-2 text-right tabular-nums text-pink-600">{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !loading && startDate && endDate && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
          해당 기간에 입점 데이터가 없습니다.
        </div>
      )}
    </div>
  )
}
