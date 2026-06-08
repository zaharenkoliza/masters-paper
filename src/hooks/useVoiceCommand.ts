import { useState, useCallback, useEffect, useRef, createElement } from 'react'
import { notifications } from '@mantine/notifications'
import { IconMicrophoneOff } from '@tabler/icons-react'
import { useSpeechRecognition } from './useSpeechRecognition'
import { useEditorActions } from './useEditorActions'
import { parseCommandSequence } from '../core/nlu/IntentMatcher'
import { preloadTransformerModel } from '../core/nlu/TransformerFallback'
import { matchConfirmation } from '../core/nlu/confirmationMatcher'
import { announceAssertive } from '../core/accessibility/A11yAnnouncer'
import { createLogEntry } from '../core/logger/SessionLogger'
import { useEditorStore } from '../store/editorStore'
import { useSettingsStore } from '../store/settingsStore'
import { useSessionStore } from '../store/sessionStore'
import { SCENARIOS } from '../experiment/scenarios'
import type { SupportedLang, ParseResult } from '../core/nlu/types'
import type { ActionResult } from './useEditorActions'
import type { RecognizerState } from '../core/asr/types'

// Сообщения для типичных ошибок распознавания речи (Web Speech API).
// «aborted» сюда не входит — это штатная остановка микрофона самим пользователем.
const RECOGNITION_ERROR_MESSAGES: Record<string, { ru: string; en: string }> = {
  'no-speech': {
    ru: 'Речь не обнаружена. Попробуйте сказать команду ещё раз',
    en: 'No speech detected. Try saying the command again',
  },
  'audio-capture': {
    ru: 'Микрофон недоступен. Проверьте подключение устройства',
    en: 'Microphone unavailable. Check your device connection',
  },
  'not-allowed': {
    ru: 'Доступ к микрофону запрещён. Разрешите его в настройках браузера',
    en: 'Microphone access denied. Allow it in your browser settings',
  },
  'service-not-allowed': {
    ru: 'Доступ к микрофону запрещён. Разрешите его в настройках браузера',
    en: 'Microphone access denied. Allow it in your browser settings',
  },
  network: {
    ru: 'Сетевая ошибка распознавания речи. Проверьте подключение к интернету',
    en: 'Speech recognition network error. Check your internet connection',
  },
}

const DEFAULT_RECOGNITION_ERROR = {
  ru: 'Речь не распознана. Попробуйте сказать команду ещё раз',
  en: "Speech wasn't recognized. Try saying the command again",
}

export type CommandFeedback = {
  transcript: string
  parseResult: ParseResult
  actionResult: ActionResult
} | null

// Распознавание есть, но недостаточно уверенное — ждём от пользователя «да»/«нет»
export type ClarificationState = {
  transcript: string
  result: Extract<ParseResult, { detectedVia: 'clarify' }>
} | null

