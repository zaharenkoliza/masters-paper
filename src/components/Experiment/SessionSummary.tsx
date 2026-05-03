import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Table,
  Badge,
  SimpleGrid,
  RingProgress,
  Center,
  Divider,
  Title,
} from '@mantine/core'
import {
  IconDownload,
  IconRefresh,
  IconTrophy,
  IconChartBar,
} from '@tabler/icons-react'
import { useSessionStore } from '../../store/sessionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { exportToJson } from '../../core/logger/exporters/jsonExporter'
import { exportToCsv } from '../../core/logger/exporters/csvExporter'
import type { LogEntry } from '../../core/logger/types'

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}
function ms(n: number): string {
  return `${Math.round(n)} мс`
}

function getTopCommands(entries: LogEntry[], n: number, success: boolean) {
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (success ? e.actionResult === 'success' : e.actionResult !== 'success') {
      counts.set(e.rawTranscript, (counts.get(e.rawTranscript) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

export function SessionSummary() {
  const session = useSessionStore()
  useSettingsStore()

  const summary = session.summary
  if (!summary) return null

  const opened = !session.isSessionActive && summary.totalCommands > 0

  const topSuccess = getTopCommands(summary.entries, 5, true)
  const topFail = getTopCommands(summary.entries, 5, false)

  return (
    <Modal
      opened={opened}
      onClose={() => { /* блокируем закрытие без явного действия */ }}
      title={
        <Group gap="xs">
          <IconTrophy size={20} />
          <Text fw={700}>Итоги сессии</Text>
        </Group>
      }
      size="xl"
      fullScreen
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack gap="lg">
        <Group gap="xs">
          <Badge size="lg" variant="light">ID: {summary.participantId}</Badge>
          <Badge size="lg" variant="outline" color="violet">Сценарий {summary.scenario}</Badge>
          <Badge size="lg" variant="outline" color="gray">{summary.lang.toUpperCase()}</Badge>
          <Badge size="lg" variant="outline">{summary.totalCommands} команд</Badge>
        </Group>

        {/* Ключевые метрики */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <MetricRing
            label="TSR"
            description="Task Success Rate"
            value={summary.tsr}
          />
          <MetricRing
            label="FASR"
            description="First Attempt Success"
            value={summary.fasr}
          />
          <MetricRing
            label="OOD%"
            description="Out-of-Domain"
            value={summary.oodRate}
            invert
          />
          <Stack align="center" gap={4}>
            <IconChartBar size={24} />
            <Text fw={700} size="xl">{summary.retryRate.toFixed(1)}</Text>
            <Text size="xs" c="dimmed" ta="center">Retry Rate</Text>
            <Text size="xs" c="dimmed" ta="center">попыток на задание</Text>
          </Stack>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <StatBox label="Ср. латентность" value={ms(summary.avgLatencyMs)} />
          <StatBox label="Ср. WER" value={pct(summary.avgWer)} />
          <StatBox label="Успешных" value={String(summary.successCount)} color="green" />
          <StatBox label="Ошибок" value={String(summary.failCount + summary.oodCount)} color="red" />
        </SimpleGrid>

        <Divider label="Топ команд" labelPosition="left" />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Stack gap="xs">
            <Text size="sm" fw={600} c="green">✓ Успешные команды</Text>
            <Table striped withTableBorder fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Команда</Table.Th>
                  <Table.Th>Кол-во</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topSuccess.map(([cmd, count]) => (
                  <Table.Tr key={cmd}>
                    <Table.Td>{cmd || '—'}</Table.Td>
                    <Table.Td>{count}</Table.Td>
                  </Table.Tr>
                ))}
                {topSuccess.length === 0 && (
                  <Table.Tr><Table.Td colSpan={2} c="dimmed">Нет данных</Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="xs">
            <Text size="sm" fw={600} c="red">✗ Неудачные команды</Text>
            <Table striped withTableBorder fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Команда</Table.Th>
                  <Table.Th>Кол-во</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {topFail.map(([cmd, count]) => (
                  <Table.Tr key={cmd}>
                    <Table.Td>{cmd || '—'}</Table.Td>
                    <Table.Td>{count}</Table.Td>
                  </Table.Tr>
                ))}
                {topFail.length === 0 && (
                  <Table.Tr><Table.Td colSpan={2} c="dimmed">Нет ошибок</Table.Td></Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Stack>
        </SimpleGrid>

        <Divider />

        {/* Действия */}
        <Group justify="center" gap="md">
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={() => exportToJson(summary)}
            variant="filled"
          >
            Скачать JSON
          </Button>
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={() => exportToCsv(summary)}
            variant="outline"
          >
            Скачать CSV
          </Button>
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="subtle"
            color="gray"
            onClick={session.resetSession}
          >
            Начать заново
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function MetricRing({
  label,
  description,
  value,
  invert = false,
}: {
  label: string
  description: string
  value: number
  invert?: boolean
}) {
  const displayColor = invert
    ? value > 0.3 ? 'red' : value > 0.1 ? 'yellow' : 'green'
    : value >= 0.8 ? 'green' : value >= 0.5 ? 'yellow' : 'red'

  return (
    <Stack align="center" gap={4}>
      <RingProgress
        size={80}
        thickness={8}
        sections={[{ value: value * 100, color: displayColor }]}
        label={
          <Center>
            <Text fw={700} size="sm">{pct(value)}</Text>
          </Center>
        }
      />
      <Text fw={700} size="sm">{label}</Text>
      <Text size="xs" c="dimmed" ta="center">{description}</Text>
    </Stack>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Stack align="center" gap={2} p="xs" style={{ border: '1px solid var(--mantine-color-gray-3)', borderRadius: 8 }}>
      <Title order={3} c={color}>{value}</Title>
      <Text size="xs" c="dimmed" ta="center">{label}</Text>
    </Stack>
  )
}
