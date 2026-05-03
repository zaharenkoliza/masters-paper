import { useState } from 'react'
import { Card, Text, Group, Badge, Button, Collapse, Stack } from '@mantine/core'
import { IconCheck, IconBulb, IconPlayerPlay, IconArrowRight } from '@tabler/icons-react'
import type { Task } from '../../experiment/scenarios/types'
import type { SupportedLang } from '../../core/nlu/types'

type Props = {
  task: Task
  index: number
  isActive: boolean
  isCompleted: boolean
  lang: SupportedLang
  onStart: () => void
  onDone: () => void
  onHint: () => void
  hintUsed: boolean
  attempts: number
}

export function TaskCard({
  task,
  index,
  isActive,
  isCompleted,
  lang,
  onStart,
  onDone,
  onHint,
  hintUsed,
  attempts,
}: Props) {
  const [hintOpen, setHintOpen] = useState(false)

  const handleHint = () => {
    setHintOpen(true)
    onHint()
  }

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        opacity: isCompleted ? 0.6 : 1,
        borderColor: isActive ? 'var(--mantine-color-blue-5)' : undefined,
        borderWidth: isActive ? 2 : 1,
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Badge
              size="sm"
              variant={isCompleted ? 'filled' : isActive ? 'light' : 'outline'}
              color={isCompleted ? 'green' : isActive ? 'blue' : 'gray'}
              w={24}
              style={{ flexShrink: 0 }}
            >
              {isCompleted ? <IconCheck size={10} /> : index + 1}
            </Badge>
            <Text
              size="sm"
              fw={isActive ? 600 : 400}
              c={isCompleted ? 'dimmed' : 'default'}
              style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}
            >
              {task.instruction[lang]}
            </Text>
          </Group>
        </Group>

        {isActive && !isCompleted && (
          <>
            {attempts > 0 && (
              <Text size="xs" c="dimmed">Попыток: {attempts}</Text>
            )}

            <Collapse in={hintOpen}>
              <Card withBorder p="xs" radius="sm" bg="yellow.0">
                <Group gap="xs">
                  <IconBulb size={14} style={{ color: 'var(--mantine-color-yellow-7)' }} />
                  <Text size="xs">{task.hint[lang]}</Text>
                </Group>
              </Card>
            </Collapse>

            <Group gap="xs">
              {!hintOpen && (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="yellow"
                  leftSection={<IconBulb size={12} />}
                  onClick={handleHint}
                  aria-label="Показать подсказку"
                >
                  {hintUsed ? 'Подсказка' : 'Подсказка'}
                </Button>
              )}
              <Button
                size="compact-xs"
                variant="light"
                color="green"
                leftSection={<IconCheck size={12} />}
                onClick={onDone}
                aria-label="Отметить задание как выполненное"
              >
                Готово
              </Button>
              <Button
                size="compact-xs"
                variant="subtle"
                color="gray"
                rightSection={<IconArrowRight size={12} />}
                onClick={onDone}
                aria-label="Пропустить задание"
              >
                Пропустить
              </Button>
            </Group>
          </>
        )}

        {!isActive && !isCompleted && (
          <Button
            size="compact-xs"
            variant="subtle"
            leftSection={<IconPlayerPlay size={12} />}
            onClick={onStart}
            aria-label="Начать задание"
          >
            Начать
          </Button>
        )}
      </Stack>
    </Card>
  )
}
