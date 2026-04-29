'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, Tag, BarChart2,
  ShoppingBag, Upload, FolderOpen, RotateCcw, Loader2, CheckCircle2, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDashboardData } from '@/contexts/DataContext'

const nav = [
  { href: '/dashboard',          label: '전체 현황',    icon: LayoutDashboard },
  { href: '/dashboard/stores',   label: '점포별 분석',  icon: Store },
  { href: '/dashboard/group13',  label: '13그룹 분석',  icon: Layers },
  { href: '/dashboard/brands',   label: '브랜드 검색',  icon: Tag },
  { href: '/dashboard/period',   label: '기간별 분석',  icon: BarChart2 },
  { href: '/dashboard/online',   label: '온라인 채널',  icon: ShoppingBag },
  { href: '/dashboard/upload',   label: '데이터 업로드',icon: Upload },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { folderName, loading, error, selectFolder, reset } = useDashboardData()

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white flex flex-col">
      {/* 로고 */}
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-xs font-semibold text-pink-500 tracking-widest uppercase">E-Land Retail</p>
        <h1 className="mt-0.5 text-sm font-bold text-gray-800 leading-tight">
          컨텐츠<br />대시보드
        </h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-pink-50 text-pink-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 데이터 소스 패널 */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2">데이터 소스</p>

        {/* 현재 소스 표시 */}
        <div className={cn(
          'rounded-lg px-3 py-2 text-xs',
          folderName
            ? 'bg-emerald-50 border border-emerald-200'
            : error
              ? 'bg-red-50 border border-red-200'
              : 'bg-gray-50 border border-gray-200'
        )}>
          {loading ? (
            <span className="flex items-center gap-1.5 text-gray-500">
              <Loader2 size={12} className="animate-spin" /> 파일 읽는 중...
            </span>
          ) : folderName ? (
            <span className="flex items-start gap-1.5 text-emerald-700">
              <CheckCircle2 size={12} className="mt-0.5 shrink-0" />
              <span className="break-all leading-tight">{folderName}</span>
            </span>
          ) : error ? (
            <span className="text-red-600 leading-tight break-words">오류 발생</span>
          ) : (
            <span className="text-gray-400">기본 데이터 (v10)</span>
          )}
        </div>

        {/* 폴더 선택 버튼 */}
        <button
          onClick={selectFolder}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-pink-500 text-white text-xs font-medium hover:bg-pink-600 disabled:opacity-50 transition-colors"
        >
          {loading
            ? <><Loader2 size={12} className="animate-spin" /> 처리 중...</>
            : <><FolderOpen size={12} /> 폴더 선택</>
          }
        </button>

        {/* 기본 데이터로 초기화 */}
        {folderName && (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors"
          >
            <RotateCcw size={11} /> 기본 데이터로
          </button>
        )}
      </div>

      {/* 하단 */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">여성부문 MD 대시보드</p>
      </div>
    </aside>
  )
}
