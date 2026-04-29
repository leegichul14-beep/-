import BrandSearchClient from '@/components/BrandSearchClient'

// TODO: Supabase 연결 후 실제 쿼리로 교체
const MOCK_CATEGORIES = [
  { id: '1', name: '영여성',         color_hex: '#EC4899' },
  { id: '2', name: '여성',           color_hex: '#F97316' },
  { id: '3', name: '컨템포러리',     color_hex: '#8B5CF6' },
  { id: '4', name: '잡화',           color_hex: '#06B6D4' },
  { id: '5', name: '스포츠/아웃도어',color_hex: '#10B981' },
  { id: '6', name: '남성',           color_hex: '#3B82F6' },
]

export default async function BrandsPage() {
  const categories = MOCK_CATEGORIES

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">브랜드 검색</h2>
        <p className="text-sm text-gray-500 mt-0.5">브랜드명·카테고리로 검색하고 온라인 채널 입점 현황을 확인합니다</p>
      </div>
      <BrandSearchClient categories={categories ?? []} />
    </div>
  )
}