export function useVoiceCommand(lang: SupportedLang) {
  const { dispatchIntent } = useEditorActions()
  const { experimentMode } = useSettingsStore()
  const session = useSessionStore()

  const [lastTranscript, setLastTranscript] = useState('')
  const [lastParseResult, setLastParseResult] = useState<ParseResult | null>(null)
  const [lastCommandFeedback, setLastCommandFeedback] = useState<CommandFeedback>(null)
  const [clarification, setClarification] = useState<ClarificationState>(null)

  // Дублируем ожидающее подтверждение в ref: handleFinalResult — асинхронный
  // колбэк ASR, и нам нужно читать актуальное значение синхронно, без устаревших замыканий
  const pendingRef = useRef<ClarificationState>(null)

  const setPending = useCallback((next: ClarificationState) => {
    pendingRef.current = next
    setClarification(next)
  }, [])

  // Фоновая загрузка модели через 4 секунды после монтирования
  useEffect(() => {
    const t = setTimeout(preloadTransformerModel, 4000)
    return () => clearTimeout(t)
  }, [])

  const runCommand = useCallback(
    (transcript: string, latencyMs: number, parseResult: ParseResult) => {
      setLastParseResult(parseResult)

      let actionResult: ActionResult
      if (parseResult.intent === 'OUT_OF_DOMAIN') {
        actionResult = 'ood'
      } else {
        actionResult = dispatchIntent(parseResult.intent, parseResult.slots)
      }

      setLastCommandFeedback({ transcript, parseResult, actionResult })

      if (!experimentMode || !session.isSessionActive) return

      // Читаем состояние редактора заново после диспетчинга — в составной
      // команде последующие сегменты меняют его на лету
      const liveState = useEditorStore.getState()

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
        parseResult,
        actionResult,
        elementCount: liveState.elements.length,
        selectedElementId: liveState.selectedId,
        taskElapsedMs: session.taskStartTime ? Date.now() - session.taskStartTime : 0,
      })
      session.addLogEntry(entry)

      if (actionResult === 'success') {
        const scenario = SCENARIOS[session.scenario]
        const task = scenario.tasks[session.currentTaskIdx]
        if (task?.completionCheck) {
          const edState = { elements: liveState.elements, selectedId: liveState.selectedId }
          if (task.completionCheck(edState)) session.markTaskComplete()
        }
      }
    },
    [lang, dispatchIntent, experimentMode, session],
  )

  const handleFinalResult = useCallback(
    async ({ transcript, latencyMs }: { transcript: string; latencyMs: number }) => {
      setLastTranscript(transcript)

      // Если ждём ответа на «вы имели в виду…?» — сначала проверяем, не «да/нет» ли это
      const pending = pendingRef.current
      if (pending) {
        const response = matchConfirmation(transcript, lang)

        if (response === 'yes') {
          setPending(null)
          runCommand(transcript, latencyMs, pending.result)
          return
        }
        if (response === 'no') {
          setPending(null)
          const cancelled: ParseResult = { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0, detectedVia: 'ood' }
          setLastParseResult(cancelled)
          setLastCommandFeedback({ transcript, parseResult: cancelled, actionResult: 'ood' })
          return
        }
        // Не похоже ни на «да», ни на «нет» — отменяем ожидание и обрабатываем как новую фразу
        setPending(null)
      }

      // Каскад: regex → трансформер (если OOD); составные фразы разбиваются на несколько интентов.
      // Оборачиваем в try/catch: пользователь — особенно незрячий — не видит консоль,
      // и любая необработанная ошибка здесь означает «команда вообще никак не отреагировала»
      let parseResults: ParseResult[]
      try {
        parseResults = await parseCommandSequence(transcript, lang)
      } catch (err) {
        console.warn('Command parsing failed:', err)
        const failed: ParseResult = { intent: 'OUT_OF_DOMAIN', slots: {}, confidence: 0, detectedVia: 'ood' }
        setLastParseResult(failed)
        setLastCommandFeedback({ transcript, parseResult: failed, actionResult: 'ood' })
        return
      }

      for (const parseResult of parseResults) {
        if (parseResult.detectedVia === 'clarify') {
          setLastParseResult(parseResult)
          setLastCommandFeedback(null)
          setPending({ transcript, result: parseResult })
          return
        }

        runCommand(transcript, latencyMs, parseResult)
      }
    },
    [lang, runCommand, setPending],
  )

  // Распознавание речи иногда не даёт результата вовсе (тишина, незнакомый акцент,
  // нет доступа к микрофону) — без этого обработчика пользователь не получал
  // никакой обратной связи и решал, что приложение зависло
  const handleRecognitionError = useCallback(
    (error: string) => {
      if (error === 'aborted') return // штатная остановка микрофона пользователем

      const messages = RECOGNITION_ERROR_MESSAGES[error] ?? DEFAULT_RECOGNITION_ERROR
      const message = lang === 'ru' ? messages.ru : messages.en

      notifications.show({
        message,
        color: 'orange',
        icon: createElement(IconMicrophoneOff, { size: 16 }),
        autoClose: 3000,
        position: 'bottom-right',
      })
      announceAssertive(message)
    },
    [lang],
  )

  const { state, interimTranscript, isSupported, toggle } = useSpeechRecognition({
    lang,
    onFinalResult: handleFinalResult,
    onRecognitionError: handleRecognitionError,
  })

  return {
    micState: state as RecognizerState,
    interimTranscript,
    lastTranscript,
    lastParseResult,
    lastCommandFeedback,
    clarification,
    isSupported,
    toggle,
  }
}
