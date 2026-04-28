import { createClient } from '@/lib/supabase/server'
import PeriodAnalysisClient from '@/components/PeriodAnalysisClient'

export const revalidate = 0

export default async function PeriodPage() {
  const supabase = await createClient()

  const { data: distributors } = await supabase
    .from('distributors')
    .select('name, short_code')
    .order('sort_order')

  const { data: categories } = await supabase
    .from('categories')
    .select('name, color_hex')
    .order('sort_order')

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
