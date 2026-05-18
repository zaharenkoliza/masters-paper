import { Stack, Text, Badge, Group, Alert } from '@mantine/core'
import { IconAlertCircle, IconBrain, IconCode } from '@tabler/icons-react'
import type { ParseResult } from '../../core/nlu/types'

type Props = {
  transcript: string
  interimTranscript: string
  parseResult: ParseResult | null
  isSupported: boolean
}

const INTENT_LABELS: Record<string, string> = {
  ADD_ELEMENT:        'Добавить',
  CHANGE_COLOR:       'Изменить цвет',
  CHANGE_TEXT:        'Изменить текст',
  CHANGE_SIZE:        'Изменить размер',
  CHANGE_FONT_WEIGHT: 'Начертание',
  CHANGE_FONT_STYLE:  'Стиль шрифта',
  CHANGE_TEXT_ALIGN:  'Выравнивание',
  DELETE_ELEMENT:     'Удалить',
  SELECT_ELEMENT:     'Выбрать',
  UNDO:               'Отмена',
  CLEAR_ALL:          'Очистить всё',
  OUT_OF_DOMAIN:      'Не распознано',
}

export function TranscriptDisplay({ transcript, interimTranscript, parseResult, isSupported }: Props) {
  const displayText = interimTranscript || transcript

  return (
    <Stack gap="xs">
      {!isSupported && (
        <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
          Web Speech API поддерживается только в Chrome.
        </Alert>
      )}

      <Text size="sm" c="dimmed" mih={20}>
        {displayText ? (
          <Text
            span
            c={interimTranscript ? 'dimmed' : 'dark'}
            fs={interimTranscript ? 'italic' : 'normal'}
          >
            {displayText}
          </Text>
        ) : (
          <Text span c="dimmed">Нажмите на микрофон или Space для записи</Text>
        )}
      </Text>

      {parseResult && (
        <Group gap="xs">
          {/* Интент */}
          <Badge
            color={parseResult.intent === 'OUT_OF_DOMAIN' ? 'red' : 'blue'}
            variant="light"
            size="sm"
          >
            {INTENT_LABELS[parseResult.intent] ?? parseResult.intent}
          </Badge>

          {/* Источник: regex или трансформер */}
          {parseResult.intent !== 'OUT_OF_DOMAIN' && (
            <Badge
              color={parseResult.detectedVia === 'transformer' ? 'violet' : 'gray'}
              variant="outline"
              size="sm"
              leftSection={
                parseResult.detectedVia === 'transformer'
                  ? <IconBrain size={10} />
                  : <IconCode size={10} />
              }
            >
              {parseResult.detectedVia === 'transformer'
                ? `NLP ${Math.round((parseResult as { transformerScore: number }).transformerScore * 100)}%`
                : 'regex'}
            </Badge>
          )}

          {/* Слоты */}
          {parseResult.intent !== 'OUT_OF_DOMAIN' &&
            Object.entries(parseResult.slots).map(([key, value]) => (
              <Badge key={key} color="teal" variant="outline" size="sm">
                {key}: {String(value)}
              </Badge>
            ))}
        </Group>
      )}
    </Stack>
  )
}
