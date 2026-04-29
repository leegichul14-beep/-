import XLSX from 'xlsx'
import { writeFileSync } from 'fs'

const MAIN_FILE = "C:/Users/LEE_GICHUL/Desktop/타유통 컨텐츠조사/6사_전체컨텐츠_통합_v10_미매핑보강.xlsx"
const BCD_FILE  = "C:/Users/LEE_GICHUL/Desktop/타유통 컨텐츠조사/BCD기준.xlsx"

console.log("=== 파일 읽는 중... ===")

// 메인 파일 읽기
const mainWb = XLSX.readFile(MAIN_FILE)
console.log("시트 목록:", mainWb.SheetNames)

// 첫 번째 시트 데이터
const mainSheet = mainWb.Sheets[mainWb.SheetNames[0]]
const mainData  = XLSX.utils.sheet_to_json(mainSheet, { defval: '' })

console.log(`\n총 행 수: ${mainData.length}`)
console.log("컬럼 목록:", Object.keys(mainData[0] || {}))
console.log("\n=== 샘플 데이터 (첫 3행) ===")
mainData.slice(0, 3).forEach((row, i) => console.log(`[${i}]`, JSON.stringify(row, null, 2)))

// BCD 파일 읽기
const bcdWb    = XLSX.readFile(BCD_FILE)
console.log("\n=== BCD 시트 목록:", bcdWb.SheetNames)
const bcdSheet = bcdWb.Sheets[bcdWb.SheetNames[0]]
const bcdData  = XLSX.utils.sheet_to_json(bcdSheet, { defval: '' })
console.log(`BCD 행 수: ${bcdData.length}`)
console.log("BCD 컬럼:", Object.keys(bcdData[0] || {}))
console.log("\n=== BCD 샘플 (첫 5행) ===")
bcdData.slice(0, 5).forEach((row, i) => console.log(`[${i}]`, JSON.stringify(row)))
