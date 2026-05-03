import type { ParseResult, SupportedLang } from './types'
import { ruPatterns } from './patterns/ru'
import { enPatterns } from './patterns/en'

export function parseIntent(text: string, lang: SupportedLang): ParseResult {
  const normalized = text.trim().toLowerCase()
  const patterns = lang === 'ru' ? ruPatterns : enPatterns

  for (const { intent, pattern, extractSlots } of patterns) {
    if (pattern.test(normalized)) {
      return {
        intent,
        slots: extractSlots(normalized),
        confidence: 1,
      }
    }
  }

  return { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0 }
}
