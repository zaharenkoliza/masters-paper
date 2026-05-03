import type { IntentPattern } from './types'
import {
  normalizeColor,
  normalizeElementType,
  normalizeSizeDirection,
  normalizeIndex,
  normalizeTextAlign,
  extractTextContent,
} from '../normalizers'

export const enPatterns: IntentPattern[] = [
  {
    intent: 'CLEAR_ALL',
    pattern: /clear\s+all|delete\s+all|remove\s+all|\breset\b|start\s+over|wipe\s+(it\s+)?all/i,
    extractSlots: () => ({}),
  },
  {
    intent: 'UNDO',
    pattern: /\bundo\b|\brevert\b|go\s+back|step\s+back/i,
    extractSlots: () => ({}),
  },

  // --- Font formatting ---
  {
    intent: 'CHANGE_FONT_WEIGHT',
    pattern: /make.*(bold|boldface)|bold(en)?|set.*bold|remove.*bold|normal.*weight/i,
    extractSlots: (text) => ({
      fontWeight: /remove.*bold|normal.*weight/i.test(text) ? 'normal' : 'bold',
    }),
  },
  {
    intent: 'CHANGE_FONT_STYLE',
    pattern: /make.*italic|italicize|\bitalic\b|set.*italic|remove.*italic/i,
    extractSlots: (text) => ({
      fontStyle: /remove.*italic/i.test(text) ? 'normal' : 'italic',
    }),
  },
  {
    intent: 'CHANGE_TEXT_ALIGN',
    pattern: /align|text.*align|justify|\bcenter\b|\bcentre\b|align.*right|align.*left/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const align = normalizeTextAlign(text, 'en')
      if (align) slots.textAlign = align
      return slots
    },
  },

  // --- Add ---
  {
    intent: 'ADD_ELEMENT',
    pattern: /\badd\b|\bcreate\b|\binsert\b|\bplace\b|\bput\b|make\s+a\b|\bnew\b.*\b(button|heading|input|text|container)\b/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const elementType = normalizeElementType(text, 'en')
      if (elementType) slots.elementType = elementType
      const color = normalizeColor(text, 'en')
      if (color) slots.color = color
      const t = extractTextContent(text)
      if (t) slots.text = t
      return slots
    },
  },

  // --- Color ---
  {
    intent: 'CHANGE_COLOR',
    pattern:
      /change.*color|make.*color|set.*color|color.*to|paint|make\s+(it\s+)?(red|blue|green|yellow|white|black|gray|grey|orange|purple|violet|pink|teal|brown|crimson|navy)/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const color = normalizeColor(text, 'en')
      if (color) slots.color = color
      return slots
    },
  },

  // --- Text ---
  {
    intent: 'CHANGE_TEXT',
    pattern: /change.*text|set.*text|text.*to|rename|relabel|\blabel\b|\bwrite\b|call\s+it|say/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const t = extractTextContent(text)
      if (t) slots.text = t
      return slots
    },
  },

  // --- Size ---
  {
    intent: 'CHANGE_SIZE',
    pattern: /make.*(bigger|larger|smaller|tinier)|increase\s+size|decrease\s+size|enlarge|shrink|font.*size|size.*up|size.*down/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const dir = normalizeSizeDirection(text, 'en')
      if (dir) slots.sizeDirection = dir
      return slots
    },
  },

  // --- Select ---
  {
    intent: 'SELECT_ELEMENT',
    pattern: /\bselect\b|\bchoose\b|\bpick\b|\bclick\b|\bfocus\b|\bgrab\b|\bactivate\b/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const index = normalizeIndex(text, 'en')
      if (index !== undefined) slots.index = index
      const elementType = normalizeElementType(text, 'en')
      if (elementType) slots.elementType = elementType
      return slots
    },
  },

  // --- Delete ---
  {
    intent: 'DELETE_ELEMENT',
    pattern: /\bdelete\b|\bremove\b|\berase\b|\bdestroy\b|get\s+rid\s+of|\bdrop\b|\bkill\b/i,
    extractSlots: (text) => {
      const slots: ReturnType<IntentPattern['extractSlots']> = {}
      const index = normalizeIndex(text, 'en')
      if (index !== undefined) slots.index = index
      return slots
    },
  },
]
