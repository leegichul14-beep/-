'use client'

import { useState } from 'react'
import { TrendingUp, Award, Tag, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── 타입 ──────────────────────────────────────────────────────────

interface BestItem {
  date: string
  category: string
  rank: number
  brand: string
  product_name: string
  price: number
  review_count: number
}

// ── 정적 데이터 ───────────────────────────────────────────────────

const BEST_DATA: BestItem[] = [
  // 2025-10
  { date:'2025-10', category:'여성의류',        rank:1,  brand:'마르디 메크르디',  product_name:'플라워 패턴 울 니트 스웨터',   price:129000, review_count:1842 },
  { date:'2025-10', category:'여성의류',        rank:2,  brand:'앤더슨벨',         product_name:'비대칭 헴 롱 코트',            price:289000, review_count:934  },
  { date:'2025-10', category:'여성의류',        rank:3,  brand:'마가린핑거스',     product_name:'오버핏 체크 셔츠',             price:89000,  review_count:2103 },
  { date:'2025-10', category:'여성의류',        rank:4,  brand:'로맨틱크라운',     product_name:'울 혼방 카디건',               price:109000, review_count:1567 },
  { date:'2025-10', category:'여성의류',        rank:5,  brand:'러브이즈트루',     product_name:'레이스 트리밍 블라우스',        price:79000,  review_count:1230 },
  { date:'2025-10', category:'여성의류',        rank:6,  brand:'마르디 메크르디',  product_name:'플리츠 미디 스커트',           price:98000,  review_count:1102 },
  { date:'2025-10', category:'여성의류',        rank:7,  brand:'보이런던',         product_name:'오버사이즈 후드 집업',          price:129000, review_count:876  },
  { date:'2025-10', category:'여성의류',        rank:8,  brand:'앤더슨벨',         product_name:'스퀘어넥 미니 드레스',          price:159000, review_count:743  },
  { date:'2025-10', category:'여성의류',        rank:9,  brand:'에이카화이트',     product_name:'데님 와이드 팬츠',             price:98000,  review_count:1987 },
  { date:'2025-10', category:'여성의류',        rank:10, brand:'마가린핑거스',     product_name:'크롭 트위드 재킷',             price:149000, review_count:654  },
  { date:'2025-10', category:'여성의류',        rank:11, brand:'로맨틱크라운',     product_name:'벨벳 슬립 드레스',             price:89000,  review_count:1345 },
  { date:'2025-10', category:'여성의류',        rank:12, brand:'더 아이덴티티',    product_name:'울 펜슬 스커트',               price:119000, review_count:567  },
  { date:'2025-10', category:'여성의류',        rank:13, brand:'유저',             product_name:'코튼 터틀넥 니트',             price:69000,  review_count:2341 },
  { date:'2025-10', category:'여성의류',        rank:14, brand:'마르디 메크르디',  product_name:'플라워 롱 원피스',             price:168000, review_count:876  },
  { date:'2025-10', category:'여성의류',        rank:15, brand:'러브이즈트루',     product_name:'퍼프 슬리브 미니 원피스',      price:98000,  review_count:1102 },
  { date:'2025-10', category:'여성잡화',        rank:1,  brand:'마르디 메크르디',  product_name:'플라워 숄더백',                price:198000, review_count:743  },
  { date:'2025-10', category:'여성잡화',        rank:2,  brand:'마리뗌므',         product_name:'레더 토트백',                  price:289000, review_count:534  },
  { date:'2025-10', category:'여성잡화',        rank:3,  brand:'조이그라이슨',     product_name:'퀼팅 크로스백',                price:178000, review_count:876  },
  { date:'2025-10', category:'여성잡화',        rank:4,  brand:'언어패런트',       product_name:'미니 버킷백',                  price:158000, review_count:654  },
  { date:'2025-10', category:'여성잡화',        rank:5,  brand:'마르디 메크르디',  product_name:'플라워 카드지갑',              price:58000,  review_count:1234 },
  { date:'2025-10', category:'여성잡화',        rank:6,  brand:'마리뗌므',         product_name:'스퀘어 클러치',                price:128000, review_count:432  },
  { date:'2025-10', category:'여성잡화',        rank:7,  brand:'포스티',           product_name:'첼시 앵클부츠',                price:198000, review_count:987  },
  { date:'2025-10', category:'여성잡화',        rank:8,  brand:'슈콤마보니',       product_name:'메리제인 플랫슈즈',            price:149000, review_count:765  },
  { date:'2025-10', category:'여성잡화',        rank:9,  brand:'조이그라이슨',     product_name:'메탈 체인 숄더백',             price:238000, review_count:543  },
  { date:'2025-10', category:'여성잡화',        rank:10, brand:'언어패런트',       product_name:'레더 벨트',                    price:68000,  review_count:432  },
  { date:'2025-10', category:'남성의류',        rank:1,  brand:'커버낫',           product_name:'헤비 웨이트 후드티',           price:119000, review_count:2341 },
  { date:'2025-10', category:'남성의류',        rank:2,  brand:'마르디 메크르디',  product_name:'플라워 크루넥 니트',           price:129000, review_count:1234 },
  { date:'2025-10', category:'남성의류',        rank:3,  brand:'디스이즈네버댓',  product_name:'오버사이즈 코치 재킷',          price:189000, review_count:987  },
  { date:'2025-10', category:'남성의류',        rank:4,  brand:'아더에러',         product_name:'패널 스웨트셔츠',              price:148000, review_count:876  },
  { date:'2025-10', category:'남성의류',        rank:5,  brand:'커버낫',           product_name:'울 체크 코트',                 price:289000, review_count:765  },
  { date:'2025-10', category:'스포츠/아웃도어', rank:1,  brand:'뉴발란스',         product_name:'990v6 스니커즈',               price:229000, review_count:2103 },
  { date:'2025-10', category:'스포츠/아웃도어', rank:2,  brand:'아디다스',         product_name:'삼바 OG',                      price:139000, review_count:3456 },
  { date:'2025-10', category:'스포츠/아웃도어', rank:3,  brand:'나이키',           product_name:'에어포스 1',                   price:139000, review_count:2987 },
  { date:'2025-10', category:'스포츠/아웃도어', rank:4,  brand:'뉴발란스',         product_name:'530 스니커즈',                 price:129000, review_count:1876 },
  { date:'2025-10', category:'스포츠/아웃도어', rank:5,  brand:'아식스',           product_name:'겔-카야노 14',                 price:159000, review_count:1543 },
  { date:'2025-10', category:'라이프스타일',    rank:1,  brand:'아이디얼웍스',     product_name:'원목 사이드 테이블',           price:189000, review_count:543  },
  { date:'2025-10', category:'라이프스타일',    rank:2,  brand:'무지',             product_name:'스탠드 조명',                  price:98000,  review_count:876  },
  { date:'2025-10', category:'라이프스타일',    rank:3,  brand:'아이디얼웍스',     product_name:'패브릭 소파 쿠션',             price:68000,  review_count:1234 },
  { date:'2025-10', category:'라이프스타일',    rank:4,  brand:'르쿠르제',         product_name:'코코트 냄비 20cm',             price:398000, review_count:432  },
  { date:'2025-10', category:'라이프스타일',    rank:5,  brand:'빌레로이앤보흐',   product_name:'시리얼볼 세트',                price:128000, review_count:654  },

  // 2025-11
  { date:'2025-11', category:'여성의류',        rank:1,  brand:'마르디 메크르디',  product_name:'플라워 울 코트',               price:298000, review_count:2103 },
  { date:'2025-11', category:'여성의류',        rank:2,  brand:'앤더슨벨',         product_name:'패딩 점퍼',                    price:389000, review_count:1234 },
  { date:'2025-11', category:'여성의류',        rank:3,  brand:'로맨틱크라운',     product_name:'울 혼방 니트 가디건',          price:129000, review_count:1876 },
  { date:'2025-11', category:'여성의류',        rank:4,  brand:'마가린핑거스',     product_name:'체크 롱 스커트',               price:108000, review_count:987  },
  { date:'2025-11', category:'여성의류',        rank:5,  brand:'러브이즈트루',     product_name:'벨벳 슬립 원피스',             price:98000,  review_count:876  },
  { date:'2025-11', category:'여성의류',        rank:6,  brand:'더 아이덴티티',    product_name:'캐시미어 터틀넥',              price:198000, review_count:765  },
  { date:'2025-11', category:'여성의류',        rank:7,  brand:'유저',             product_name:'헤비 울 가디건',               price:148000, review_count:1543 },
  { date:'2025-11', category:'여성의류',        rank:8,  brand:'마르디 메크르디',  product_name:'플라워 패턴 맥시 스커트',      price:119000, review_count:1102 },
  { date:'2025-11', category:'여성의류',        rank:9,  brand:'에이카화이트',     product_name:'와이드 슬랙스',                price:108000, review_count:1345 },
  { date:'2025-11', category:'여성의류',        rank:10, brand:'보이런던',         product_name:'후드 패딩 베스트',             price:168000, review_count:654  },
  { date:'2025-11', category:'여성의류',        rank:11, brand:'앤더슨벨',         product_name:'울 체크 미니 스커트',          price:128000, review_count:876  },
  { date:'2025-11', category:'여성의류',        rank:12, brand:'로맨틱크라운',     product_name:'벨벳 미디 드레스',             price:138000, review_count:543  },
  { date:'2025-11', category:'여성의류',        rank:13, brand:'마가린핑거스',     product_name:'니트 베스트',                  price:89000,  review_count:1987 },
  { date:'2025-11', category:'여성의류',        rank:14, brand:'러브이즈트루',     product_name:'레이스 카디건',                price:109000, review_count:765  },
  { date:'2025-11', category:'여성의류',        rank:15, brand:'더 아이덴티티',    product_name:'캐시미어 롱 코트',             price:458000, review_count:432  },
  { date:'2025-11', category:'여성잡화',        rank:1,  brand:'마르디 메크르디',  product_name:'플라워 버킷햇',                price:68000,  review_count:1456 },
  { date:'2025-11', category:'여성잡화',        rank:2,  brand:'마리뗌므',         product_name:'레더 숄더백',                  price:298000, review_count:654  },
  { date:'2025-11', category:'여성잡화',        rank:3,  brand:'조이그라이슨',     product_name:'양털 크로스백',                price:198000, review_count:543  },
  { date:'2025-11', category:'여성잡화',        rank:4,  brand:'슈콤마보니',       product_name:'첼시 부츠',                    price:228000, review_count:987  },
  { date:'2025-11', category:'여성잡화',        rank:5,  brand:'포스티',           product_name:'레더 로퍼',                    price:198000, review_count:876  },
  { date:'2025-11', category:'여성잡화',        rank:6,  brand:'마르디 메크르디',  product_name:'플라워 미니 토트백',           price:158000, review_count:765  },
  { date:'2025-11', category:'여성잡화',        rank:7,  brand:'언어패런트',       product_name:'퀼팅 체인백',                  price:238000, review_count:543  },
  { date:'2025-11', category:'여성잡화',        rank:8,  brand:'조이그라이슨',     product_name:'새들백',                       price:268000, review_count:432  },
  { date:'2025-11', category:'여성잡화',        rank:9,  brand:'슈콤마보니',       product_name:'스틸레토 펌프스',              price:188000, review_count:654  },
  { date:'2025-11', category:'여성잡화',        rank:10, brand:'마리뗌므',         product_name:'숄 스카프',                    price:128000, review_count:765  },
  { date:'2025-11', category:'남성의류',        rank:1,  brand:'커버낫',           product_name:'헤비 울 코트',                 price:398000, review_count:1876 },
  { date:'2025-11', category:'남성의류',        rank:2,  brand:'아더에러',         product_name:'크루넥 니트',                  price:168000, review_count:1543 },
  { date:'2025-11', category:'남성의류',        rank:3,  brand:'디스이즈네버댓',  product_name:'다운 패딩 점퍼',               price:459000, review_count:1234 },
  { date:'2025-11', category:'남성의류',        rank:4,  brand:'마르디 메크르디',  product_name:'플라워 맨투맨',                price:118000, review_count:1102 },
  { date:'2025-11', category:'남성의류',        rank:5,  brand:'노이지',           product_name:'헤비 스웨트셔츠',              price:128000, review_count:987  },
  { date:'2025-11', category:'스포츠/아웃도어', rank:1,  brand:'뉴발란스',         product_name:'993 스니커즈',                 price:249000, review_count:1987 },
  { date:'2025-11', category:'스포츠/아웃도어', rank:2,  brand:'나이키',           product_name:'에어맥스 90',                  price:169000, review_count:2341 },
  { date:'2025-11', category:'스포츠/아웃도어', rank:3,  brand:'아디다스',         product_name:'삼바 OG',                      price:139000, review_count:3012 },
  { date:'2025-11', category:'스포츠/아웃도어', rank:4,  brand:'뉴발란스',         product_name:'1906R',                        price:179000, review_count:1654 },
  { date:'2025-11', category:'스포츠/아웃도어', rank:5,  brand:'아식스',           product_name:'겔-님버스 26',                 price:189000, review_count:1234 },
  { date:'2025-11', category:'라이프스타일',    rank:1,  brand:'아이디얼웍스',     product_name:'원목 책장',                    price:398000, review_count:432  },
  { date:'2025-11', category:'라이프스타일',    rank:2,  brand:'이케아',           product_name:'스탁 선반 세트',               price:198000, review_count:654  },
  { date:'2025-11', category:'라이프스타일',    rank:3,  brand:'르쿠르제',         product_name:'코코트 냄비 24cm',             price:498000, review_count:543  },
  { date:'2025-11', category:'라이프스타일',    rank:4,  brand:'아이디얼웍스',     product_name:'패브릭 암체어',                price:598000, review_count:321  },
  { date:'2025-11', category:'라이프스타일',    rank:5,  brand:'무지',             product_name:'LED 간접 조명',                price:128000, review_count:765  },
]

const MONTHS = ['2025-11', '2025-10']

// ── 카테고리 색상 ─────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  '여성의류':        'bg-rose-50 text-rose-700 border-rose-200',
  '여성잡화':        'bg-pink-50 text-pink-700 border-pink-200',
  '남성의류':        'bg-blue-50 text-blue-700 border-blue-200',
  '스포츠/아웃도어': 'bg-green-50 text-green-700 border-green-200',
  '라이프스타일':    'bg-amber-50 text-amber-700 border-amber-200',
}

