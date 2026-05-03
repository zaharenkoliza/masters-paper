import type { RecognizerConfig, RecognizerState } from './types'

type WebSpeechAPI = typeof window & {
  SpeechRecognition?: new () => SpeechRecognition
  webkitSpeechRecognition?: new () => SpeechRecognition
}

export function isSpeechRecognitionSupported(): boolean {
  const w = window as WebSpeechAPI
  return !!(w.SpeechRecognition ?? w.webkitSpeechRecognition)
}

export class SpeechRecognizer {
  private recognition: SpeechRecognition | null = null
  private config: RecognizerConfig
  private state: RecognizerState = 'idle'
  private startTime = 0

  constructor(config: RecognizerConfig) {
    this.config = config
    this.init()
  }

  private init(): void {
    const w = window as WebSpeechAPI
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Ctor) return

    this.recognition = new Ctor()
    this.recognition.lang = this.config.lang
    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults

    this.recognition.onstart = () => {
      this.setState('recording')
      this.startTime = Date.now()
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      this.setState('processing')
      const result = event.results[event.results.length - 1]
      if (!result) return
      const transcript = result[0]?.transcript ?? ''
      const isFinal = result.isFinal
      this.config.onResult({
        transcript,
        isFinal,
        latencyMs: Date.now() - this.startTime,
      })
      if (isFinal) this.setState('idle')
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.setState('idle')
      this.config.onError(event.error)
    }

    this.recognition.onend = () => {
      if (this.state !== 'idle') this.setState('idle')
    }
  }

  private setState(state: RecognizerState): void {
    if (this.state === state) return
    this.state = state
    this.config.onStateChange(state)
  }

  setLang(lang: string): void {
    if (this.recognition) this.recognition.lang = lang
  }

  start(): void {
    if (!this.recognition) {
      this.config.onError('not_supported')
      return
    }
    if (this.state === 'idle') {
      this.recognition.start()
    }
  }

  stop(): void {
    if (this.recognition && this.state !== 'idle') {
      this.recognition.stop()
    }
  }

  getState(): RecognizerState {
    return this.state
  }
}
