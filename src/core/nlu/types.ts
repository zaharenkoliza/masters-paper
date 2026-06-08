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
  | 'DUPLICATE_ELEMENT'
  | 'MOVE_ELEMENT'
  | 'APPLY_STYLE_PRESET'
  | 'GROUP_ELEMENTS'
  | 'UNGROUP_ELEMENT'

export type StylePreset = 'heading' | 'accent' | 'subtle' | 'highlight'

export type Slots = {
  elementType: ElementType
  color: string
  text: string
  sizeDirection: 'bigger' | 'smaller'
  index: number | 'first' | 'last'
  fontWeight: 'bold' | 'normal'
  fontStyle: 'italic' | 'normal'
  textAlign: 'left' | 'center' | 'right'
  moveDirection: 'left' | 'right' | 'start' | 'end'
  stylePreset: StylePreset
  groupSize: number
}

export type DetectedVia = 'regex' | 'clarify' | 'ood'

export type ParseResult =
  | { intent: KnownIntent; slots: Partial<Slots>; confidence: 1; detectedVia: 'regex' }
  // Трансформер нашёл совпадение, но его уверенность ненадёжна как сигнал для авто-выполнения
  // (см. confirmationMatcher) — поэтому ЛЮБОЕ совпадение трансформера требует подтверждения
  // пользователя («вы имели в виду…?»), а не выполняется само по себе
  | { intent: KnownIntent; slots: Partial<Slots>; confidence: number; detectedVia: 'clarify'; transformerScore: number }
  | { intent: 'OUT_OF_DOMAIN'; slots: Record<string, never>; confidence: 0; detectedVia: 'ood'; transformerScore?: number }
