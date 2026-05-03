import type { LogEntry, ErrorBreakdown, SessionSummary } from './types'
import type { KnownIntent, SupportedLang } from '../nlu/types'

// Эталонные фразы для WER (самые короткие варианты каждого intent)
const REFERENCE: Record<KnownIntent, Record<SupportedLang, string>> = {
  ADD_ELEMENT:       { ru: 'добавь кнопку',         en: 'add button' },
  CHANGE_COLOR:      { ru: 'сделай синим',           en: 'make it blue' },
  CHANGE_TEXT:       { ru: 'измени текст',           en: 'change text' },
  CHANGE_SIZE:       { ru: 'увеличь',                en: 'make bigger' },
  CHANGE_FONT_WEIGHT:{ ru: 'сделай жирным',         en: 'make bold' },
  CHANGE_FONT_STYLE: { ru: 'сделай курсивом',       en: 'make italic' },
  CHANGE_TEXT_ALIGN: { ru: 'по центру',              en: 'align center' },
  DELETE_ELEMENT:    { ru: 'удали',                  en: 'delete' },
  SELECT_ELEMENT:    { ru: 'выбери первый',          en: 'select first' },
  UNDO:              { ru: 'отмена',                 en: 'undo' },
  CLEAR_ALL:         { ru: 'очисти всё',             en: 'clear all' },
}

export function getReferenceText(intent: KnownIntent, lang: SupportedLang): string {
  return REFERENCE[intent][lang]
}

// WER через расстояние Левенштейна на уровне слов
export function calculateWER(hypothesis: string, reference: string): number {
  const hyp = hypothesis.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const ref = reference.toLowerCase().trim().split(/\s+/).filter(Boolean)

  if (ref.length === 0) return 0
  if (hyp.length === 0) return 1

  const m = ref.length
  const n = hyp.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  )

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ref[i - 1] === hyp[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!
      } else {
        dp[i]![j] = 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!)
      }
    }
  }

  return Math.min(dp[m]![n]! / m, 1)
}

// Task Success Rate — доля заданий, выполненных хотя бы раз
export function calculateTSR(entries: LogEntry[]): number {
  const taskIds = new Set(entries.map((e) => `${e.scenario}-${e.taskIdx}`))
  if (taskIds.size === 0) return 0
  const succeeded = new Set(
    entries
      .filter((e) => e.actionResult === 'success')
      .map((e) => `${e.scenario}-${e.taskIdx}`),
  )
  return succeeded.size / taskIds.size
}

// First Attempt Success Rate — доля заданий, выполненных с первой попытки
export function calculateFASR(entries: LogEntry[]): number {
  const taskIds = new Set(entries.map((e) => `${e.scenario}-${e.taskIdx}`))
  if (taskIds.size === 0) return 0
  const firstAttemptSuccess = new Set(
    entries
      .filter((e) => e.isFirstAttempt && e.actionResult === 'success')
      .map((e) => `${e.scenario}-${e.taskIdx}`),
  )
  return firstAttemptSuccess.size / taskIds.size
}

// Среднее количество попыток на задание
export function calculateRetryRate(entries: LogEntry[]): number {
  const taskMap = new Map<string, number>()
  for (const e of entries) {
    const key = `${e.scenario}-${e.taskIdx}`
    taskMap.set(key, Math.max(taskMap.get(key) ?? 0, e.taskAttempt))
  }
  if (taskMap.size === 0) return 0
  const total = [...taskMap.values()].reduce((a, b) => a + b, 0)
  return total / taskMap.size
}

// Доля out-of-domain команд
export function calculateOODRate(entries: LogEntry[]): number {
  if (entries.length === 0) return 0
  return entries.filter((e) => e.actionResult === 'ood').length / entries.length
}

// Средняя латентность мс
export function calculateAvgLatency(entries: LogEntry[]): number {
  const voice = entries.filter((e) => e.inputMode === 'voice' && e.latencyMs > 0)
  if (voice.length === 0) return 0
  return voice.reduce((a, e) => a + e.latencyMs, 0) / voice.length
}

// Средний WER по успешным командам
export function calculateAvgWer(entries: LogEntry[]): number {
  const relevant = entries.filter((e) => e.actionResult === 'success' && e.wer >= 0)
  if (relevant.length === 0) return 0
  return relevant.reduce((a, e) => a + e.wer, 0) / relevant.length
}

export function getErrorBreakdown(entries: LogEntry[]): ErrorBreakdown {
  return entries.reduce<ErrorBreakdown>(
    (acc, e) => {
      if (e.errorType) acc[e.errorType]++
      return acc
    },
    { asr: 0, nlu: 0, system: 0, out_of_domain: 0 },
  )
}

export function buildSessionSummary(
  entries: LogEntry[],
  taskTimes: number[],
): SessionSummary {
  const first = entries[0]
  return {
    participantId: first?.participantId ?? '',
    sessionId: first?.sessionId ?? '',
    scenario: (first?.scenario ?? 1) as 1 | 2 | 3,
    lang: first?.lang ?? 'ru',
    totalCommands: entries.length,
    successCount: entries.filter((e) => e.actionResult === 'success').length,
    failCount: entries.filter((e) => e.actionResult === 'fail').length,
    oodCount: entries.filter((e) => e.actionResult === 'ood').length,
    tsr: calculateTSR(entries),
    fasr: calculateFASR(entries),
    retryRate: calculateRetryRate(entries),
    oodRate: calculateOODRate(entries),
    avgLatencyMs: calculateAvgLatency(entries),
    avgWer: calculateAvgWer(entries),
    errorBreakdown: getErrorBreakdown(entries),
    taskTimes,
    entries,
  }
}
