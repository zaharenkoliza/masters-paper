import type { SessionSummary } from '../types'
import type { LogEntry } from '../types'

const COLUMNS: (keyof LogEntry)[] = [
  'participantId', 'sessionId', 'timestamp', 'lang', 'scenario',
  'taskIdx', 'taskAttempt', 'isFirstAttempt', 'inputMode', 'hintUsed',
  'rawTranscript', 'transcriptWordCount', 'latencyMs',
  'detectedIntent', 'confidence', 'wer', 'referenceText',
  'actionResult', 'errorType',
  'elementCount', 'selectedElementId', 'taskElapsedMs',
]

export function exportToCsv(summary: SessionSummary): void {
  const header = COLUMNS.join(',')
  const rows = summary.entries.map((e) =>
    COLUMNS.map((col) => {
      const val = e[col]
      if (val === null || val === undefined) return ''
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      // Escape commas and quotes
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(','),
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, `voicecanvas_${summary.participantId}_s${summary.scenario}_${formatDate()}.csv`)
}

function formatDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
