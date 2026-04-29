const XLSX = require('xlsx')
const fs   = require('fs')
const path = require('path')

const MAIN = "C:/Users/LEE_GICHUL/Desktop/타유통 컨텐츠조사/6사_전체컨텐츠_통합_v10_미매핑보강.xlsx"
const BCD  = "C:/Users/LEE_GICHUL/Desktop/타유통 컨텐츠조사/BCD기준.xlsx"

// ── 메인 파일 읽기 ──────────────────────────────────────
const mainWb   = XLSX.readFile(MAIN)
console.log('[메인 시트]', mainWb.SheetNames)

const sheet1   = mainWb.Sheets[mainWb.SheetNames[0]]
const allRows  = XLSX.utils.sheet_to_json(sheet1, { defval: '' })

console.log('총 행 수:', allRows.length)
console.log('컬럼:', JSON.stringify(Object.keys(allRows[0] || {})))
console.log('샘플 0:', JSON.stringify(allRows[0]))
console.log('샘플 1:', JSON.stringify(allRows[1]))
console.log('샘플 2:', JSON.stringify(allRows[2]))

// ── BCD 파일 읽기 ──────────────────────────────────────
const bcdWb    = XLSX.readFile(BCD)
console.log('\n[BCD 시트]', bcdWb.SheetNames)
const bcdSheet = bcdWb.Sheets[bcdWb.SheetNames[0]]
const bcdRows  = XLSX.utils.sheet_to_json(bcdSheet, { defval: '' })
console.log('BCD 행 수:', bcdRows.length)
console.log('BCD 컬럼:', JSON.stringify(Object.keys(bcdRows[0] || {})))
bcdRows.slice(0, 10).forEach((r, i) => console.log(`BCD[${i}]`, JSON.stringify(r)))
