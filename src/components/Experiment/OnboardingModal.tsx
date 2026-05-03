import { useState } from 'react'
import {
  Modal,
  Stack,
  TextInput,
  SegmentedControl,
  Radio,
  Group,
  Button,
  Text,
  Badge,
  Divider,
} from '@mantine/core'
import { IconFlask, IconRefresh } from '@tabler/icons-react'
import { useSessionStore } from '../../store/sessionStore'
import { useSettingsStore } from '../../store/settingsStore'
import { SCENARIOS } from '../../experiment/scenarios'
import type { SupportedLang } from '../../core/nlu/types'

function generateParticipantId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const SCENARIO_BADGE: Record<1 | 2 | 3, string> = { 1: 'Базовый', 2: 'Составной', 3: 'Свободный' }

export function OnboardingModal() {
  const session = useSessionStore()
  const { lang: settingsLang, setLang } = useSettingsStore()

  const [participantId, setParticipantId] = useState(session.participantId || generateParticipantId())
  const [localLang, setLocalLang] = useState<SupportedLang>(settingsLang)
  const [scenario, setScenario] = useState<1 | 2 | 3>(session.scenario)

  const handleStart = () => {
    if (!participantId.trim()) return
    setLang(localLang)
    session.startSession(participantId.trim(), scenario, localLang)
  }

  return (
    <Modal
      opened={session.isShowingOnboarding}
      onClose={session.closeOnboarding}
      title={
        <Group gap="xs">
          <IconFlask size={20} />
          <Text fw={600}>Настройка эксперимента</Text>
        </Group>
      }
      size="md"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md">
        {/* Participant ID */}
        <TextInput
          label="ID участника"
          description="Идентификатор для связки данных. Не используйте личные данные."
          value={participantId}
          onChange={(e) => setParticipantId(e.currentTarget.value)}
          rightSection={
            <Button
              size="compact-xs"
              variant="subtle"
              onClick={() => setParticipantId(generateParticipantId())}
              aria-label="Сгенерировать ID"
            >
              <IconRefresh size={14} />
            </Button>
          }
        />

        {/* Язык */}
        <Stack gap={4}>
          <Text size="sm" fw={500}>Язык распознавания</Text>
          <SegmentedControl
            value={localLang}
            onChange={(v) => setLocalLang(v as SupportedLang)}
            data={[
              { label: 'Русский', value: 'ru' },
              { label: 'English', value: 'en' },
            ]}
            fullWidth
          />
        </Stack>

        <Divider />

        {/* Сценарий */}
        <Stack gap="xs">
          <Text size="sm" fw={500}>Сценарий</Text>
          <Radio.Group
            value={String(scenario)}
            onChange={(v) => setScenario(Number(v) as 1 | 2 | 3)}
          >
            <Stack gap="xs">
              {([1, 2, 3] as const).map((id) => {
                const s = SCENARIOS[id]
                return (
                  <Radio.Card key={id} value={String(id)} p="sm" radius="md">
                    <Group gap="sm" wrap="nowrap">
                      <Radio.Indicator />
                      <Stack gap={2}>
                        <Group gap="xs">
                          <Text size="sm" fw={600}>{s.title[localLang]}</Text>
                          <Badge size="xs" variant="light">{SCENARIO_BADGE[id]}</Badge>
                          <Badge size="xs" color="gray" variant="outline">{s.tasks.length} заданий</Badge>
                        </Group>
                        <Text size="xs" c="dimmed">{s.description[localLang]}</Text>
                      </Stack>
                    </Group>
                  </Radio.Card>
                )
              })}
            </Stack>
          </Radio.Group>
        </Stack>

        <Button
          onClick={handleStart}
          disabled={!participantId.trim()}
          leftSection={<IconFlask size={16} />}
          fullWidth
        >
          Начать эксперимент
        </Button>
      </Stack>
    </Modal>
  )
}
