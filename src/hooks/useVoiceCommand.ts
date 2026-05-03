import { useState, useCallback } from 'react'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useEditorActions } from './useEditorActions'
import { parseIntent } from '../core/nlu/IntentMatcher'
import { createLogEntry } from '../core/logger/SessionLogger'
import { useEditorStore } from '../store/editorStore'
import { useSettingsStore } from '../store/settingsStore'
import { useSessionStore } from '../store/sessionStore'
import { SCENARIOS } from '../experiment/scenarios'
import type { SupportedLang, ParseResult } from '../core/nlu/types'
import type { ActionResult } from './useEditorActions'
import type { RecognizerState } from '../core/asr/types'

export type CommandFeedback = {
  transcript: string
  parseResult: ParseResult
  actionResult: ActionResult
} | null

export function useVoiceCommand(lang: SupportedLang) {
  const { dispatchIntent } = useEditorActions()
  const editorStore = useEditorStore()
  const { experimentMode } = useSettingsStore()
  const session = useSessionStore()

  const [lastTranscript, setLastTranscript] = useState('')
  const [lastParseResult, setLastParseResult] = useState<ParseResult | null>(null)
  const [lastCommandFeedback, setLastCommandFeedback] = useState<CommandFeedback>(null)

  const handleFinalResult = useCallback(
    ({ transcript, latencyMs }: { transcript: string; latencyMs: number }) => {
      setLastTranscript(transcript)

      const parseResult = parseIntent(transcript, lang)
      setLastParseResult(parseResult)

      let actionResult: ActionResult
      if (parseResult.intent === 'OUT_OF_DOMAIN') {
        actionResult = 'ood'
      } else {
        actionResult = dispatchIntent(parseResult.intent, parseResult.slots)
      }

      setLastCommandFeedback({ transcript, parseResult, actionResult })

      if (!experimentMode || !session.isSessionActive) return

      const entry = createLogEntry({
        participantId: session.participantId,
        sessionId: session.sessionId,
        lang,
        scenario: session.scenario,
        taskIdx: session.currentTaskIdx,
        taskAttempt: session.taskAttempts + 1,
        isFirstAttempt: session.taskAttempts === 0,
        hintUsed: session.hintUsed,
        rawTranscript: transcript,
        latencyMs,
        detectedIntent: parseResult.intent,
        extractedSlots: parseResult.intent === 'OUT_OF_DOMAIN' ? {} : parseResult.slots,
        confidence: parseResult.confidence,
        actionResult,
        elementCount: editorStore.elements.length,
        selectedElementId: editorStore.selectedId,
        taskElapsedMs: session.taskStartTime ? Date.now() - session.taskStartTime : 0,
      })
      session.addLogEntry(entry)

      // Авто-проверка завершения задания по состоянию редактора
      if (actionResult === 'success') {
        const scenario = SCENARIOS[session.scenario]
        const task = scenario.tasks[session.currentTaskIdx]
        if (task?.completionCheck) {
          const edState = { elements: editorStore.elements, selectedId: editorStore.selectedId }
          if (task.completionCheck(edState)) {
            session.markTaskComplete()
          }
        }
      }
    },
    [lang, dispatchIntent, experimentMode, session, editorStore],
  )

  const { state, interimTranscript, isSupported, toggle } = useSpeechRecognition({
    lang,
    onFinalResult: handleFinalResult,
  })

  return {
    micState: state as RecognizerState,
    interimTranscript,
    lastTranscript,
    lastParseResult,
    lastCommandFeedback,
    isSupported,
    toggle,
  }
}
