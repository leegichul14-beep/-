'use client'

import { useState } from 'react'
import { useDashboardData } from '@/contexts/DataContext'
import StoreCategoryTable from '@/components/StoreCategoryTable'

export default function StoresPage() {
  const { data } = useDashboardData()
  const [distributor, setDistributor] = useState('')

  const distributors = [...new Set(data.storeRatioData.map(r => r.distributor_name))]

  const filteredData = distributor
    ? data.storeRatioData.filter(r => r.distributor_name === distributor)
    : data.storeRatioData

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">점포별 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">점포별 카테고리 비중 및 입점 현황</p>
      </div>

      {/* 필터 */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setDistributor('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            !distributor
              ? 'bg-pink-500 text-white border-pink-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          전체
        </button>
        {distributors.map(name => (
          <button
            key={name}
            onClick={() => setDistributor(name)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              distributor === name
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <StoreCategoryTable data={filteredData} />
    </div>
  )
}
