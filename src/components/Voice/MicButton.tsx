import { ActionIcon, Tooltip } from '@mantine/core'
import { IconMicrophone, IconMicrophoneOff, IconLoader } from '@tabler/icons-react'
import type { RecognizerState } from '../../core/asr/types'

type Props = {
  state: RecognizerState
  onToggle: () => void
  disabled?: boolean
}

const LABELS: Record<RecognizerState, string> = {
  idle: 'Начать запись (Space)',
  recording: 'Остановить запись (Space)',
  processing: 'Обработка...',
}

export function MicButton({ state, onToggle, disabled }: Props) {
  const isRecording = state === 'recording'
  const isProcessing = state === 'processing'

  return (
    <Tooltip label={LABELS[state]} position="top">
      <ActionIcon
        size={64}
        radius="xl"
        variant={isRecording ? 'filled' : 'light'}
        color={isRecording ? 'red' : 'blue'}
        onClick={onToggle}
        disabled={disabled || isProcessing}
        aria-label={LABELS[state]}
        aria-pressed={isRecording}
        style={{
          animation: isRecording ? 'pulse 1.2s ease-in-out infinite' : undefined,
        }}
      >
        {isProcessing ? (
          <IconLoader size={28} style={{ animation: 'spin 1s linear infinite' }} />
        ) : isRecording ? (
          <IconMicrophoneOff size={28} />
        ) : (
          <IconMicrophone size={28} />
        )}
      </ActionIcon>
    </Tooltip>
  )
}
