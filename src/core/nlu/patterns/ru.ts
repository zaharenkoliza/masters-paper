import type { IntentPattern } from './types'
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
} from '../normalizers'

export const ruPatterns: IntentPattern[] = [
  // --- Высокоприоритетные (без неоднозначности) ---
  {
    intent: 'CLEAR_ALL',
    pattern: /очисти.*в[сщ][её]|удали.*вс[её]|удал.*всё|сброс|начни заново|всё удали|стер.*всё/i,
    extractSlots: () => ({}),
  },
  {
    intent: 'UNDO',
    pattern: /отмен|верни(?!\s+цвет)(?!\s+текст)|отменить|назад(?!.*элемент)/i,
    extractSlots: () => ({}),
  },

  // --- Группировка ---
  {
    intent: 'UNGROUP_ELEMENT',
    pattern: /разгруппир|расформир.*групп|разбей.*групп|убери.*из\s+групп/i,
    extractSlots: () => ({}),
  },
  {
    intent: 'GROUP_ELEMENTS',
    pattern: /сгруппир|группир.*элемент|объедини.*групп/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const size = normalizeGroupSize(text, 'ru')
      if (size !== undefined) slots.groupSize = size
      return slots
    },
  },

  // --- Дублирование ---
  {
    intent: 'DUPLICATE_ELEMENT',
    pattern: /дублир|клонир|скопир|сделай\s+копию/i,
    extractSlots: () => ({}),
  },

  // --- Перемещение ---
  {
    intent: 'MOVE_ELEMENT',
    pattern: /подвинь|передвинь|перемест|сдвинь|переставь/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const dir = normalizeMoveDirection(text, 'ru')
      if (dir) slots.moveDirection = dir
      return slots
    },
  },

  // --- Стили-пресеты ---
  {
    intent: 'APPLY_STYLE_PRESET',
    pattern: /(оформи|стил[ьеяю]?).*?(заголов\w*|акцент\w*|приглуш\w*|тускл\w*|неприметн\w*|выделен\w*|подсвет\w*)/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const preset = normalizeStylePreset(text, 'ru')
      if (preset) slots.stylePreset = preset
      return slots
    },
  },

  // --- Форматирование шрифта ---
  {
    intent: 'CHANGE_FONT_WEIGHT',
    pattern: /сделай.*(жирн|полужирн|bold)|выдели\s+жирн|жирн.*шрифт|жирный|убери.*жирн|нормальн.*шрифт/i,
    extractSlots: (text) => ({
      fontWeight: /убери.*жирн|нормальн/i.test(text) ? 'normal' : 'bold',
    }),
  },
  {
    intent: 'CHANGE_FONT_STYLE',
    pattern: /сделай.*(курсив|наклон|italic)|курсивн|наклонн.*шрифт|убери.*курсив/i,
    extractSlots: (text) => ({
      fontStyle: /убери.*курсив/i.test(text) ? 'normal' : 'italic',
    }),
  },
  {
    intent: 'CHANGE_TEXT_ALIGN',
    pattern: /выровняй|выравн|по\s+(центру|правому|левому)|вправо|влево|центр\w*|align/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const align = normalizeTextAlign(text, 'ru')
      if (align) slots.textAlign = align
      return slots
    },
  },

  // --- Добавление элементов ---
  {
    intent: 'ADD_ELEMENT',
    pattern: /добав|создай|создать|поставь|вставь|помести|добавить|создайте|положи/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const elementType = normalizeElementType(text, 'ru')
      if (elementType) slots.elementType = elementType
      const color = normalizeColor(text, 'ru')
      if (color) slots.color = color
      const t = extractTextContent(text)
      if (t) slots.text = t
      return slots
    },
  },

  // --- Изменение цвета ---
  {
    intent: 'CHANGE_COLOR',
    pattern:
      /измени.*цвет|поменяй.*цвет|сделай.*цвет|цвет.*на|покрась|перекрась|сделай.*(красн|синий|синим|голуб|зелён|зелен|жёлт|желт|бел|чёрн|черн|сер|оранж|фиолет|пурпур|сирен|розов|малин|бирюз|коричн)/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const color = normalizeColor(text, 'ru')
      if (color) slots.color = color
      return slots
    },
  },

  // --- Изменение текста ---
  {
    intent: 'CHANGE_TEXT',
    pattern:
      /измени.*текст|поменяй.*текст|текст.*на\s|напиши|переименуй|назови|поставь текст|измени надпись|замени текст|напиши на/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const t = extractTextContent(text)
      if (t) slots.text = t
      return slots
    },
  },

  // --- Изменение размера ---
  {
    intent: 'CHANGE_SIZE',
    pattern: /увелич|уменьш|сделай.*(больш|меньш)|увеличь|уменьши|побольше|поменьше|увеличить|уменьшить/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const dir = normalizeSizeDirection(text, 'ru')
      if (dir) slots.sizeDirection = dir
      return slots
    },
  },

  // --- Выбор элемента ---
  {
    intent: 'SELECT_ELEMENT',
    pattern: /выбери|выбер|выдели|активируй|кликни|возьми|выбрать|нажми|перейди к|фокус/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const index = normalizeIndex(text, 'ru')
      if (index !== undefined) slots.index = index
      const elementType = normalizeElementType(text, 'ru')
      if (elementType) slots.elementType = elementType
      return slots
    },
  },

  // --- Удаление ---
  {
    intent: 'DELETE_ELEMENT',
    pattern: /удали|убери|сотри|снеси|уничтожь|выброси|удалить|убрать|стереть|снести/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const index = normalizeIndex(text, 'ru')
      if (index !== undefined) slots.index = index
      return slots
    },
  },
]
