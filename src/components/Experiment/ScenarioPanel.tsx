import { useEffect, useState, useRef } from 'react'
import { Stack, Text, Group, Badge, Button, Divider, Progress, ScrollArea } from '@mantine/core'
import { IconStopwatch, IconPlayerStop } from '@tabler/icons-react'
import { useSessionStore } from '../../store/sessionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { SCENARIOS } from '../../experiment/scenarios'
import { TaskCard } from './TaskCard'
import { useEditorStore } from '../../store/editorStore'

const WARN_THRESHOLD_MS = 2 * 60 * 1000  // 2 минуты

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function ScenarioPanel() {
  const session = useSessionStore()
  const { lang } = useSettingsStore()
  const editorStore = useEditorStore()
  const scenario = SCENARIOS[session.scenario]

  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Таймер задания
  useEffect(() => {
    if (!session.isSessionActive) return
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - session.taskStartTime)
    }, 500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session.isSessionActive, session.taskStartTime])

  // Сброс таймера при смене задания
  useEffect(() => {
    setElapsed(0)
  }, [session.currentTaskIdx])

  if (!session.isSessionActive) return null

  const task = scenario.tasks[session.currentTaskIdx]
  const completedCount = session.completedTaskIds.size
  const totalTasks = scenario.tasks.length
  const progress = (completedCount / totalTasks) * 100
  const isOverTime = elapsed > WARN_THRESHOLD_MS

  const handleDone = () => {
    session.markTaskComplete()
    session.nextTask()
  }

  const handleHint = () => {
    session.useHint()
  }

  // Авто-проверка при изменении состояния редактора
  useEffect(() => {
    if (!session.isSessionActive || !task?.completionCheck) return
    const edState = { elements: editorStore.elements, selectedId: editorStore.selectedId }
    if (task.completionCheck(edState) && !session.completedTaskIds.has(task.id)) {
      session.markTaskComplete()
    }
  }, [editorStore.elements, session.isSessionActive])

  return (
    <Stack gap="xs" h="100%" style={{ overflow: 'hidden' }}>
      {/* Заголовок сценария */}
      <Stack gap={4} p="sm" pb={0}>
        <Group justify="space-between">
          <Text size="xs" fw={600} c="dimmed">СЦЕНАРИЙ {session.scenario}</Text>
          <Badge size="xs" color="violet">{scenario.title[lang]}</Badge>
        </Group>
        <Progress value={progress} size="sm" color={progress === 100 ? 'green' : 'blue'} />
        <Text size="xs" c="dimmed">{completedCount}/{totalTasks} заданий</Text>
      </Stack>

      <Divider />

      {/* Таймер текущего задания */}
      {task && (
        <Group justify="center" gap="xs" px="sm">
          <IconStopwatch size={16} style={{ color: isOverTime ? 'var(--mantine-color-red-5)' : 'var(--mantine-color-dimmed)' }} />
          <Text
            size="xl"
            fw={700}
            c={isOverTime ? 'red' : 'dark'}
            ff="monospace"
          >
            {formatTime(elapsed)}
          </Text>
        </Group>
      )}

      {/* Список заданий */}
      <ScrollArea style={{ flex: 1 }} px="sm">
        <Stack gap="xs" pb="sm">
          {scenario.tasks.map((t, idx) => (
            <TaskCard
              key={t.id}
              task={t}
              index={idx}
              isActive={idx === session.currentTaskIdx && !session.completedTaskIds.has(t.id)}
              isCompleted={session.completedTaskIds.has(t.id)}
              lang={lang}
              onStart={() => {
                // Переход к заданию (если пользователь хочет выбрать явно)
              }}
              onDone={handleDone}
              onHint={handleHint}
              hintUsed={session.hintUsed}
              attempts={idx === session.currentTaskIdx ? session.taskAttempts : 0}
            />
          ))}
        </Stack>
      </ScrollArea>

      <Divider />

      {/* Завершить сессию */}
      <Stack gap="xs" p="sm" pt={0}>
        <Button
          variant="light"
          color="red"
          size="sm"
          leftSection={<IconPlayerStop size={16} />}
          onClick={session.endSession}
          fullWidth
        >
          Завершить сессию
        </Button>
        <Text size="xs" c="dimmed" ta="center">
          ID: {session.participantId}
        </Text>
      </Stack>
    </Stack>
  )
}
