import type { ParseResult, SupportedLang } from './types'
import { ruPatterns } from './patterns/ru'
import { enPatterns } from './patterns/en'
import { inferWithTransformer } from './TransformerFallback'

export function parseIntent(text: string, lang: SupportedLang): ParseResult {
  const normalized = text.trim().toLowerCase()
  const patterns = lang === 'ru' ? ruPatterns : enPatterns

  for (const { intent, pattern, extractSlots } of patterns) {
    if (pattern.test(normalized)) {
      return {
        intent,
        slots: extractSlots(normalized),
        confidence: 1,
        detectedVia: 'regex',
      }
    }
  }

  return { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0, detectedVia: 'ood' }
}

// Cascade: сначала regex (0ms), при OUT_OF_DOMAIN — трансформер (~100–300ms)
export async function parseIntentAsync(text: string, lang: SupportedLang): Promise<ParseResult> {
  const regexResult = parseIntent(text, lang)
  if (regexResult.intent !== 'OUT_OF_DOMAIN') return regexResult
  return inferWithTransformer(text, lang)
}
