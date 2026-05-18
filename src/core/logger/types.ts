import type { KnownIntent, Slots, SupportedLang } from '../nlu/types'

export type { KnownIntent, SupportedLang }

export type LogEntry = {
  // Идентификация
  participantId: string
  sessionId: string
  timestamp: string           // ISO 8601

  // Контекст
  lang: SupportedLang
  scenario: 1 | 2 | 3
  taskIdx: number
  taskAttempt: number         // номер попытки для данного задания
  isFirstAttempt: boolean
  inputMode: 'voice' | 'mouse'
  hintUsed: boolean

  // ASR
  rawTranscript: string
  transcriptWordCount: number
  latencyMs: number

  // NLU
  detectedIntent: KnownIntent | 'OUT_OF_DOMAIN'
  detectedVia: 'regex' | 'transformer' | 'ood'
  extractedSlots: Partial<Slots>
  missedSlots: (keyof Slots)[]
  confidence: number
  transformerScore: number | null
  wer: number
  referenceText: string

  // Результат
  actionResult: 'success' | 'fail' | 'ood'
  errorType: 'asr' | 'nlu' | 'system' | 'out_of_domain' | null

  // Состояние редактора после действия
  elementCount: number
  selectedElementId: string | null
  taskElapsedMs: number
}

export type ErrorBreakdown = {
  asr: number
  nlu: number
  system: number
  out_of_domain: number
}

export type SessionSummary = {
  participantId: string
  sessionId: string
  scenario: 1 | 2 | 3
  lang: SupportedLang
  totalCommands: number
  successCount: number
  failCount: number
  oodCount: number
  tsr: number
  fasr: number
  retryRate: number
  oodRate: number
  avgLatencyMs: number
  avgWer: number
  errorBreakdown: ErrorBreakdown
  taskTimes: number[]
  entries: LogEntry[]
}
