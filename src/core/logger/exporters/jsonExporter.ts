import type { SessionSummary } from '../types'

export function exportToJson(summary: SessionSummary): void {
  const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `voicecanvas_${summary.participantId}_s${summary.scenario}_${formatDate()}.json`)
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
