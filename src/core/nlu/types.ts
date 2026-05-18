export type SupportedLang = 'ru' | 'en'

export type ElementType = 'button' | 'heading' | 'input' | 'text' | 'container'

export type KnownIntent =
  | 'ADD_ELEMENT'
  | 'CHANGE_COLOR'
  | 'CHANGE_TEXT'
  | 'CHANGE_SIZE'
  | 'DELETE_ELEMENT'
  | 'SELECT_ELEMENT'
  | 'UNDO'
  | 'CLEAR_ALL'
  | 'CHANGE_FONT_WEIGHT'
  | 'CHANGE_FONT_STYLE'
  | 'CHANGE_TEXT_ALIGN'

export type Slots = {
  elementType: ElementType
  color: string
  text: string
  sizeDirection: 'bigger' | 'smaller'
  index: number | 'first' | 'last'
  fontWeight: 'bold' | 'normal'
  fontStyle: 'italic' | 'normal'
  textAlign: 'left' | 'center' | 'right'
}

export type DetectedVia = 'regex' | 'transformer' | 'ood'

export type ParseResult =
  | { intent: KnownIntent; slots: Partial<Slots>; confidence: 1; detectedVia: 'regex' }
  | { intent: KnownIntent; slots: Partial<Slots>; confidence: number; detectedVia: 'transformer'; transformerScore: number }
  | { intent: 'OUT_OF_DOMAIN'; slots: Record<string, never>; confidence: 0; detectedVia: 'ood'; transformerScore?: number }
