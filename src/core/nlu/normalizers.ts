import type { ElementType, Slots } from './types'

const RU_COLORS: [RegExp, string][] = [
  [/красн/i, '#ef4444'],
  [/синий|синим|голубой|голуб/i, '#3b82f6'],
  [/зелён|зелен|изумруд/i, '#22c55e'],
  [/жёлт|желт|золот/i, '#eab308'],
  [/белый|белым|бел(?!ого)/i, '#ffffff'],
  [/чёрн|черн/i, '#000000'],
  [/серый|серым|сер(?!ого)/i, '#6b7280'],
  [/оранж/i, '#f97316'],
  [/фиолет|пурпур|сирен/i, '#8b5cf6'],
  [/розов|малин/i, '#ec4899'],
  [/бирюз/i, '#14b8a6'],
  [/коричн/i, '#92400e'],
]

const EN_COLORS: [RegExp, string][] = [
  [/\bred\b/i, '#ef4444'],
  [/\bblue\b/i, '#3b82f6'],
  [/\bgreen\b/i, '#22c55e'],
  [/\byellow\b/i, '#eab308'],
  [/\bwhite\b/i, '#ffffff'],
  [/\bblack\b/i, '#000000'],
  [/\bgray\b|\bgrey\b/i, '#6b7280'],
  [/\borange\b/i, '#f97316'],
  [/\bpurple\b|\bviolet\b/i, '#8b5cf6'],
  [/\bpink\b/i, '#ec4899'],
  [/\bteal\b/i, '#14b8a6'],
  [/\bbrown\b/i, '#92400e'],
  [/\bcrimson\b/i, '#dc143c'],
  [/\bnavy\b/i, '#1e3a5f'],
]

export function normalizeColor(text: string, lang: 'ru' | 'en'): string | undefined {
  const table = lang === 'ru' ? RU_COLORS : EN_COLORS
  for (const [rx, hex] of table) {
    if (rx.test(text)) return hex
  }
  return undefined
}

const RU_ELEMENTS: [RegExp, ElementType][] = [
  [/кнопк|кнопочк/i, 'button'],
  [/заголовок|хедер|шапк/i, 'heading'],
  [/текстовое\s+поле|пол[её]\s+ввод|инпут|форм/i, 'input'],
  [/надпис|абзац|параграф|текст(?!овое)/i, 'text'],
  [/контейнер|блок|обёртк|секци|дивк/i, 'container'],
]

const EN_ELEMENTS: [RegExp, ElementType][] = [
  [/\bbutton\b/i, 'button'],
  [/\bheading\b|\bheader\b|\btitle\b/i, 'heading'],
  [/\binput\b|\btext\s+field\b|\bform\s+field\b/i, 'input'],
  [/\btext\b|\blabel\b|\bparagraph\b/i, 'text'],
  [/\bcontainer\b|\bdiv\b|\bsection\b|\bblock\b|\bwrapper\b/i, 'container'],
]

export function normalizeElementType(text: string, lang: 'ru' | 'en'): ElementType | undefined {
  const table = lang === 'ru' ? RU_ELEMENTS : EN_ELEMENTS
  for (const [rx, type] of table) {
    if (rx.test(text)) return type
  }
  return undefined
}

export function normalizeSizeDirection(
  text: string,
  lang: 'ru' | 'en',
): Slots['sizeDirection'] | undefined {
  if (lang === 'ru') {
    if (/увелич|больш/i.test(text)) return 'bigger'
    if (/уменьш|меньш/i.test(text)) return 'smaller'
  } else {
    if (/bigger|larger|increase|enlarge|grow/i.test(text)) return 'bigger'
    if (/smaller|decrease|shrink|reduce/i.test(text)) return 'smaller'
  }
  return undefined
}

export function normalizeIndex(text: string, lang: 'ru' | 'en'): Slots['index'] | undefined {
  if (lang === 'ru') {
    if (/первый|первую|первого|перв/i.test(text)) return 'first'
    if (/последн/i.test(text)) return 'last'
    if (/второй|вторую|второго/i.test(text)) return 1
    if (/третий|третью|третьего/i.test(text)) return 2
  } else {
    if (/\bfirst\b/i.test(text)) return 'first'
    if (/\blast\b/i.test(text)) return 'last'
    if (/\bsecond\b/i.test(text)) return 1
    if (/\bthird\b/i.test(text)) return 2
  }
  return undefined
}

