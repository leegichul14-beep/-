export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">데이터 업로드</h2>
        <p className="text-sm text-gray-500 mt-0.5">엑셀 파일을 업로드해 입점 데이터를 일괄 등록합니다 (리더 전용)</p>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-16 text-center">
        <p className="text-gray-400 text-sm">엑셀 업로드 기능은 다음 단계에서 구현됩니다.</p>
        <p className="text-gray-300 text-xs mt-1">xlsx → Supabase 일괄 upsert</p>
      </div>
    </div>
  )
}
