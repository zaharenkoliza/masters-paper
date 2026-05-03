import { Box, Center, Stack, Text } from '@mantine/core'
import { IconMicrophone } from '@tabler/icons-react'
import { useEditorStore } from '../../store/editorStore'
import { CanvasElement } from './CanvasElement'

export function Workspace() {
  const { elements, selectedId, selectElement } = useEditorStore()

  if (elements.length === 0) {
    return (
      <Center h="100%" style={{ flexGrow: 1 }}>
        <Stack align="center" gap="xs" c="dimmed">
          <IconMicrophone size={48} stroke={1} />
          <Text size="lg" fw={500}>Холст пуст</Text>
          <Text size="sm">Скажите: «Добавь синюю кнопку» или «Add a red button»</Text>
        </Stack>
      </Center>
    )
  }

  return (
    <Box
      p="md"
      style={{
        flexGrow: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignContent: 'flex-start',
        minHeight: 200,
      }}
      role="region"
      aria-label="Рабочая область"
    >
      {elements.map((el) => (
        <CanvasElement
          key={el.id}
          element={el}
          isSelected={el.id === selectedId}
          onClick={() => selectElement(el.id === selectedId ? null : el.id)}
        />
      ))}
    </Box>
  )
}
