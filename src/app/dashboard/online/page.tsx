// 온라인 채널 데이터: Supabase 연결 전 임시 (실제 브랜드 조사 필요)
// 현재 오프라인 입점 카테고리 분포 기반으로 추정
const MOCK_CROSS = [
  { category: '영여성',         total: 6639, musinsa: 312, zigzag: 198, cm29: 287, wconcept: 134 },
  { category: '잡화',           total: 6487, musinsa: 142, zigzag: 89,  cm29: 167, wconcept: 54  },
  { category: '스포츠/아웃도어',total: 3033, musinsa: 198, zigzag: 145, cm29: 178, wconcept: 67  },
  { category: '아동',           total: 2823, musinsa: 87,  zigzag: 143, cm29: 96,  wconcept: 31  },
  { category: '남성',           total: 2508, musinsa: 156, zigzag: 98,  cm29: 134, wconcept: 48  },
  { category: '캐주얼',         total: 2284, musinsa: 234, zigzag: 187, cm29: 198, wconcept: 89  },
  { category: '골프',           total: 1534, musinsa: 43,  zigzag: 28,  cm29: 56,  wconcept: 19  },
]

const CHANNELS = [
  { key: 'on_musinsa',  label: '무신사',   color: 'text-indigo-600 bg-indigo-50',  bar: 'bg-indigo-400' },
  { key: 'on_zigzag',   label: '지그재그', color: 'text-purple-600 bg-purple-50',  bar: 'bg-purple-400' },
  { key: 'on_29cm',     label: '29CM',     color: 'text-rose-600 bg-rose-50',      bar: 'bg-rose-400' },
  { key: 'on_wconcept', label: 'W컨셉',   color: 'text-teal-600 bg-teal-50',      bar: 'bg-teal-400' },
] as const

export default async function OnlinePage() {
  const crossTable = MOCK_CROSS
  const total = crossTable.reduce((s, r) => s + r.total, 0)

  const channelStats = CHANNELS.map(ch => ({
    ...ch,
    count: crossTable.reduce((s, r) => s + (r[ch.key as keyof typeof r] as number), 0),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">온라인 채널 현황</h2>
        <p className="text-sm text-gray-500 mt-0.5">무신사·지그재그·29CM·W컨셉 입점 현황 분석</p>
      </div>

      {/* 채널별 KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {channelStats.map(ch => (
          <div key={ch.key} className={`rounded-xl border p-5 ${ch.color} border-transparent`}>
            <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{ch.label}</p>
            <p className="mt-1 text-2xl font-bold">{ch.count}</p>
            <div className="mt-2 w-full bg-white/40 rounded-full h-1.5">
              <div
                className={`${ch.bar} h-1.5 rounded-full`}
                style={{ width: `${(ch.count / total) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs opacity-60">전체 {((ch.count / total) * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>

      {/* 카테고리 × 채널 교차표 */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">카테고리 × 채널 교차 현황</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">카테고리</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">전체</th>
              <th className="px-4 py-3 font-semibold text-indigo-600 text-right">무신사</th>
              <th className="px-4 py-3 font-semibold text-purple-600 text-right">지그재그</th>
              <th className="px-4 py-3 font-semibold text-rose-600 text-right">29CM</th>
              <th className="px-4 py-3 font-semibold text-teal-600 text-right">W컨셉</th>
            </tr>
          </thead>
          <tbody>
            {crossTable.map(row => (
              <tr key={row.category} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-gray-800">{row.category}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-gray-600">{row.total}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-indigo-600">
                  {row.musinsa} <span className="text-gray-400 text-xs">({row.total > 0 ? ((row.musinsa/row.total)*100).toFixed(0) : 0}%)</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-purple-600">
                  {row.zigzag} <span className="text-gray-400 text-xs">({row.total > 0 ? ((row.zigzag/row.total)*100).toFixed(0) : 0}%)</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-rose-600">
                  {row.cm29} <span className="text-gray-400 text-xs">({row.total > 0 ? ((row.cm29/row.total)*100).toFixed(0) : 0}%)</span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums text-teal-600">
                  {row.wconcept} <span className="text-gray-400 text-xs">({row.total > 0 ? ((row.wconcept/row.total)*100).toFixed(0) : 0}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