export function normalizeTextAlign(
  text: string,
  lang: 'ru' | 'en',
): Slots['textAlign'] | undefined {
  if (lang === 'ru') {
    if (/по\s+центру|центр/i.test(text)) return 'center'
    if (/по\s+прав|правому|вправо/i.test(text)) return 'right'
    if (/по\s+лев|левому|влево/i.test(text)) return 'left'
  } else {
    if (/\bcenter\b|\bcentre\b/i.test(text)) return 'center'
    if (/\bright\b/i.test(text)) return 'right'
    if (/\bleft\b/i.test(text)) return 'left'
  }
  return undefined
}

export function normalizeMoveDirection(
  text: string,
  lang: 'ru' | 'en',
): Slots['moveDirection'] | undefined {
  if (lang === 'ru') {
    if (/в\s+начало|на\s+первое\s+место|в\s+самый\s+верх/i.test(text)) return 'start'
    if (/в\s+конец|на\s+последнее\s+место|в\s+самый\s+низ/i.test(text)) return 'end'
    if (/влево|налево|левее/i.test(text)) return 'left'
    if (/вправо|направо|правее/i.test(text)) return 'right'
  } else {
    if (/\bto\s+(the\s+)?(start|beginning|front)\b/i.test(text)) return 'start'
    if (/\bto\s+(the\s+)?(end|back)\b/i.test(text)) return 'end'
    if (/\bleft\b/i.test(text)) return 'left'
    if (/\bright\b/i.test(text)) return 'right'
  }
  return undefined
}

const RU_PRESETS: [RegExp, Slots['stylePreset']][] = [
  [/заголов/i, 'heading'],
  [/акцент/i, 'accent'],
  [/приглуш|тусклы|неприметн/i, 'subtle'],
  [/выделен|подсвет/i, 'highlight'],
]

const EN_PRESETS: [RegExp, Slots['stylePreset']][] = [
  [/\bheading\b|\btitle\b/i, 'heading'],
  [/\baccent\b/i, 'accent'],
  [/\bsubtle\b|\bmuted\b/i, 'subtle'],
  [/\bhighlight\b/i, 'highlight'],
]

export function normalizeStylePreset(text: string, lang: 'ru' | 'en'): Slots['stylePreset'] | undefined {
  const table = lang === 'ru' ? RU_PRESETS : EN_PRESETS
  for (const [rx, preset] of table) {
    if (rx.test(text)) return preset
  }
  return undefined
}

const RU_NUMBER_WORDS: Record<string, number> = {
  два: 2, две: 2, двух: 2,
  три: 3, трёх: 3, трех: 3,
  четыре: 4, четырёх: 4, четырех: 4,
  пять: 5, пяти: 5,
}

const EN_NUMBER_WORDS: Record<string, number> = {
  two: 2, three: 3, four: 4, five: 5,
}

export function normalizeGroupSize(text: string, lang: 'ru' | 'en'): number | undefined {
  const digitMatch = text.match(/\d+/)
  if (digitMatch) return parseInt(digitMatch[0], 10)

  const table = lang === 'ru' ? RU_NUMBER_WORDS : EN_NUMBER_WORDS
  for (const [word, value] of Object.entries(table)) {
    // \b не распознаёт границы слов на кириллице (буквы вне \w) — используем лукэраунды
    const re = lang === 'ru'
      ? new RegExp(`(?<![а-яёА-ЯЁ])${word}(?![а-яёА-ЯЁ])`, 'i')
      : new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(text)) return value
  }
  return undefined
}

export function extractTextContent(text: string): string | undefined {
  // Between quotes «» or ""
  const quoted = text.match(/[«""](.+?)[»""]/u)
  if (quoted) return quoted[1]

  // After "на ", "в ", ": ", "text to ", "to "
  const afterPrep = text.match(/(?:текст\s+на|назови\s+|напиши\s+|поставь\s+текст\s+|text\s+to|rename\s+to|call\s+it|label\s+)\s*(.+)$/i)
  if (afterPrep) return afterPrep[1]!.trim()

  return undefined
}
