'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import { MapPin, ChevronRight, BarChart2, Tag } from 'lucide-react'
import hyundaiSalesRaw from '@/data/hyundai-sales.json'

const G13_COLORS = [
  '#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#6366f1','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#a855f7','#e879f9',
]

interface Store { distName: string; storeName: string; total: number }
interface SaleRecord {
  no: number; brand: string
  total: number; offline: number; online: number; monthly_avg: number
}

const hyundaiSales = hyundaiSalesRaw as Record<string, SaleRecord[]>

// ── 유틸 ─────────────────────────────────────────────────
function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s\-_.·_]/g, '').replace(/[()（）]/g, '')
}

/** 점포명 → 현대 매출 레코드 배열 (없으면 null) */
function matchStoreSales(storeName: string): SaleRecord[] | null {
  const norm = normalize(storeName)
  for (const [key, records] of Object.entries(hyundaiSales)) {
    const nk = normalize(key)
    if (norm.includes(nk) || nk.includes(norm)) return records
  }
  return null
}

/** 브랜드명 유사도 (0~1) */
function similarity(a: string, b: string): number {
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.92
  let m = 0
  for (const ch of na) if (nb.includes(ch)) m++
  return (2 * m) / (na.length + nb.length)
}

/** 브랜드명으로 매출 레코드 찾기 (80% 이상 일치) */
function matchBrandSales(brand: string, records: SaleRecord[]): SaleRecord | null {
  let best: { rec: SaleRecord | null; score: number } = { rec: null, score: 0 }
  for (const rec of records) {
    const s = similarity(brand, rec.brand)
    if (s > best.score) best = { rec, score: s }
  }
  return best.score >= 0.8 ? best.rec : null
}

