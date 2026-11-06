import { describe, it, expect } from 'vitest'
import { FAQ_CATEGORIES, getAllFaqs } from '@/data/faqs'

describe('FAQ 資料完整性與合約測試 (faqs-data.test.ts)', () => {
  it('應包含至少 5 個核心常見問題分類', () => {
    expect(FAQ_CATEGORIES.length).toBeGreaterThanOrEqual(5)
  })

  it('所有分類的 id 必須全站唯一且名稱非空', () => {
    const categoryIds = FAQ_CATEGORIES.map((c) => c.id)
    const uniqueIds = new Set(categoryIds)
    expect(uniqueIds.size).toBe(categoryIds.length)

    for (const cat of FAQ_CATEGORIES) {
      expect(cat.id).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.icon).toBeDefined()
      expect(cat.faqs.length).toBeGreaterThan(0)
    }
  })

  it('所有問題的 id 必須全站唯一且不可包含空白', () => {
    const allFaqs = getAllFaqs()
    const faqIds = allFaqs.map((f) => f.id)
    const uniqueFaqIds = new Set(faqIds)

    expect(uniqueFaqIds.size).toBe(allFaqs.length)

    for (const faq of allFaqs) {
      expect(faq.id).toBeTruthy()
      expect(faq.id).not.toMatch(/\s/)
      expect(faq.question).toBeTruthy()
      expect(faq.paragraphs.length).toBeGreaterThan(0)
      for (const p of faq.paragraphs) {
        expect(p.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('getAllFaqs 回傳的長度應等於所有分類問題數的加總', () => {
    const totalCountFromCategories = FAQ_CATEGORIES.reduce(
      (sum, cat) => sum + cat.faqs.length,
      0,
    )
    const allFaqs = getAllFaqs()
    expect(allFaqs.length).toBe(totalCountFromCategories)
    expect(allFaqs.length).toBeGreaterThanOrEqual(12)
  })

  it('應涵蓋新手關鍵實戰題：庇護所種類、作息門禁、朝聖者套餐與護照取得', () => {
    const allFaqs = getAllFaqs()
    const ids = allFaqs.map((f) => f.id)

    expect(ids).toContain('albergue-types-and-rules')
    expect(ids).toContain('albergue-schedule-and-curfew')
    expect(ids).toContain('menu-del-peregrino-explained')
    expect(ids).toContain('credencial-how-to-get-and-use')
  })
})
