import PeriodAnalysisClient from '@/components/PeriodAnalysisClient'

// TODO: Supabase 연결 후 실제 쿼리로 교체
const MOCK_DISTRIBUTORS = [
  { name: '현대', short_code: 'HY' },
  { name: '롯데', short_code: 'LT' },
  { name: '신세계', short_code: 'SS' },
  { name: 'AK', short_code: 'AK' },
  { name: '갤러리아', short_code: 'GA' },
]

const MOCK_CATEGORIES = [
  { name: '영여성',         color_hex: '#EC4899' },
  { name: '여성',           color_hex: '#F97316' },
  { name: '컨템포러리',     color_hex: '#8B5CF6' },
  { name: '잡화',           color_hex: '#06B6D4' },
  { name: '스포츠/아웃도어',color_hex: '#10B981' },
  { name: '남성',           color_hex: '#3B82F6' },
]

export default async function PeriodPage() {
  const distributors = MOCK_DISTRIBUTORS
  const categories   = MOCK_CATEGORIES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">기간별 분석</h2>
        <p className="text-sm text-gray-500 mt-0.5">입점 기간을 지정해 컨텐츠 변화를 비교합니다</p>
      </div>
      <PeriodAnalysisClient
        distributors={distributors ?? []}
        categories={categories ?? []}
      />
    </div>
  )
}
