import type { KnownIntent, SupportedLang, ParseResult, Slots } from './types'
import {
  normalizeColor,
  normalizeElementType,
  normalizeSizeDirection,
  normalizeIndex,
  normalizeTextAlign,
  normalizeMoveDirection,
  normalizeStylePreset,
  normalizeGroupSize,
  extractTextContent,
} from './normalizers'

// Ниже этого порога считаем фразу вне домена редактора. Само по себе косинусное
// сходство к лучшему примеру не отделяет «понятные» команды от «непонятных» —
// посторонние фразы нередко получают более высокий скор, чем настоящие команды
// (см. тестовые прогоны). Поэтому НИКАКОЙ скор трансформера не считается
// достаточным для автоматического выполнения — выше порога всегда уточняем
const SIMILARITY_THRESHOLD = 0.52

// Эталонные фразы для семантического сравнения
const INTENT_EXAMPLES: Record<KnownIntent, Record<SupportedLang, string[]>> = {
  ADD_ELEMENT: {
    ru: ['добавь кнопку', 'создай заголовок', 'вставь текстовое поле', 'поставь блок', 'положи текст', 'помести контейнер на холст'],
    en: ['add a button', 'create a heading', 'insert an input field', 'place a container', 'put some text', 'make a new element'],
  },
  CHANGE_COLOR: {
    ru: ['сделай красным', 'измени цвет на синий', 'покрась зелёным', 'поменяй цвет', 'цвет жёлтый'],
    en: ['make it red', 'change color to blue', 'paint it green', 'set color to yellow', 'color it orange'],
  },
  CHANGE_TEXT: {
    ru: ['измени текст', 'напиши привет', 'переименуй в старт', 'поставь надпись', 'назови кнопку'],
    en: ['change the text', 'write hello', 'rename to start', 'set the label', 'call it submit'],
  },
  CHANGE_SIZE: {
    ru: ['увеличь', 'уменьши', 'сделай больше', 'сделай меньше', 'шрифт побольше'],
    en: ['make bigger', 'make smaller', 'increase size', 'decrease size', 'enlarge it'],
  },
  CHANGE_FONT_WEIGHT: {
    ru: ['сделай жирным', 'жирный текст', 'выдели жирным', 'убери жирный', 'полужирный'],
    en: ['make bold', 'bold text', 'set to bold', 'make it bold', 'remove bold'],
  },
  CHANGE_FONT_STYLE: {
    ru: ['сделай курсивом', 'курсивный текст', 'наклонный шрифт', 'убери курсив', 'курсив'],
    en: ['make italic', 'italic text', 'set to italic', 'italicize it', 'remove italic'],
  },
  CHANGE_TEXT_ALIGN: {
    ru: ['выровняй по центру', 'по левому краю', 'по правому краю', 'центрировать текст', 'выравнивание'],
    en: ['align center', 'align left', 'align right', 'center the text', 'left align'],
  },
  DELETE_ELEMENT: {
    ru: ['удали', 'удалить элемент', 'убери это', 'стереть', 'уничтожь кнопку', 'снеси блок'],
    en: ['delete', 'remove it', 'erase this', 'destroy the button', 'get rid of it', 'drop element'],
  },
  SELECT_ELEMENT: {
    ru: ['выбери первый', 'выдели последнюю кнопку', 'активируй блок', 'кликни на первый', 'выбрать второй'],
    en: ['select first', 'choose the last button', 'click on first', 'pick the second element', 'focus the button'],
  },
  UNDO: {
    ru: ['отмена', 'отмени', 'верни назад', 'отменить действие', 'шаг назад'],
    en: ['undo', 'go back', 'revert', 'undo the last action', 'step back'],
  },
  CLEAR_ALL: {
    ru: ['очисти всё', 'удали всё', 'начни заново', 'сброс', 'удалить все элементы'],
    en: ['clear all', 'delete everything', 'start over', 'reset', 'remove all elements'],
  },
  DUPLICATE_ELEMENT: {
    ru: ['продублируй элемент', 'сделай копию', 'скопируй кнопку', 'клонируй блок', 'дублируй это'],
    en: ['duplicate this', 'make a copy', 'clone the button', 'copy this element', 'duplicate it'],
  },
  MOVE_ELEMENT: {
    ru: ['подвинь влево', 'передвинь вправо', 'перемести в начало', 'сдвинь в конец', 'переставь правее'],
    en: ['move it left', 'shift right', 'move to the start', 'move to the end', 'reposition it'],
  },
  APPLY_STYLE_PRESET: {
    ru: ['оформи как заголовок', 'примени стиль акцент', 'сделай в приглушённом стиле', 'выделенный стиль', 'стиль выделения'],
    en: ['style it as a heading', 'apply the accent style', 'make it subtle', 'use highlight style', 'format as a title'],
  },
  GROUP_ELEMENTS: {
    ru: ['сгруппируй последние два элемента', 'объедини их в группу', 'сгруппируй элементы', 'группировать выбранные', 'собери в группу'],
    en: ['group the last two elements', 'combine them into a group', 'group these elements', 'group them together', 'create a group'],
  },
  UNGROUP_ELEMENT: {
    ru: ['разгруппируй элемент', 'убери из группы', 'разбей группу', 'расформируй группу', 'разъедини элементы'],
    en: ['ungroup this', 'remove it from the group', 'break the group', 'disband the group', 'split the group'],
  },
}

