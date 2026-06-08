import { useEffect, useRef, useState, useCallback } from 'react'
import { SpeechRecognizer, isSpeechRecognitionSupported } from '../core/asr'
import type { RecognizerState, SpeechResult } from '../core/asr'
import type { SupportedLang } from '../core/nlu/types'

const LANG_MAP: Record<SupportedLang, string> = {
  ru: 'ru-RU',
  en: 'en-US',
}

type UseSpeechRecognitionOptions = {
  lang: SupportedLang
  onFinalResult: (result: SpeechResult) => void | Promise<void>
  onRecognitionError?: (error: string) => void
}

export function useSpeechRecognition({ lang, onFinalResult, onRecognitionError }: UseSpeechRecognitionOptions) {
  const [state, setState] = useState<RecognizerState>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const isSupported = isSpeechRecognitionSupported()

  const onFinalRef = useRef(onFinalResult)
  onFinalRef.current = onFinalResult

  const onErrorRef = useRef(onRecognitionError)
  onErrorRef.current = onRecognitionError

  const recognizerRef = useRef<SpeechRecognizer | null>(null)

  useEffect(() => {
    if (!isSupported) return

    recognizerRef.current = new SpeechRecognizer({
      lang: LANG_MAP[lang],
      continuous: false,
      interimResults: true,
      onResult: (result) => {
        if (result.isFinal) {
          setInterimTranscript('')
          onFinalRef.current(result)
        } else {
          setInterimTranscript(result.transcript)
        }
      },
      onStateChange: setState,
      onError: (err) => {
        console.warn('ASR error:', err)
        setState('idle')
        setInterimTranscript('')
        onErrorRef.current?.(err)
      },
    })

    return () => {
      recognizerRef.current?.stop()
      recognizerRef.current = null
    }
  }, [isSupported, lang])

  useEffect(() => {
    recognizerRef.current?.setLang(LANG_MAP[lang])
  }, [lang])

  const toggle = useCallback(() => {
    const r = recognizerRef.current
    if (!r) return
    if (r.getState() === 'idle') r.start()
    else r.stop()
  }, [])

  return { state, interimTranscript, isSupported, toggle }
}
