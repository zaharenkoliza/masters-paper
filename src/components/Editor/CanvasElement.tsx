import { Box, Button, TextInput, Text, Paper } from '@mantine/core'
import type { CanvasElement as CanvasElementType } from '../../core/editor/types'

type Props = {
  element: CanvasElementType
  isSelected: boolean
  onClick: () => void
}

export function CanvasElement({ element, isSelected, onClick }: Props) {
  const outlineStyle = isSelected
    ? { outline: '2px solid var(--mantine-color-blue-5)', outlineOffset: 2 }
    : {}

  const groupStyle = element.groupId
    ? { boxShadow: '0 0 0 2px var(--mantine-color-teal-4)', borderRadius: 4 }
    : {}

  const commonStyle = {
    cursor: 'pointer',
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textAlign: element.textAlign,
    fontSize: element.fontSize,
    ...groupStyle,
    ...outlineStyle,
  } as const

  switch (element.type) {
    case 'button':
      return (
        <Button
          onClick={onClick}
          style={{ ...commonStyle, backgroundColor: element.color ?? undefined }}
          aria-label={`Кнопка: ${element.text}`}
          aria-selected={isSelected}
        >
          {element.text}
        </Button>
      )

    case 'heading':
      return (
        <Text
          component="h2"
          onClick={onClick}
          style={{ ...commonStyle, color: element.color ?? undefined, margin: 0 }}
          aria-label={`Заголовок: ${element.text}`}
          aria-selected={isSelected}
        >
          {element.text}
        </Text>
      )

    case 'input':
      return (
        <Box onClick={onClick} style={{ ...groupStyle, ...outlineStyle }}>
          <TextInput
            placeholder={element.text || 'Поле ввода'}
            readOnly
            style={{ fontSize: element.fontSize }}
            aria-label="Поле ввода"
          />
        </Box>
      )

    case 'text':
      return (
        <Text
          onClick={onClick}
          style={{ ...commonStyle, color: element.color ?? undefined }}
          aria-label={`Текст: ${element.text}`}
          aria-selected={isSelected}
        >
          {element.text}
        </Text>
      )

    case 'container':
      return (
        <Paper
          onClick={onClick}
          p="md"
          withBorder
          style={{ ...commonStyle, minWidth: 120, minHeight: 60, backgroundColor: element.color ?? undefined }}
          aria-label="Контейнер"
          aria-selected={isSelected}
        >
          <Text size="xs" c="dimmed">Контейнер</Text>
        </Paper>
      )
  }
}
