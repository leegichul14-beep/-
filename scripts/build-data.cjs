/**
 * 6사_전체컨텐츠_통합_v10.xlsx → 대시보드용 JSON 생성
 * 컬럼: 회사 | 채널 | 점포 | 층 | 원본카테고리 | 브랜드명 | 매핑여부 | 대분류 | 중분류(수정) | 13그룹 | 등급 | 자사(O)
 */
const XLSX = require('xlsx')
const fs   = require('fs')

const MAIN = "C:/Users/LEE_GICHUL/Desktop/타유통 컨텐츠조사/6사_전체컨텐츠_통합_v10_미매핑보강.xlsx"
const mainWb = XLSX.readFile(MAIN)

const DIST_SHEETS = [
  { sheet: '1_현대백화점', distName: '현대' },
  { sheet: '2_롯데',       distName: '롯데' },
  { sheet: '3_신세계',     distName: '신세계' },
  { sheet: '4_현대산업개발',distName: '아이파크몰' },
  { sheet: '5_이랜드리테일',distName: '이랜드리테일' },
]

// 컬럼 인덱스 (0-based, header row = index 1)
const COL = { 회사:0, 채널:1, 점포:2, 층:3, 원본:4, 브랜드:5, 매핑:6, 대분류:7, 중분류:8, 그룹13:9, 등급:10, 자사:11 }

// 전체 레코드 저장
let allRecords = []

for (const { sheet, distName } of DIST_SHEETS) {
  const ws   = mainWb.Sheets[sheet]
  if (!ws) continue
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 })

  // row[0] = 제목, row[1] = 헤더, row[2~] = 데이터
  for (let i = 2; i < rows.length; i++) {
    const r = rows[i]
    const brand    = String(r[COL.브랜드] || '').trim()
    const store    = String(r[COL.점포]   || '').trim()
    const major    = String(r[COL.대분류] || '').trim()
    const minor    = String(r[COL.중분류] || '').trim()
    const group13  = String(r[COL.그룹13] || '').trim()
    const grade    = String(r[COL.등급]   || '').trim()
    const mapped   = String(r[COL.매핑]   || '').includes('⭕')
    const ownBrand = String(r[COL.자사]   || '').includes('⭕')
    const channel  = String(r[COL.채널]   || '').trim()
    const floor    = String(r[COL.층]     || '').trim()

    if (!brand || !store) continue

    allRecords.push({ distName, channel, store, floor, brand, major, minor, group13, grade, mapped, ownBrand })
  }
}

console.log(`총 레코드: ${allRecords.length}`)

// ── 1. 유통사별 요약 ──────────────────────────────────────
const distMap = {}
for (const r of allRecords) {
  if (!distMap[r.distName]) distMap[r.distName] = { total: 0, mapped: 0, stores: new Set() }
  distMap[r.distName].total++
  if (r.mapped) distMap[r.distName].mapped++
  distMap[r.distName].stores.add(r.store)
}

const distSummary = Object.entries(distMap).map(([name, v]) => ({
  name,
  total:      v.total,
  mapped:     v.mapped,
  unmapped:   v.total - v.mapped,
  storeCount: v.stores.size,
  mappedPct:  Math.round((v.mapped / v.total) * 100)
}))

console.log('\n[유통사별 요약]')
distSummary.forEach(d => console.log(`  ${d.name}: 총${d.total} 매핑${d.mapped}(${d.mappedPct}%) 점포${d.storeCount}개`))

// ── 2. 대분류별 집계 ─────────────────────────────────────
const majorMap = {}
for (const r of allRecords) {
  if (!r.mapped) continue
  const key = r.major || '미분류'
  if (!majorMap[key]) majorMap[key] = 0
  majorMap[key]++
}

const majorData = Object.entries(majorMap)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count }))

console.log('\n[대분류별 (매핑 기준)]')
majorData.forEach(d => console.log(`  ${d.name}: ${d.count}`))

// ── 3. 대분류 × 유통사 교차표 ──────────────────────────────
const crossMap = {}  // crossMap[major][dist] = count
for (const r of allRecords) {
  if (!r.mapped) continue
  const major = r.major || '미분류'
  const dist  = r.distName
  if (!crossMap[major]) crossMap[major] = {}
  crossMap[major][dist] = (crossMap[major][dist] || 0) + 1
}

const distNames = distSummary.map(d => d.name)
const crossTable = Object.entries(crossMap).map(([major, byDist]) => {
  const row = { major, total: 0 }
  for (const dn of distNames) {
    row[dn] = byDist[dn] || 0
    row.total += row[dn]
  }
  return row
}).sort((a, b) => b.total - a.total)

console.log('\n[대분류 × 유통사 교차표]')
console.log('  ', ['대분류', ...distNames, '합계'].join('\t'))
crossTable.forEach(r => {
  console.log('  ', [r.major, ...distNames.map(d => r[d]), r.total].join('\t'))
})

// ── 4. 점포별 대분류 비중 (매핑 기준, Top 30점) ─────────────
const storeMap = {}
for (const r of allRecords) {
  if (!r.mapped) continue
  const key = `${r.distName}__${r.store}`
  if (!storeMap[key]) storeMap[key] = { distName: r.distName, store: r.store, total: 0, byMajor: {} }
  storeMap[key].total++
  storeMap[key].byMajor[r.major || '미분류'] = (storeMap[key].byMajor[r.major || '미분류'] || 0) + 1
}

