'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Brand } from '@/lib/supabase/types'
import { Search, ExternalLink } from 'lucide-react'

interface Category { id: string; name: string; color_hex: string }
interface Props { categories: Category[] }

const ONLINE = [
  { key: 'on_musinsa',  label: '무신사',   urlKey: 'url_musinsa',  color: 'bg-indigo-100 text-indigo-700' },
  { key: 'on_zigzag',   label: '지그재그', urlKey: 'url_zigzag',   color: 'bg-purple-100 text-purple-700' },
  { key: 'on_29cm',     label: '29CM',     urlKey: 'url_29cm',     color: 'bg-rose-100 text-rose-700' },
  { key: 'on_wconcept', label: 'W컨셉',   urlKey: 'url_wconcept', color: 'bg-teal-100 text-teal-700' },
] as const

export default function BrandSearchClient({ categories }: Props) {
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [onlineFilter, setOnlineFilter] = useState<string>('')
  const [results, setResults] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function search() {
    setLoading(true)
    setSearched(true)
    const supabase = createClient()

    let query = supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .limit(200)

    if (keyword.trim()) {
      query = query.ilike('name', `%${keyword.trim()}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    if (onlineFilter) {
      query = query.eq(onlineFilter as keyof Brand, true)
    }

    const { data } = await query
    setResults(data ?? [])
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* 검색 패널 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="브랜드명 검색..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">전체 카테고리</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={onlineFilter}
            onChange={e => setOnlineFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">온라인 채널 전체</option>
            {ONLINE.map(o => (
              <option key={o.key} value={o.key}>{o.label} 입점</option>
            ))}
          </select>
          <button
            onClick={search}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors"
          >
            검색
          </button>
        </div>
      </div>

      {/* 결과 테이블 */}
      {searched && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          {results.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">검색 결과가 없습니다.</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">총 <span className="font-semibold text-gray-800">{results.length}</span>개 브랜드</p>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">브랜드</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">등급</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">무신사</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">지그재그</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">29CM</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">W컨셉</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(brand => (
                    <tr key={brand.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{brand.name}</td>
                      <td className="px-4 py-2.5">
                        {brand.brand_grade && (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                            {brand.brand_grade}
                          </span>
                        )}
                      </td>
                      {ONLINE.map(o => (
                        <td key={o.key} className="px-4 py-2.5 text-center">
                          {(brand as any)[o.key] ? (
                            (brand as any)[o.urlKey] ? (
                              <a
                                href={(brand as any)[o.urlKey]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${o.color}`}
                              >
                                ● <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${o.color}`}>●</span>
                            )
                          ) : (
                            <span className="text-gray-300 text-xs">–</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  )
}
