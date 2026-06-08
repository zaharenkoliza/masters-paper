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

  try {
    return await inferWithTransformer(text, lang)
  } catch (err) {
    // Загрузка/инференс модели в браузере может упасть (сеть, WASM, кэш) —
    // без этого отлова вызывающий код просто получает отклонённый промис,
    // и пользователь не видит вообще никакой реакции на свою команду
    console.warn('Transformer fallback failed, treating as out-of-domain:', err)
    return { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0, detectedVia: 'ood' }
  }
}

const RU_SEGMENT_SPLIT = /\s*,\s*|\s+(?:и|затем|потом)\s+/i
const EN_SEGMENT_SPLIT = /\s*,\s*|\s+(?:and then|and|then)\s+/i

function splitSegments(text: string, lang: SupportedLang): string[] {
  const re = lang === 'ru' ? RU_SEGMENT_SPLIT : EN_SEGMENT_SPLIT
  return text
    .split(re)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

// Составные команды: «добавь кнопку и сделай её синей» → [ADD_ELEMENT, CHANGE_COLOR].
// Срабатывает, только если КАЖДЫЙ сегмент уверенно распознан regex'ом — иначе
// слово «и»/«and», встретившееся внутри обычной фразы, могло бы её сломать.
export async function parseCommandSequence(text: string, lang: SupportedLang): Promise<ParseResult[]> {
  const segments = splitSegments(text, lang)
  if (segments.length < 2) return [await parseIntentAsync(text, lang)]

  const regexResults = segments.map((seg) => parseIntent(seg, lang))
  if (regexResults.every((r) => r.intent !== 'OUT_OF_DOMAIN')) return regexResults

  return [await parseIntentAsync(text, lang)]
}
