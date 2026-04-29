import StatCard from '@/components/StatCard'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import DistributorBarChart from '@/components/charts/DistributorBarChart'

// TODO: Supabase 연결 후 아래 mock 데이터를 실제 쿼리로 교체
const totalCount  = 39712
const unmappedCount = 7837
const onlineStats = { musinsa: 142, zigzag: 89, cm29: 167, wconcept: 54 }

const distData = [
  { name: '현대',    count: 9823 },
  { name: '롯데',    count: 11204 },
  { name: '신세계',  count: 8941 },
  { name: 'AK',      count: 5312 },
  { name: '갤러리아',count: 4432 },
]

const catData = [
  { name: '영여성',         value: 13542 },
  { name: '여성',           value: 7821 },
  { name: '잡화',           value: 4032 },
  { name: '스포츠/아웃도어',value: 5211 },
  { name: '컨템포러리',     value: 3901 },
  { name: '남성',           value: 2984 },
  { name: '기타',           value: 2221 },
]

export default async function DashboardPage() {

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">전체 현황</h2>
        <p className="text-sm text-gray-500 mt-0.5">전국 오프라인·온라인 입점 컨텐츠 요약</p>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 활성 입점" value={(totalCount ?? 0).toLocaleString('ko-KR')} accent />
        <StatCard label="미매핑 건수" value={(unmappedCount ?? 0).toLocaleString('ko-KR')} sub="보강 필요" />
        <StatCard label="무신사 입점" value={onlineStats.musinsa} sub="브랜드" />
        <StatCard label="29CM 입점"   value={onlineStats.cm29}    sub="브랜드" />
      </div>

      {/* 온라인 채널 바 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '무신사',   val: onlineStats.musinsa,  color: 'bg-indigo-500' },
          { label: '지그재그', val: onlineStats.zigzag,   color: 'bg-purple-500' },
          { label: '29CM',     val: onlineStats.cm29,     color: 'bg-rose-500' },
          { label: 'W컨셉',   val: onlineStats.wconcept, color: 'bg-teal-500' },
        ].map(({ label, val, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={`w-8 h-1.5 rounded-full ${color} mb-3`} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900">{val}개</p>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">유통사별 입점 수</h3>
          <DistributorBarChart data={distData} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">카테고리 비중</h3>
          <CategoryPieChart data={catData} />
        </div>
      </div>
    </div>
  )
}
