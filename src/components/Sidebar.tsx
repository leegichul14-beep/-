'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Tag,
  BarChart2,
  ShoppingBag,
  Upload,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard',          label: '전체 현황',    icon: LayoutDashboard },
  { href: '/dashboard/stores',   label: '점포별 분석',  icon: Store },
  { href: '/dashboard/brands',   label: '브랜드 검색',  icon: Tag },
  { href: '/dashboard/period',   label: '기간별 분석',  icon: BarChart2 },
  { href: '/dashboard/online',   label: '온라인 채널',  icon: ShoppingBag },
  { href: '/dashboard/upload',   label: '데이터 업로드',icon: Upload },
]

export default function Sidebar() {
  const pathname = usePathname()
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

      {/* 하단 */}
      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">여성부문 MD 대시보드</p>
      </div>
    </aside>
  )
}
