import type { KnownIntent, Slots } from '../types'

export type SlotExtractor = (text: string) => Partial<Slots>

export type IntentPattern = {
  intent: KnownIntent
  pattern: RegExp
  extractSlots: SlotExtractor
}
