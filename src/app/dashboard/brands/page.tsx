'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import { ChevronRight, ArrowLeft, MapPin, Package } from 'lucide-react'

type Level = 'group13' | 'major' | 'brand' | 'store'

export default function BrandsPage() {
  const { data } = useDashboardData()
  const { group13Data, g13MajorData, g13MajorBrandData, brandStoreData } = data

  const [sel13,   setSel13]   = useState<string | null>(null)
  const [selMaj,  setSelMaj]  = useState<string | null>(null)
  const [selBrand, setSelBrand] = useState<string | null>(null)

  const level: Level =
    selBrand  ? 'store'   :
    selMaj    ? 'brand'   :
    sel13     ? 'major'   : 'group13'

  function toRoot()   { setSel13(null); setSelMaj(null); setSelBrand(null) }
  function toGroup13(g: string) { setSel13(g); setSelMaj(null); setSelBrand(null) }
  function toMajor(m: string)   { setSelMaj(m); setSelBrand(null) }

  // Level 1: 대분류 (선택 group13 내)
  const majorsForGroup = useMemo(() =>
    sel13
      ? g13MajorData.filter(d => d.group13 === sel13).sort((a, b) => b.count - a.count)
      : [],
    [sel13, g13MajorData]
  )

  // Level 2: 브랜드 (선택 group13 + major 내)
  const brandsForMajor = useMemo(() =>
    (sel13 && selMaj)
      ? g13MajorBrandData.filter(d => d.group13 === sel13 && d.major === selMaj)
      : [],
    [sel13, selMaj, g13MajorBrandData]
  )

  // Level 3: 지점 (선택 브랜드)
  const storesForBrand = useMemo(() =>
    selBrand
      ? brandStoreData.filter(d => d.brand === selBrand).sort((a, b) => b.count - a.count)
      : [],
    [selBrand, brandStoreData]
  )

  // 현재 그룹의 총 레코드 (breadcrumb 표시용)
  const groupTotal = sel13
    ? (group13Data.find(g => g.name === sel13)?.count ?? 0)
    : 0

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">브랜드 검색</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          13그룹 → 대분류 → 브랜드 → 지점 순으로 탐색
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm flex-wrap bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <button
          onClick={toRoot}
          className={`font-medium transition-colors ${
            level === 'group13' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-500'
          }`}
        >
          전체
        </button>
        {sel13 && (
          <>
            <ChevronRight size={14} className="text-gray-300 shrink-0" />
            <button
              onClick={() => toGroup13(sel13)}
              className={`font-medium transition-colors ${
                level === 'major' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              {sel13}
            </button>
          </>
        )}
        {selMaj && (
          <>
            <ChevronRight size={14} className="text-gray-300 shrink-0" />
            <button
              onClick={() => toMajor(selMaj)}
              className={`font-medium transition-colors ${
                level === 'brand' ? 'text-pink-600' : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              {selMaj}
            </button>
          </>
        )}
        {selBrand && (
          <>
            <ChevronRight size={14} className="text-gray-300 shrink-0" />
            <span className="font-semibold text-pink-600">{selBrand}</span>
          </>
        )}
      </nav>

      {/* ── Level 0: 13그룹 카드 ── */}
      {level === 'group13' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {group13Data.map(g => (
            <button
              key={g.name}
              onClick={() => toGroup13(g.name)}
              className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-pink-300 hover:bg-pink-50 transition-all hover:shadow-sm group"
            >
              <p className="text-xs font-semibold text-gray-500 group-hover:text-pink-500 transition-colors">13그룹</p>
              <p className="text-sm font-bold text-gray-800 mt-1 leading-tight">{g.name}</p>
              <p className="mt-2 text-2xl font-bold text-pink-500">{g.count.toLocaleString('ko-KR')}</p>
              <p className="mt-0.5 text-xs text-gray-400">레코드</p>
            </button>
          ))}
        </div>
      )}

      {/* ── Level 1: 대분류 카드 ── */}
      {level === 'major' && (
        <>
          <button
            onClick={toRoot}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft size={14} /> 전체 그룹으로
          </button>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {majorsForGroup.map(m => (
              <button
                key={m.major}
                onClick={() => toMajor(m.major)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:border-pink-300 hover:bg-pink-50 transition-all hover:shadow-sm group"
              >
                <p className="text-xs font-semibold text-gray-500 group-hover:text-pink-500 transition-colors">대분류</p>
                <p className="text-sm font-bold text-gray-800 mt-1 leading-tight">{m.major}</p>
                <p className="mt-2 text-2xl font-bold text-pink-500">{m.count.toLocaleString('ko-KR')}</p>
                <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1">
                  <div
                    className="bg-pink-300 h-1 rounded-full"
                    style={{ width: `${groupTotal > 0 ? Math.round(m.count / groupTotal * 100) : 0}%` }}
                  />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  {groupTotal > 0 ? Math.round(m.count / groupTotal * 100) : 0}%
                </p>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Level 2: 브랜드 리스트 ── */}
      {level === 'brand' && (
        <>
          <button
            onClick={() => sel13 && toGroup13(sel13)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft size={14} /> {sel13} 대분류로
          </button>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                총 <span className="font-bold text-gray-800">{brandsForMajor.length.toLocaleString('ko-KR')}</span>개 브랜드
              </p>
              <p className="text-xs text-gray-400">클릭 → 지점 확인</p>
            </div>
            <div className="divide-y divide-gray-50 max-h-[60vh] overflow-y-auto">
              {brandsForMajor.map((b, i) => (
                <button
                  key={b.brand}
                  onClick={() => setSelBrand(b.brand)}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-pink-50 transition-colors text-left group"
                >
                  <span className="text-gray-300 text-xs w-6 tabular-nums shrink-0">{i + 1}</span>
                  <span className="flex-1 font-semibold text-gray-900 text-sm group-hover:text-pink-600 transition-colors">
                    {b.brand}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} className="text-gray-400" />
                    {b.storeCount}개 지점
                  </span>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-pink-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Level 3: 지점 리스트 ── */}
      {level === 'store' && (
        <>
          <button
            onClick={() => selMaj && toMajor(selMaj)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors"
          >
            <ArrowLeft size={14} /> {selMaj} 브랜드 목록으로
          </button>

          {/* 브랜드 요약 카드 */}
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-pink-400 uppercase tracking-wide">브랜드</p>
                <h3 className="mt-1 text-2xl font-bold text-pink-700">{selBrand}</h3>
                <p className="mt-0.5 text-sm text-pink-500">
                  {sel13} · {selMaj}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-pink-600">
                  <MapPin size={16} />
                  <span className="text-2xl font-bold">{storesForBrand.length}</span>
                </div>
                <p className="text-xs text-pink-400 mt-0.5">입점 지점</p>
              </div>
            </div>
          </div>

          {/* 지점 리스트 */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">
                총 <span className="font-bold text-gray-800">{storesForBrand.length}</span>개 지점 입점
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {storesForBrand.map((s, i) => (
                <div
                  key={`${s.distName}_${s.storeName}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-300 text-xs w-6 tabular-nums shrink-0">{i + 1}</span>
                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-semibold bg-pink-100 text-pink-600 shrink-0">
                    {s.distName}
                  </span>
                  <span className="flex-1 font-medium text-gray-800 text-sm">{s.storeName}</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Package size={11} />
                    {s.count}건
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
