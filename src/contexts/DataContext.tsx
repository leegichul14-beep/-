'use client'

import {
  createContext, useContext, useState, useCallback, ReactNode,
} from 'react'
import defaultData from '@/data/dashboard-data.json'

// ── 타입 정의 ────────────────────────────────────────────
export interface DistSummary {
  name: string; total: number; mapped: number; unmapped: number
  storeCount: number; mappedPct: number
}
export interface StoreRatioRow {
  distributor_name: string; store_name: string
  category_name: string; brand_count: number; ratio_pct: number
}
export interface CrossRow {
  major: string; total: number; [dist: string]: number | string
}
export interface DashboardData {
  meta: {
    totalRecords: number; mappedRecords: number; unmappedRecords: number
    totalStores: number; totalBrands: number; generatedAt: string; folderName?: string
  }
  distSummary:   DistSummary[]
  majorData:     { name: string; count: number }[]
  crossTable:    CrossRow[]
  storeRatioData: StoreRatioRow[]
  minorData:     { major: string; minor: string; count: number }[]
  group13Data:   { name: string; count: number }[]
  gradeMap:      Record<string, number>
}

interface DataContextValue {
  data:        DashboardData
  folderName:  string | null
  error:       string | null
  loading:     boolean
  selectFolder: () => Promise<void>
  reset:       () => void
}

// ── Context ───────────────────────────────────────────────
const DataContext = createContext<DataContextValue | null>(null)

export function useDashboardData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useDashboardData must be used within DataProvider')
  return ctx
}

// ── 컬럼 인덱스 (6사 통합 포맷) ──────────────────────────
const COL = { 점포: 2, 브랜드: 5, 매핑: 6, 대분류: 7, 중분류: 8, 그룹13: 9, 등급: 10, 자사: 11 }

// ── Excel 시트 → 레코드 배열 변환 ────────────────────────
function parseSheet(
  rows: unknown[][],
  distName: string,
): null | { store: string; brand: string; major: string; minor: string; group13: string; grade: string; mapped: boolean }[] {
  // 헤더 행 탐색: 브랜드명 / 점포 포함된 행
  let headerIdx = -1
  let brandCol = -1, storeCol = -1, majorCol = -1, minorCol = -1, group13Col = -1, gradeCol = -1, mappedCol = -1

  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const r = rows[i].map(v => String(v || '').trim())
    const bi = r.findIndex(v => v === '브랜드명' || v === '브랜드')
    const si = r.findIndex(v => v === '점포')
    const mi = r.findIndex(v => v === '대분류')
    if (bi >= 0 && si >= 0 && mi >= 0) {
      headerIdx = i
      brandCol   = bi
      storeCol   = si
      majorCol   = mi
      minorCol   = r.findIndex(v => v.startsWith('중분류'))
      group13Col = r.findIndex(v => v === '13그룹' || v.includes('그룹'))
      gradeCol   = r.findIndex(v => v === '등급')
      mappedCol  = r.findIndex(v => v === '매핑여부')
      break
    }
  }

  // 헤더를 못 찾으면 6사 고정 컬럼 시도
  if (headerIdx < 0) {
    // row[1]이 헤더인 포맷 (row[0]=제목, row[1]=컬럼명)
    if (rows.length > 1) {
      const r = rows[1].map(v => String(v || '').trim())
      if (r[COL.브랜드] === '브랜드명' && r[COL.점포] === '점포') {
        headerIdx  = 1
        storeCol   = COL.점포
        brandCol   = COL.브랜드
        mappedCol  = COL.매핑
        majorCol   = COL.대분류
        minorCol   = COL.중분류
        group13Col = COL.그룹13
        gradeCol   = COL.등급
      }
    }
  }

  if (headerIdx < 0 || brandCol < 0 || storeCol < 0 || majorCol < 0) return null

  const records = []
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i]
    const brand  = String(r[brandCol]   || '').trim()
    const store  = String(r[storeCol]   || '').trim()
    const major  = String(r[majorCol]   || '').trim()
    if (!brand || !store) continue

    records.push({
      store,
      brand,
      major,
      minor:   String(r[minorCol]   || '').trim(),
      group13: String(r[group13Col] || '').trim(),
      grade:   String(r[gradeCol]   || '').trim(),
      mapped:  mappedCol >= 0 ? String(r[mappedCol] || '').includes('⭕') : true,
    })
  }
  return records
}