// --- Модель ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPipeline = (text: string, opts: unknown) => Promise<{ data: Float32Array }>

let modelPromise: Promise<AnyPipeline> | undefined

function getModel(): Promise<AnyPipeline> {
  if (!modelPromise) {
    modelPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2', {
        quantized: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as Promise<AnyPipeline>,
    )
  }
  return modelPromise
}

// --- Эмбеддинги ---

const embeddingCache = new Map<string, Float32Array>()

async function embed(text: string, model: AnyPipeline): Promise<Float32Array> {
  const cached = embeddingCache.get(text)
  if (cached) return cached
  const output = await model(text, { pooling: 'mean', normalize: true })
  embeddingCache.set(text, output.data)
  return output.data
}

// Векторы нормализованы (normalize: true) → косинус = скалярное произведение
function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += (a[i] ?? 0) * (b[i] ?? 0)
  return dot
}

// Эталонные эмбеддинги строятся один раз на язык
const refCache = new Map<SupportedLang, { intent: KnownIntent; emb: Float32Array }[]>()

async function buildRefs(lang: SupportedLang, model: AnyPipeline) {
  if (refCache.has(lang)) return refCache.get(lang)!
  const refs: { intent: KnownIntent; emb: Float32Array }[] = []
  for (const [key, byLang] of Object.entries(INTENT_EXAMPLES)) {
    const intent = key as KnownIntent
    for (const phrase of byLang[lang]) {
      refs.push({ intent, emb: await embed(phrase, model) })
    }
  }
  refCache.set(lang, refs)
  return refs
}

// --- Извлечение слотов для результатов трансформера ---

function extractSlots(text: string, intent: KnownIntent, lang: SupportedLang): Partial<Slots> {
  const s: Partial<Slots> = {}
  switch (intent) {
    case 'ADD_ELEMENT': {
      const et = normalizeElementType(text, lang); if (et) s.elementType = et
      const c = normalizeColor(text, lang); if (c) s.color = c
      const t = extractTextContent(text); if (t) s.text = t
      break
    }
    case 'CHANGE_COLOR': {
      const c = normalizeColor(text, lang); if (c) s.color = c
      break
    }
    case 'CHANGE_TEXT': {
      const t = extractTextContent(text); if (t) s.text = t
      break
    }
    case 'CHANGE_SIZE': {
      const d = normalizeSizeDirection(text, lang); if (d) s.sizeDirection = d
      break
    }
    case 'CHANGE_FONT_WEIGHT':
      s.fontWeight = /убери.*жирн|remove.*bold|normal/i.test(text) ? 'normal' : 'bold'
      break
    case 'CHANGE_FONT_STYLE':
      s.fontStyle = /убери.*курсив|remove.*italic/i.test(text) ? 'normal' : 'italic'
      break
    case 'CHANGE_TEXT_ALIGN': {
      const a = normalizeTextAlign(text, lang); if (a) s.textAlign = a
      break
    }
    case 'SELECT_ELEMENT': {
      const idx = normalizeIndex(text, lang); if (idx !== undefined) s.index = idx
      const et = normalizeElementType(text, lang); if (et) s.elementType = et
      break
    }
    case 'DELETE_ELEMENT': {
      const idx = normalizeIndex(text, lang); if (idx !== undefined) s.index = idx
      break
    }
    case 'MOVE_ELEMENT': {
      const dir = normalizeMoveDirection(text, lang); if (dir) s.moveDirection = dir
      break
    }
    case 'APPLY_STYLE_PRESET': {
      const preset = normalizeStylePreset(text, lang); if (preset) s.stylePreset = preset
      break
    }
    case 'GROUP_ELEMENTS': {
      const size = normalizeGroupSize(text, lang); if (size !== undefined) s.groupSize = size
      break
    }
  }
  return s
}

// --- Публичный API ---

export async function inferWithTransformer(
  text: string,
  lang: SupportedLang,
): Promise<ParseResult> {
  const model = await getModel()
  const refs = await buildRefs(lang, model)
  const inputEmb = await embed(text.toLowerCase().trim(), model)

  // Берём максимальный скор для каждого интента
  const scores = new Map<KnownIntent, number>()
  for (const { intent, emb } of refs) {
    const sim = cosine(inputEmb, emb)
    if ((scores.get(intent) ?? -1) < sim) scores.set(intent, sim)
  }

  const [bestIntent, bestScore] = [...scores.entries()].reduce<[KnownIntent, number]>(
    (best, cur) => (cur[1] > best[1] ? [cur[0], cur[1]] : best),
    ['' as KnownIntent, -1],
  )

  if (bestScore < SIMILARITY_THRESHOLD) {
    return { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0, detectedVia: 'ood', transformerScore: bestScore }
  }

  const slots = extractSlots(text, bestIntent, lang)

  return { intent: bestIntent, slots, confidence: bestScore, detectedVia: 'clarify', transformerScore: bestScore }
}

// Вызывается при старте приложения для фоновой загрузки модели
export function preloadTransformerModel(): void {
  getModel().catch(() => { /* silent — пользователь увидит задержку при первом OOD */ })
}