const storeRatioData = []
for (const [, v] of Object.entries(storeMap).sort((a, b) => b[1].total - a[1].total).slice(0, 50)) {
  for (const [major, count] of Object.entries(v.byMajor).sort((a, b) => b[1] - a[1])) {
    storeRatioData.push({
      distributor_name: v.distName,
      store_name:       v.store,
      category_name:    major,
      brand_count:      count,
      ratio_pct:        parseFloat((count / v.total * 100).toFixed(1))
    })
  }
}

// ── 5. 중분류별 집계 ─────────────────────────────────────
const minorMap = {}
for (const r of allRecords) {
  if (!r.mapped) continue
  const key = `${r.major}__${r.minor}`
  if (!minorMap[key]) minorMap[key] = { major: r.major, minor: r.minor, count: 0 }
  minorMap[key].count++
}

const minorData = Object.values(minorMap).sort((a, b) => b.count - a.count)

// ── 6. 13그룹별 집계 ─────────────────────────────────────
const group13Map = {}
for (const r of allRecords) {
  if (!r.mapped) continue
  const key = r.group13 || '미분류'
  group13Map[key] = (group13Map[key] || 0) + 1
}

const group13Data = Object.entries(group13Map)
  .sort((a, b) => b[1] - a[1])
  .map(([name, count]) => ({ name, count }))

// ── 7. 브랜드별 등급 집계 (매핑된 것만) ──────────────────────
const gradeMap = {}
for (const r of allRecords) {
  if (!r.mapped) continue
  const g = (r.grade || '-').trim()
  gradeMap[g] = (gradeMap[g] || 0) + 1
}

console.log('\n[등급 분포]', JSON.stringify(gradeMap))
console.log('\n[13그룹 Top10]')
group13Data.slice(0, 10).forEach(d => console.log(`  ${d.name}: ${d.count}`))

// ── 8b. 13그룹 분석 + 브랜드 드릴다운용 집계 ─────────────────
const _g13Dist  = {}  // [group13||dist] → count
const _g13Major = {}  // [group13||major] → count
const _g13Store = {}  // [group13||dist||store] → count
const _g13MB    = {}  // [group13||major||brand] → { group13, major, brand, stores: Set }
const _bStore   = {}  // [brand||dist||store] → { brand, distName, storeName, count }

for (const r of allRecords) {
  if (!r.mapped) continue
  const g  = r.group13 || '미분류'
  const m  = r.major   || '미분류'

  const dk = `${g}||${r.distName}`
  _g13Dist[dk] = (_g13Dist[dk] || 0) + 1

  const mk = `${g}||${m}`
  _g13Major[mk] = (_g13Major[mk] || 0) + 1

  const sk = `${g}||${r.distName}||${r.store}`
  _g13Store[sk] = (_g13Store[sk] || 0) + 1

  const bmk = `${g}||${m}||${r.brand}`
  if (!_g13MB[bmk]) _g13MB[bmk] = { group13: g, major: m, brand: r.brand, stores: new Set() }
  _g13MB[bmk].stores.add(`${r.distName}||${r.store}`)

  const bsk = `${r.brand}||${r.distName}||${r.store}`
  if (!_bStore[bsk]) _bStore[bsk] = { brand: r.brand, distName: r.distName, storeName: r.store, count: 0 }
  _bStore[bsk].count++
}

const g13DistData = Object.entries(_g13Dist).map(([k, count]) => {
  const [group13, distName] = k.split('||')
  return { group13, distName, count }
})

const g13MajorData = Object.entries(_g13Major).map(([k, count]) => {
  const [group13, major] = k.split('||')
  return { group13, major, count }
})

const g13StoreData = Object.entries(_g13Store).map(([k, count]) => {
  const [group13, distName, storeName] = k.split('||')
  return { group13, distName, storeName, count }
}).sort((a, b) => b.count - a.count)

const g13MajorBrandData = Object.values(_g13MB).map(v => ({
  group13: v.group13, major: v.major, brand: v.brand, storeCount: v.stores.size,
})).sort((a, b) => b.storeCount - a.storeCount)

const brandStoreData = Object.values(_bStore).sort((a, b) => b.count - a.count)

console.log(`\n[13그룹 분석 집계] g13DistData:${g13DistData.length} g13MajorData:${g13MajorData.length} g13StoreData:${g13StoreData.length}`)
console.log(`  g13MajorBrandData:${g13MajorBrandData.length} brandStoreData:${brandStoreData.length}`)

// ── 8. JSON 출력 ─────────────────────────────────────────
const output = {
  meta: {
    totalRecords:    allRecords.length,
    mappedRecords:   allRecords.filter(r => r.mapped).length,
    unmappedRecords: allRecords.filter(r => !r.mapped).length,
    totalStores:     new Set(allRecords.map(r => r.store)).size,
    totalBrands:     new Set(allRecords.map(r => r.brand)).size,
    generatedAt:     new Date().toISOString(),
  },
  distSummary,
  majorData,
  crossTable,
  storeRatioData,
  minorData:   minorData.slice(0, 50),
  group13Data,
  gradeMap,
  // ── 13그룹 분석 + 브랜드 드릴다운 ──────────────
  g13DistData,
  g13MajorData,
  g13StoreData,
  g13MajorBrandData,
  brandStoreData,
}

const outPath = 'src/data/dashboard-data.json'
fs.mkdirSync('src/data', { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
console.log(`\n✅ JSON 저장 완료: ${outPath}`)
console.log(`   총 레코드: ${output.meta.totalRecords.toLocaleString()}`)
console.log(`   매핑됨: ${output.meta.mappedRecords.toLocaleString()}`)
console.log(`   미매핑: ${output.meta.unmappedRecords.toLocaleString()}`)
console.log(`   점포 수: ${output.meta.totalStores}`)
console.log(`   브랜드 수: ${output.meta.totalBrands}`)