// ── 컴포넌트 ──────────────────────────────────────────────
export default function StoresPage() {
  const { data } = useDashboardData()
  const { g13StoreData, distSummary, g13MajorBrandData, brandStoreData } = data

  const [distributor,      setDistributor]      = useState('')
  const [selectedStore,    setSelectedStore]    = useState<Store | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const distributors = distSummary.map(d => d.name)

  // 점포별 총 레코드 집계
  const storeSummary = useMemo<Store[]>(() => {
    const map: Record<string, Store> = {}
    for (const r of g13StoreData) {
      const key = `${r.distName}||${r.storeName}`
      if (!map[key]) map[key] = { distName: r.distName, storeName: r.storeName, total: 0 }
      map[key].total += r.count
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [g13StoreData])

  const filteredStores = useMemo(
    () => distributor ? storeSummary.filter(s => s.distName === distributor) : storeSummary,
    [distributor, storeSummary]
  )

  // 선택 점포의 카테고리 breakdown
  const storeDetail = useMemo(() => {
    if (!selectedStore) return []
    return g13StoreData
      .filter(r => r.distName === selectedStore.distName && r.storeName === selectedStore.storeName)
      .sort((a, b) => b.count - a.count)
  }, [selectedStore, g13StoreData])

  // 선택 점포 + 카테고리의 브랜드 목록
  const brandList = useMemo(() => {
    if (!selectedStore || !selectedCategory) return []
    // 해당 점포에 있는 브랜드 집합
    const storeBrandSet = new Set(
      brandStoreData
        .filter(b => b.distName === selectedStore.distName && b.storeName === selectedStore.storeName)
        .map(b => b.brand)
    )
    // 해당 group13에 속하는 브랜드 중 점포 교차
    return g13MajorBrandData
      .filter(b => b.group13 === selectedCategory && storeBrandSet.has(b.brand))
      .sort((a, b) => b.storeCount - a.storeCount)
  }, [selectedStore, selectedCategory, brandStoreData, g13MajorBrandData])

  // 현대 매출 데이터 (점포명 매칭)
  const storeSalesRecords = useMemo(
    () => selectedStore ? matchStoreSales(selectedStore.storeName) : null,
    [selectedStore]
  )

  function handleDistChange(dist: string) {
    setDistributor(dist)
    setSelectedStore(null)
    setSelectedCategory(null)
  }

  function handleStoreClick(s: Store) {
    const isSame = selectedStore?.distName === s.distName && selectedStore?.storeName === s.storeName
    setSelectedStore(isSame ? null : s)
    setSelectedCategory(null)
  }

  function handleCategoryClick(cat: string) {
    setSelectedCategory(prev => prev === cat ? null : cat)
  }

  const showBrandPanel = !!selectedStore && !!selectedCategory

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">점포별 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">점포 클릭 → 카테고리 클릭 → 브랜드 목록 확인</p>
      </div>

      {/* 유통사 필터 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleDistChange('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !distributor ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          전체
        </button>
        {distributors.map(name => (
          <button key={name} onClick={() => handleDistChange(name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              distributor === name ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* ── 3패널 레이아웃 ── */}
      <div className={`grid grid-cols-1 gap-4 items-start ${showBrandPanel ? 'lg:grid-cols-7' : 'lg:grid-cols-5'}`}>

        {/* ── 패널 1: 점포 목록 ── */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <p className="text-xs font-semibold text-gray-600">
              점포 목록
              <span className="ml-1.5 font-normal text-gray-400">({filteredStores.length}개)</span>
            </p>
            <p className="text-xs text-gray-400">클릭 → 카테고리 확인</p>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto" style={{ maxHeight: '65vh' }}>
            {filteredStores.map((s, idx) => {
              const isSelected = selectedStore?.distName === s.distName && selectedStore?.storeName === s.storeName
              return (
                <button
                  key={`${s.distName}||${s.storeName}`}
                  onClick={() => handleStoreClick(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 ${
                    isSelected
                      ? 'bg-pink-50 border-pink-400'
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <span className="text-gray-300 text-xs w-5 tabular-nums shrink-0">{idx + 1}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                    isSelected ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {s.distName}
                  </span>
                  <span className={`flex-1 text-sm truncate ${
                    isSelected ? 'font-bold text-pink-700' : 'font-medium text-gray-800'
                  }`}>
                    {s.storeName}
                  </span>
                  <span className="text-xs tabular-nums text-gray-400 shrink-0">
                    {s.total.toLocaleString('ko-KR')}
                  </span>
                  <ChevronRight size={12} className={`shrink-0 ${isSelected ? 'text-pink-400' : 'text-gray-200'}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 패널 2: 카테고리 상세 ── */}
        <div className={`${showBrandPanel ? 'lg:col-span-2' : 'lg:col-span-3'} rounded-xl border border-gray-200 bg-white overflow-hidden min-h-60 transition-all`}>
          {selectedStore ? (
            <>
              {/* 점포 헤더 */}
              <div className="px-5 py-4 bg-gradient-to-r from-pink-50 to-white border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-pink-500 text-white mb-2">
                      {selectedStore.distName}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{selectedStore.storeName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                      <BarChart2 size={13} className="text-gray-400" />
                      총 {selectedStore.total.toLocaleString('ko-KR')}건 · {storeDetail.length}개 카테고리
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-pink-600 justify-end">
                      <MapPin size={15} />
                      <span className="text-2xl font-bold">{storeDetail.length}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">카테고리</p>
                  </div>
                </div>
              </div>

              {/* 카테고리 바 (클릭 가능) */}
              <div className="p-4 space-y-1">
                <p className="text-xs text-gray-400 mb-2 px-1">카테고리 클릭 → 브랜드 목록</p>
                {storeDetail.map((r, i) => {
                  const pct = selectedStore.total > 0 ? Math.round(r.count / selectedStore.total * 100) : 0
                  const isActive = selectedCategory === r.group13
                  return (
                    <button
                      key={r.group13}
                      onClick={() => handleCategoryClick(r.group13)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-pink-50 ring-1 ring-pink-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: G13_COLORS[i % G13_COLORS.length] }}
                      />
                      <span className={`text-sm shrink-0 truncate text-left ${
                        isActive
                          ? 'w-36 font-bold text-pink-700'
                          : 'w-40 font-medium text-gray-700'
                      }`}>
                        {r.group13}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: G13_COLORS[i % G13_COLORS.length] }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-gray-500 w-24 text-right shrink-0">
                        {r.count.toLocaleString('ko-KR')}건 ({pct}%)
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-60 text-center p-10">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <MapPin size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">점포를 선택하세요</p>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                좌측 목록에서 점포를 클릭하면<br />해당 점포의 카테고리 비중을 확인할 수 있습니다
              </p>
            </div>
          )}
        </div>

        {/* ── 패널 3: 브랜드 목록 + 매출 ── */}
        {showBrandPanel && (
          <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white overflow-hidden min-h-60">
            {/* 헤더 */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-white border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {selectedStore?.storeName} · {selectedCategory}
                  </p>
                  <h3 className="text-lg font-bold text-gray-900">브랜드 목록</h3>
                  {storeSalesRecords && (
                    <p className="text-xs text-amber-600 font-medium mt-1">
                      📊 매출 데이터 연동 · 단위: 천원
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 justify-end">
                    <Tag size={15} />
                    <span className="text-2xl font-bold">{brandList.length}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">브랜드</p>
                </div>
              </div>
            </div>

            {brandList.length === 0 ? (
              <div className="p-10 text-center text-gray-400 text-sm">
                해당 카테고리의 브랜드 데이터가 없습니다
              </div>
            ) : storeSalesRecords ? (
              /* ── 매출 데이터 있는 경우 (현대): 테이블 ── */
              <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-gray-400 font-medium w-7">#</th>
                      <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">브랜드</th>
                      <th className="px-3 py-2.5 text-right text-gray-600 font-semibold">합계</th>
                      <th className="px-3 py-2.5 text-right text-blue-500 font-semibold">오프라인</th>
                      <th className="px-3 py-2.5 text-right text-purple-500 font-semibold">온라인</th>
                      <th className="px-3 py-2.5 text-right text-gray-500 font-semibold">월평균</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brandList.map((b, idx) => {
                      const sales = matchBrandSales(b.brand, storeSalesRecords)
                      const hasSales = sales && sales.total > 0
                      return (
                        <tr key={`${b.brand}_${idx}`} className="border-b border-gray-50 hover:bg-amber-50 transition-colors">
                          <td className="px-3 py-2 text-gray-300 tabular-nums">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium text-gray-800">{b.brand}</td>
                          {hasSales ? (
                            <>
                              <td className="px-3 py-2 text-right tabular-nums font-semibold text-gray-800">
                                {sales.total.toLocaleString('ko-KR')}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-blue-600">
                                {sales.offline.toLocaleString('ko-KR')}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-purple-600">
                                {sales.online > 0
                                  ? sales.online.toLocaleString('ko-KR')
                                  : <span className="text-gray-300">–</span>}
                              </td>
                              <td className="px-3 py-2 text-right tabular-nums text-gray-500">
                                {sales.monthly_avg.toLocaleString('ko-KR')}
                              </td>
                            </>
                          ) : (
                            <td colSpan={4} className="px-3 py-2 text-center text-gray-300">
                              {sales ? '매출 없음' : '미매칭'}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── 매출 데이터 없는 경우: 그리드 ── */
              <div className="p-4 grid grid-cols-2 gap-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                {brandList.map((b, idx) => (
                  <div key={`${b.brand}_${idx}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs text-gray-300 tabular-nums w-5 shrink-0">{idx + 1}</span>
                    <span className="text-sm font-medium text-gray-800 truncate">{b.brand}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
