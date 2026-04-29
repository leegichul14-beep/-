'use client'

import Sidebar from '@/components/Sidebar'
import { DataProvider, useDashboardData } from '@/contexts/DataContext'
import { AlertTriangle, XCircle } from 'lucide-react'

function ErrorBanner() {
  const { error, selectFolder, reset } = useDashboardData()
  if (!error) return null
  return (
    <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-700">데이터를 불러올 수 없습니다</p>
          <pre className="mt-1 text-xs text-red-600 whitespace-pre-wrap leading-relaxed">{error}</pre>
          <div className="mt-4 flex gap-2">
            <button
              onClick={selectFolder}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
            >
              다른 폴더 선택
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs hover:bg-red-100 transition-colors"
            >
              기본 데이터로 복원
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { error } = useDashboardData()
  return (
    <main className="flex-1 overflow-auto">
      <ErrorBanner />
      {!error && <div className="p-6">{children}</div>}
    </main>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div className="flex h-full min-h-screen">
        <Sidebar />
        <MainContent>{children}</MainContent>
      </div>
    </DataProvider>
  )
}
