export type RecognizerState = 'idle' | 'recording' | 'processing'

export type SpeechResult = {
  transcript: string
  isFinal: boolean
  latencyMs: number
}

export type RecognizerConfig = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onResult: (result: SpeechResult) => void
  onStateChange: (state: RecognizerState) => void
  onError: (error: string) => void
}