// ── 폴더 → DashboardData 변환 ────────────────────────────
async function parseFolderToDashboard(
  dirHandle: FileSystemDirectoryHandle,
): Promise<DashboardData> {
  // xlsx 동적 import (클라이언트 번들 최적화)
  const XLSX = await import('xlsx')

  type RawRecord = { distName: string; store: string; brand: string; major: string; minor: string; group13: string; grade: string; mapped: boolean }
  const allRecords: RawRecord[] = []

  // 폴더 내 xlsx 파일 수집
  const xlsxFiles: [string, FileSystemFileHandle][] = []
  for await (const [name, handle] of (dirHandle as any).entries()) {
    if (handle.kind === 'file' && name.toLowerCase().endsWith('.xlsx') && !name.startsWith('~$')) {
      xlsxFiles.push([name, handle as FileSystemFileHandle])
    }
  }

  if (xlsxFiles.length === 0) {
    throw new Error('선택한 폴더에 Excel(.xlsx) 파일이 없습니다.\n지원 파일: 6사 통합 포맷 또는 브랜드명·점포·대분류 컬럼이 있는 Excel')
  }

  let parsedAny = false

  for (const [fileName, fileHandle] of xlsxFiles) {
    let wb: ReturnType<typeof XLSX.read>
    try {
      const file   = await fileHandle.getFile()
      const buffer = await file.arrayBuffer()
      wb = XLSX.read(buffer)
    } catch {
      continue // 읽기 실패한 파일은 건너뜀
    }

    // 6사 통합 포맷: 시트 이름에 순번_유통사명 패턴
    const DIST_SHEET_RE = /^(\d+)_(.+)/
    const distSheets = wb.SheetNames.filter(n => DIST_SHEET_RE.test(n))

    if (distSheets.length > 0) {
      // 6사 통합 포맷
      for (const sheetName of distSheets) {
        const match = sheetName.match(DIST_SHEET_RE)
        const distName = match ? match[2] : sheetName
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '', header: 1 }) as unknown[][]
        const records = parseSheet(rows, distName)
        if (records) {
          records.forEach(r => allRecords.push({ distName, ...r }))
          parsedAny = true
        }
      }
    } else {
      // 단일/다중 시트 포맷 (모든 시트 시도)
      for (const sheetName of wb.SheetNames) {
        if (sheetName.startsWith('0_') || sheetName.includes('요약') || sheetName.includes('미매핑')) continue
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '', header: 1 }) as unknown[][]
        // 파일명에서 유통사명 추출
        const distName = fileName.replace(/\.xlsx$/i, '').replace(/^\d+_/, '')
        const records = parseSheet(rows, distName)
        if (records && records.length > 0) {
          records.forEach(r => allRecords.push({ distName, ...r }))
          parsedAny = true
        }
      }
    }
  }

  if (!parsedAny || allRecords.length === 0) {
    throw new Error(
      'Excel 파일의 형식이 올바르지 않습니다.\n\n필수 컬럼: 브랜드명, 점포, 대분류\n' +
      '또는 6사 통합 포맷(시트명: 1_현대백화점 등)을 사용해 주세요.'
    )
  }

  // ── 집계 ────────────────────────────────────────────────
  const distMap: Record<string, { total: number; mapped: number; stores: Set<string> }> = {}
  const majorMap: Record<string, number> = {}
  const minorMap: Record<string, { major: string; minor: string; count: number }> = {}
  const group13Map: Record<string, number> = {}
  const gradeMap: Record<string, number> = {}
  const storeMap: Record<string, { distName: string; store: string; total: number; byMajor: Record<string, number> }> = {}
  const crossMap: Record<string, Record<string, number>> = {}

  for (const r of allRecords) {
    // 유통사별
    if (!distMap[r.distName]) distMap[r.distName] = { total: 0, mapped: 0, stores: new Set() }
    distMap[r.distName].total++
    if (r.mapped) distMap[r.distName].mapped++
    distMap[r.distName].stores.add(r.store)

    if (!r.mapped) continue

    // 대분류별
    const major = r.major || '미분류'
    majorMap[major] = (majorMap[major] || 0) + 1

    // 중분류
    const mk = `${major}__${r.minor}`
    if (!minorMap[mk]) minorMap[mk] = { major, minor: r.minor, count: 0 }
    minorMap[mk].count++

    // 13그룹
    const g = r.group13 || '미분류'
    group13Map[g] = (group13Map[g] || 0) + 1

    // 등급
    const grade = (r.grade || '-').trim()
    gradeMap[grade] = (gradeMap[grade] || 0) + 1

    // 점포별
    const sk = `${r.distName}__${r.store}`
    if (!storeMap[sk]) storeMap[sk] = { distName: r.distName, store: r.store, total: 0, byMajor: {} }
    storeMap[sk].total++
    storeMap[sk].byMajor[major] = (storeMap[sk].byMajor[major] || 0) + 1

    // 교차표
    if (!crossMap[major]) crossMap[major] = {}
    crossMap[major][r.distName] = (crossMap[major][r.distName] || 0) + 1
  }

  const distNames = Object.keys(distMap)
  const mappedCount  = allRecords.filter(r => r.mapped).length

  const distSummary: DistSummary[] = Object.entries(distMap).map(([name, v]) => ({
    name,
    total:      v.total,
    mapped:     v.mapped,
    unmapped:   v.total - v.mapped,
    storeCount: v.stores.size,
    mappedPct:  Math.round((v.mapped / v.total) * 100),
  }))

  const majorData = Object.entries(majorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const crossTable: CrossRow[] = Object.entries(crossMap).map(([major, byDist]) => {
    const row: CrossRow = { major, total: 0 }
    for (const dn of distNames) {
      row[dn] = byDist[dn] || 0
      row.total += byDist[dn] || 0
    }
    return row
  }).sort((a, b) => (b.total as number) - (a.total as number))

  const storeRatioData: StoreRatioRow[] = []
  for (const [, v] of Object.entries(storeMap).sort((a, b) => b[1].total - a[1].total).slice(0, 100)) {
    for (const [cat, cnt] of Object.entries(v.byMajor).sort((a, b) => b[1] - a[1])) {
      storeRatioData.push({
        distributor_name: v.distName, store_name: v.store,
        category_name: cat, brand_count: cnt,
        ratio_pct: parseFloat((cnt / v.total * 100).toFixed(1)),
      })
    }
  }

  const group13Data = Object.entries(group13Map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  const minorData = Object.values(minorMap).sort((a, b) => b.count - a.count)

  return {
    meta: {
      totalRecords:    allRecords.length,
      mappedRecords:   mappedCount,
      unmappedRecords: allRecords.length - mappedCount,
      totalStores:     new Set(allRecords.map(r => r.store)).size,
      totalBrands:     new Set(allRecords.map(r => r.brand)).size,
      generatedAt:     new Date().toISOString(),
      folderName:      dirHandle.name,
    },
    distSummary, majorData, crossTable, storeRatioData,
    minorData: minorData.slice(0, 100),
    group13Data, gradeMap,
  }
}

// ── Provider ─────────────────────────────────────────────
export function DataProvider({ children }: { children: ReactNode }) {
  const [data,       setData]       = useState<DashboardData>(defaultData as DashboardData)
  const [folderName, setFolderName] = useState<string | null>(null)
  const [error,      setError]      = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)

  const selectFolder = useCallback(async () => {
    // 브라우저 지원 여부 확인
    if (!('showDirectoryPicker' in window)) {
      setError('이 브라우저는 폴더 선택을 지원하지 않습니다.\nChrome 또는 Edge를 사용해 주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'read' })
      const parsed    = await parseFolderToDashboard(dirHandle)
      setData(parsed)
      setFolderName(dirHandle.name)
      setError(null)
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        // 사용자가 취소한 경우 → 무시
      } else {
        const msg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.'
        setError(msg)
        // 에러 시 데이터를 초기화하지 않고 이전 데이터 유지 → 단, folderName만 null
        setFolderName(null)
        setData(defaultData as DashboardData)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(defaultData as DashboardData)
    setFolderName(null)
    setError(null)
  }, [])

  return (
    <DataContext.Provider value={{ data, folderName, error, loading, selectFolder, reset }}>
      {children}
    </DataContext.Provider>
  )
}
