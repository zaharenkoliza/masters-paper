import type { LogEntry } from './types'
import type { KnownIntent, Slots, SupportedLang } from '../nlu/types'
import type { ParseResult } from '../nlu/types'
import { calculateWER, getReferenceText } from './MetricsCalculator'

export type CreateEntryParams = {
  participantId: string
  sessionId: string
  lang: SupportedLang
  scenario: 1 | 2 | 3
  taskIdx: number
  taskAttempt: number
  isFirstAttempt: boolean
  hintUsed: boolean

  rawTranscript: string
  latencyMs: number

  parseResult: ParseResult

  actionResult: 'success' | 'fail' | 'ood'
  elementCount: number
  selectedElementId: string | null
  taskElapsedMs: number
}

export function createLogEntry(p: CreateEntryParams): LogEntry {
  const words = p.rawTranscript.trim().split(/\s+/).filter(Boolean)
  const { parseResult } = p

  const detectedIntent = parseResult.intent
  const detectedVia = parseResult.detectedVia
  const extractedSlots = detectedIntent === 'OUT_OF_DOMAIN' ? {} : parseResult.slots
  const confidence = parseResult.confidence
  const transformerScore = 'transformerScore' in parseResult ? (parseResult.transformerScore ?? null) : null

  let wer = 0
  let referenceText = ''
  if (detectedIntent !== 'OUT_OF_DOMAIN') {
    referenceText = getReferenceText(detectedIntent, p.lang)
    wer = calculateWER(p.rawTranscript, referenceText)
  }

  const expectedSlots = getExpectedSlots(detectedIntent)
  const missedSlots = expectedSlots.filter(
    (s) => !(s in extractedSlots) || extractedSlots[s as keyof Slots] === undefined,
  ) as (keyof Slots)[]

  const errorType = resolveErrorType(detectedIntent, p.actionResult, missedSlots)

  return {
    participantId: p.participantId,
    sessionId: p.sessionId,
    timestamp: new Date().toISOString(),
    lang: p.lang,
    scenario: p.scenario,
    taskIdx: p.taskIdx,
    taskAttempt: p.taskAttempt,
    isFirstAttempt: p.isFirstAttempt,
    inputMode: 'voice',
    hintUsed: p.hintUsed,
    rawTranscript: p.rawTranscript,
    transcriptWordCount: words.length,
    latencyMs: p.latencyMs,
    detectedIntent,
    detectedVia,
    extractedSlots,
    missedSlots,
    confidence,
    transformerScore,
    wer,
    referenceText,
    actionResult: p.actionResult,
    errorType,
    elementCount: p.elementCount,
    selectedElementId: p.selectedElementId,
    taskElapsedMs: p.taskElapsedMs,
  }
}

function getExpectedSlots(intent: KnownIntent | 'OUT_OF_DOMAIN'): string[] {
  switch (intent) {
    case 'ADD_ELEMENT':        return ['elementType']
    case 'CHANGE_COLOR':       return ['color']
    case 'CHANGE_TEXT':        return ['text']
    case 'CHANGE_SIZE':        return ['sizeDirection']
    case 'CHANGE_FONT_WEIGHT': return ['fontWeight']
    case 'CHANGE_FONT_STYLE':  return ['fontStyle']
    case 'CHANGE_TEXT_ALIGN':  return ['textAlign']
    case 'SELECT_ELEMENT':     return ['index']
    default:                   return []
  }
}

function resolveErrorType(
  intent: KnownIntent | 'OUT_OF_DOMAIN',
  actionResult: 'success' | 'fail' | 'ood',
  missedSlots: string[],
): LogEntry['errorType'] {
  if (actionResult === 'success') return null
  if (intent === 'OUT_OF_DOMAIN') return 'out_of_domain'
  if (missedSlots.length > 0) return 'nlu'
  return 'system'
}
