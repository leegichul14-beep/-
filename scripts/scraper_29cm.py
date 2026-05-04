"""
29CM 베스트 아이템 크롤러
- 카테고리별 베스트 순위, 상품명, 브랜드, 가격 수집
- 결과: data/29cm_best_YYYY-MM.csv

설치: pip install playwright pandas
      playwright install chromium
실행: python scripts/scraper_29cm.py
"""

import asyncio
import csv
import json
import os
import re
from datetime import datetime
from pathlib import Path

from playwright.async_api import async_playwright

# ── 수집 대상 카테고리 ──────────────────────────────────────────────
CATEGORIES = [
    {"name": "여성의류", "param": "001001"},
    {"name": "여성잡화", "param": "001002"},
    {"name": "남성의류", "param": "001003"},
    {"name": "스포츠/아웃도어", "param": "001009"},
    {"name": "라이프스타일", "param": "003001"},
]

BASE_URL = "https://www.29cm.co.kr/store/best-items"
OUTPUT_DIR = Path(__file__).parent.parent / "data" / "29cm"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


async def scrape_category(page, category: dict, date_str: str) -> list[dict]:
    """카테고리 페이지에서 베스트 아이템 추출"""
    url = f"{BASE_URL}?category={category['param']}"
    print(f"  [{category['name']}] {url}")

    await page.goto(url, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(2000)

    # 스크롤로 lazy load 트리거
    for _ in range(5):
        await page.evaluate("window.scrollBy(0, 800)")
        await page.wait_for_timeout(500)

    # 상품 카드 추출 (29CM 실제 DOM 셀렉터 — 변경 시 아래 수정)
    items = await page.evaluate("""
        () => {
            const results = [];
            // 상품 카드 공통 패턴 탐색
            const cards = document.querySelectorAll(
                '[class*="ProductCard"], [class*="product-card"], [data-testid*="product"]'
            );

            cards.forEach((card, idx) => {
                const rank     = idx + 1;
                const nameEl   = card.querySelector('[class*="name"], [class*="title"], h3, h4');
                const brandEl  = card.querySelector('[class*="brand"], [class*="Brand"]');
                const priceEl  = card.querySelector('[class*="price"], [class*="Price"]');
                const reviewEl = card.querySelector('[class*="review"], [class*="Review"], [class*="count"]');
                const linkEl   = card.querySelector('a');

                const priceText = priceEl ? priceEl.textContent.replace(/[^0-9]/g, '') : '';

                results.push({
                    rank,
                    brand:       brandEl  ? brandEl.textContent.trim()  : '',
                    product_name: nameEl  ? nameEl.textContent.trim()   : '',
                    price:        priceText ? parseInt(priceText, 10)   : null,
                    review_count: reviewEl ? reviewEl.textContent.replace(/[^0-9]/g, '') : '',
                    url:          linkEl   ? linkEl.href                : '',
                });
            });
            return results;
        }
    """)

    # 빈 결과면 fallback: 네트워크 응답에서 JSON 파싱 시도
    if not items:
        items = await _fallback_api_parse(page, category)

    rows = []
    for item in items[:50]:  # 상위 50개
        rows.append({
            "date":         date_str,
            "category":     category["name"],
            "rank":         item.get("rank"),
            "brand":        item.get("brand", ""),
            "product_name": item.get("product_name", ""),
            "price":        item.get("price"),
            "review_count": item.get("review_count", ""),
            "url":          item.get("url", ""),
        })

    print(f"    → {len(rows)}개 수집")
    return rows


async def _fallback_api_parse(page, category: dict) -> list[dict]:
    """DOM 파싱 실패 시 XHR 응답에서 직접 파싱"""
    items = []
    try:
        # 페이지 소스에서 __NEXT_DATA__ JSON 추출
        data_str = await page.evaluate("""
            () => {
                const el = document.getElementById('__NEXT_DATA__');
                return el ? el.textContent : null;
            }
        """)
        if data_str:
            data = json.loads(data_str)
            # Next.js props에서 상품 목록 탐색 (구조는 버전마다 다름)
            products = _find_products_in_json(data)
            for idx, p in enumerate(products):
                items.append({
                    "rank":         idx + 1,
                    "brand":        p.get("brandName", p.get("brand", {}).get("name", "")),
                    "product_name": p.get("itemName", p.get("name", "")),
                    "price":        p.get("consumerPrice", p.get("price", None)),
                    "review_count": p.get("reviewCount", ""),
                    "url":          f"https://www.29cm.co.kr/product/{p.get('itemNo', '')}",
                })
    except Exception as e:
        print(f"    fallback 파싱 실패: {e}")
    return items


def _find_products_in_json(obj, depth=0):
    """JSON 트리에서 상품 배열 탐색 (재귀)"""
    if depth > 8:
        return []
    if isinstance(obj, list) and obj and isinstance(obj[0], dict):
        if "itemName" in obj[0] or "itemNo" in obj[0]:
            return obj
    if isinstance(obj, dict):
        for v in obj.values():
            result = _find_products_in_json(v, depth + 1)
            if result:
                return result
    return []


async def run():
    date_str = datetime.now().strftime("%Y-%m")
    output_file = OUTPUT_DIR / f"29cm_best_{date_str}.csv"

    print(f"=== 29CM 베스트 크롤러 시작 ({date_str}) ===")
    print(f"저장 경로: {output_file}")

    all_rows = []

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                       "AppleWebKit/537.36 (KHTML, like Gecko) "
                       "Chrome/124.0.0.0 Safari/537.36",
            locale="ko-KR",
        )
        page = await ctx.new_page()

        for cat in CATEGORIES:
            try:
                rows = await scrape_category(page, cat, date_str)
                all_rows.extend(rows)
            except Exception as e:
                print(f"  [{cat['name']}] 오류: {e}")

            await asyncio.sleep(1.5)  # 요청 간격

        await browser.close()

    # CSV 저장
    if all_rows:
        fieldnames = ["date", "category", "rank", "brand", "product_name", "price", "review_count", "url"]
        with open(output_file, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_rows)
        print(f"\n✓ {len(all_rows)}개 저장 완료 → {output_file}")
    else:
        print("\n수집된 데이터 없음. DOM 셀렉터 확인 필요.")

    return output_file


if __name__ == "__main__":
    asyncio.run(run())
