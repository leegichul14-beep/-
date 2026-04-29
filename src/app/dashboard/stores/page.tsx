'use client'

import { useState, useMemo } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import { MapPin, ChevronRight, BarChart2 } from 'lucide-react'

const G13_COLORS = [
  '#ec4899','#8b5cf6','#3b82f6','#10b981','#f59e0b',
  '#ef4444','#6366f1','#14b8a6','#f97316','#84cc16',
  '#06b6d4','#a855f7','#e879f9',
]

interface Store { distName: string; storeName: string; total: number }

export default function StoresPage() {
  const { data } = useDashboardData()
  const { g13StoreData, distSummary } = data

  const [distributor,   setDistributor]   = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)

  const distributors = distSummary.map(d => d.name)

  // 점포별 총 레코드 집계 (g13StoreData 기반)
  const storeSummary = useMemo<Store[]>(() => {
    const map: Record<string, Store> = {}
    for (const r of g13StoreData) {
      const key = `${r.distName}||${r.storeName}`
      if (!map[key]) map[key] = { distName: r.distName, storeName: r.storeName, total: 0 }
      map[key].total += r.count
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [g13StoreData])

  // 유통사 필터 적용
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

  function handleDistChange(dist: string) {
    setDistributor(dist)
    setSelectedStore(null)
  }

  function handleStoreClick(s: Store) {
    const isSame = selectedStore?.distName === s.distName && selectedStore?.storeName === s.storeName
    setSelectedStore(isSame ? null : s)
  }

  return (
    <div className="space-y-6">

      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">점포별 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">점포 클릭 → 카테고리 비중 상세 확인</p>
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
          <button
            key={name}
            onClick={() => handleDistChange(name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              distributor === name ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* 좌우 분할 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* ── 좌: 점포 목록 ── */}
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

        {/* ── 우: 카테고리 상세 ── */}
        <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white overflow-hidden min-h-60">
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
                      총 {selectedStore.total.toLocaleString('ko-KR')}건 · {storeDetail.length}개 그룹
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

              {/* 카테고리 바 */}
              <div className="p-5 space-y-3">
                {storeDetail.map((r, i) => {
                  const pct = selectedStore.total > 0
                    ? Math.round(r.count / selectedStore.total * 100)
                    : 0
                  return (
                    <div key={r.group13} className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: G13_COLORS[i % G13_COLORS.length] }}
                      />
                      <span className="text-sm text-gray-700 w-44 shrink-0 truncate font-medium">{r.group13}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, backgroundColor: G13_COLORS[i % G13_COLORS.length] }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-gray-600 w-28 text-right shrink-0">
                        {r.count.toLocaleString('ko-KR')}건 ({pct}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* 미선택 안내 */
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
      </div>
    </div>
  )
}