const RANK_BADGE: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-700',
  3: 'bg-amber-600 text-white',
}

const CATEGORIES = ['전체', '여성의류', '여성잡화', '남성의류', '스포츠/아웃도어', '라이프스타일']

// ── 컴포넌트 ──────────────────────────────────────────────────────

export default function TrendClient() {
  const [selectedMonth, setMonth] = useState('2025-11')
  const [selectedCat, setCat]     = useState('전체')

  const filtered = BEST_DATA.filter(r =>
    r.date === selectedMonth &&
    (selectedCat === '전체' || r.category === selectedCat)
  )

  // 브랜드별 등장 횟수
  const brandCount = filtered.reduce<Record<string, number>>((acc, r) => {
    acc[r.brand] = (acc[r.brand] ?? 0) + 1
    return acc
  }, {})
  const topBrands = Object.entries(brandCount).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // 카테고리별 평균 가격
  const avgPriceBycat = Object.entries(
    filtered.reduce<Record<string, number[]>>((acc, r) => {
      acc[r.category] = acc[r.category] ?? []
      acc[r.category].push(r.price)
      return acc
    }, {})
  ).map(([cat, prices]) => ({
    cat,
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  })).sort((a, b) => b.avg - a.avg)
  const maxAvg = Math.max(...avgPriceBycat.map(d => d.avg), 1)

  // 월별 TOP5 브랜드
  const brandTrend = MONTHS.map(m => {
    const bc = BEST_DATA
      .filter(r => r.date === m)
      .reduce<Record<string, number>>((acc, r) => { acc[r.brand] = (acc[r.brand] ?? 0) + 1; return acc }, {})
    return { month: m, brands: Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 5) }
  })

  const priceItems = filtered.filter(r => r.price > 0)
  const avgPrice = priceItems.length > 0
    ? priceItems.reduce((a, b) => a + b.price, 0) / priceItems.length
    : 0

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp size={20} className="text-rose-500" />
          온라인 트렌드 — 29CM 베스트
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">29CM 카테고리별 월간 베스트 아이템 분석</p>
      </div>

      {/* 월 / 카테고리 필터 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1.5">
          {MONTHS.map(m => (
            <button key={m} onClick={() => setMonth(m)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                selectedMonth === m
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
              )}>
              {m}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCat(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                selectedCat === cat
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              )}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400 font-medium">수집 상품</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{filtered.length}<span className="text-sm font-normal text-gray-400 ml-1">개</span></p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400 font-medium">등장 브랜드</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">{Object.keys(brandCount).length}<span className="text-sm font-normal text-gray-400 ml-1">개</span></p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400 font-medium">평균 가격</p>
          <p className="mt-1 text-2xl font-bold text-gray-800">
            {Math.round(avgPrice / 1000)}<span className="text-sm font-normal text-gray-400 ml-1">천원</span>
          </p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <p className="text-xs text-gray-400 font-medium">1위 브랜드</p>
          <p className="mt-1 text-lg font-bold text-rose-600 truncate">{topBrands[0]?.[0] ?? '-'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 베스트 아이템 테이블 */}
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Award size={15} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-700">
              {selectedMonth} 베스트 아이템 ({filtered.length}개)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50 text-left">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 w-10">순위</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">카테고리</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">브랜드</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500">상품명</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">가격</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-right">리뷰</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                        RANK_BADGE[item.rank] ?? 'bg-gray-100 text-gray-500'
                      )}>{item.rank}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded text-xs font-medium border',
                        CAT_COLORS[item.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                      )}>{item.category}</span>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{item.brand}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs max-w-[200px] truncate">{item.product_name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-700 text-xs">{item.price.toLocaleString()}원</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-gray-400 text-xs">{item.review_count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 브랜드 점유율 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag size={15} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-700">브랜드 베스트 집중도</h3>
          </div>
          <div className="space-y-3">
            {topBrands.map(([brand, cnt], i) => (
              <div key={brand}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{i + 1}. {brand}</span>
                  <span className="text-gray-400">{cnt}개 상품</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-rose-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${(cnt / (topBrands[0]?.[1] ?? 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리별 평균 가격 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-700">카테고리별 평균 가격</h3>
          </div>
          <div className="space-y-3">
            {avgPriceBycat.map(({ cat, avg }) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-gray-700">{cat}</span>
                  <span className="text-gray-600 tabular-nums">{avg.toLocaleString()}원</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${(avg / maxAvg) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 TOP5 브랜드 추이 */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-rose-500" />
            <h3 className="text-sm font-semibold text-gray-700">월별 TOP5 브랜드 추이</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 pr-6 text-left font-semibold text-gray-500">월</th>
                  {[1,2,3,4,5].map(n => (
                    <th key={n} className="pb-2 px-4 text-center font-semibold text-gray-400">TOP {n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandTrend.map(({ month, brands }) => (
                  <tr key={month} className="border-b border-gray-50">
                    <td className="py-2.5 pr-6 font-semibold text-gray-700">{month}</td>
                    {brands.map(([brand, cnt], i) => (
                      <td key={i} className="py-2.5 px-4 text-center">
                        <span className="font-medium text-gray-700">{brand}</span>
                        <span className="text-gray-400 ml-1">({cnt})</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
