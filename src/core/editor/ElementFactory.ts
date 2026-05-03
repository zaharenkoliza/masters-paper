import type { CanvasElement, ElementType } from './types'
import type { Slots } from '../nlu/types'

const DEFAULT_TEXTS: Record<ElementType, string> = {
  button: 'Кнопка',
  heading: 'Заголовок',
  input: '',
  text: 'Текст',
  container: '',
}

const DEFAULT_COLORS: Record<ElementType, string | null> = {
  button: '#3b82f6',
  heading: null,
  input: null,
  text: null,
  container: null,
}

const DEFAULT_FONT_SIZES: Record<ElementType, number> = {
  button: 14,
  heading: 24,
  input: 14,
  text: 14,
  container: 14,
}

export function createElement(type: ElementType, slots: Partial<Slots>): CanvasElement {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    text: slots.text ?? DEFAULT_TEXTS[type],
    color: slots.color ?? DEFAULT_COLORS[type],
    fontSize: DEFAULT_FONT_SIZES[type],
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    createdAt: Date.now(),
  }
}
