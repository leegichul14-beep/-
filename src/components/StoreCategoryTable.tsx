'use client'

interface Row {
  distributor_name: string
  store_name: string
  category_name: string | null
  brand_count: number
  ratio_pct: number
}

interface Props {
  data: Row[]
}

export default function StoreCategoryTable({ data }: Props) {
  // 점포별로 그룹핑
  const storeMap = new Map<string, Row[]>()
  for (const row of data) {
    const key = row.store_name
    if (!storeMap.has(key)) storeMap.set(key, [])
    storeMap.get(key)!.push(row)
  }

  if (storeMap.size === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400 text-sm">
        데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-600">유통사</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">점포</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">카테고리</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">브랜드 수</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">비중</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 w-36">비중 시각화</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(storeMap.entries()).map(([storeName, rows]) =>
            rows.map((row, i) => (
              <tr key={`${storeName}-${row.category_name}-${i}`} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                {i === 0 && (
                  <td
                    className="px-4 py-2.5 text-gray-500 align-top"
                    rowSpan={rows.length}
                  >
                    {row.distributor_name}
                  </td>
                )}
                {i === 0 && (
                  <td
                    className="px-4 py-2.5 font-medium text-gray-800 align-top"
                    rowSpan={rows.length}
                  >
                    {storeName}
                  </td>
                )}
                <td className="px-4 py-2.5 text-gray-700">{row.category_name ?? '미분류'}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{row.brand_count}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-pink-600 font-medium">
                  {row.ratio_pct}%
                </td>
                <td className="px-4 py-2.5">
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-pink-400 h-1.5 rounded-full"
                      style={{ width: `${Math.min(row.ratio_pct, 100)}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
