// 意圖分類的純規則引擎：無 I/O、無框架依賴。
// 由 intentService（USE_MOCK 路徑）與 mock adapter 共用，確保一致。
import { extract } from '../utils/textExtract'

// 福利／活動類線索（Task 9 定義：補助、活動、福利、課程、健康檢查）。
const WELFARE_RE = /補助|活動|福利|課程|健康檢查/
// 明確的問句線索：有沒有…嗎、什麼、哪裡、幾點… 等詢問既有事件。
const QUESTION_RE = /有沒有|有嗎|有無|嗎|什麼|哪裡|哪邊|在哪|幾點|什麼時候|多少|怎麼|查詢|查一下/
// 弱線索：只有在沒有具體事件類型時，才視為在「問」而非「描述」。
const CONTEXT_RE = /最近|附近|這邊|那邊/

function hasContent(extracted) {
  return Boolean(extracted.eventType || extracted.locationText || extracted.timeText)
}

function isQuery(text, extracted) {
  if (!hasContent(extracted)) return false
  if (QUESTION_RE.test(text)) return true
  // 「最近…」「附近…」若同時描述了具體事件（有 eventType），視為回報。
  return CONTEXT_RE.test(text) && !extracted.eventType
}

/**
 * 以規則對文字分類，回傳 { intent, confidence, extracted }。
 * 分類順序：welfare → query → report → ambiguous。
 */
export function classifyText(text) {
  const source = typeof text === 'string' ? text.trim() : ''
  const extracted = extract(source)
  if (!source) return { intent: 'ambiguous', confidence: 0, extracted }

  if (WELFARE_RE.test(source)) return { intent: 'welfare', confidence: 0.85, extracted }
  if (isQuery(source, extracted)) return { intent: 'query', confidence: 0.8, extracted }
  if (extracted.eventType) return { intent: 'report', confidence: 0.9, extracted }

  return { intent: 'ambiguous', confidence: 0.3, extracted }
}

export default { classifyText }
