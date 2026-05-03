import { useEffect, useRef } from 'react'
import {
  AppShell,
  Group,
  Stack,
  Divider,
  SegmentedControl,
  Text,
  Box,
  Paper,
  Kbd,
  Tooltip,
  ActionIcon,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { IconFlask, IconKeyboard } from '@tabler/icons-react'
import { useVoiceCommand } from './hooks/useVoiceCommand'
import { useSettingsStore } from './store/settingsStore'
import { useEditorStore } from './store/editorStore'
import { useSessionStore } from './store/sessionStore'
import { MicButton } from './components/Voice/MicButton'
import { TranscriptDisplay } from './components/Voice/TranscriptDisplay'
import { CommandToast } from './components/Voice/CommandToast'
import { Workspace } from './components/Editor/Workspace'
import { ElementControls } from './components/Editor/ElementControls'
import { AriaLiveRegion } from './components/Accessibility/AriaLiveRegion'
import { OnboardingModal } from './components/Experiment/OnboardingModal'
import { ScenarioPanel } from './components/Experiment/ScenarioPanel'
import { SessionSummary } from './components/Experiment/SessionSummary'
import type { SupportedLang } from './core/nlu/types'

export function App() {
  const { lang, setLang, experimentMode, setExperimentMode } = useSettingsStore()
  const { undo } = useEditorStore()
  const session = useSessionStore()
  const micButtonRef = useRef<HTMLButtonElement>(null)

  const {
    micState,
    interimTranscript,
    lastTranscript,
    lastParseResult,
    lastCommandFeedback,
    isSupported,
    toggle,
  } = useVoiceCommand(lang)

  // Focus mic on mount
  useEffect(() => {
    micButtonRef.current?.focus()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      if (e.code === 'Space' && !isInput) {
        e.preventDefault()
        toggle()
        return
      }
      if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle, undo])

  // Открываем онбординг при включении режима эксперимента
  const handleToggleExperiment = () => {
    const next = !experimentMode
    setExperimentMode(next)
    if (next && !session.isSessionActive) {
      session.openOnboarding()
    }
  }

  const asideWidth = experimentMode && session.isSessionActive ? 260 : undefined

  return (
    <>
      <Notifications position="bottom-right" />

      <AppShell
        header={{ height: 56 }}
        aside={asideWidth ? { width: asideWidth, breakpoint: 'sm' } : undefined}
        padding={0}
      >
        {/* ── Header ── */}
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Group gap="xs">
              <Text fw={700} size="lg" c="blue">VoiceCanvas</Text>
              <Text size="xs" c="dimmed" visibleFrom="sm">голосовой редактор</Text>
            </Group>

            <Group gap="sm">
              <Tooltip label="Space — микрофон · Ctrl+Z — отмена">
                <ActionIcon variant="subtle" size="sm" aria-label="Горячие клавиши" visibleFrom="sm">
                  <IconKeyboard size={16} />
                </ActionIcon>
              </Tooltip>

              <SegmentedControl
                size="xs"
                value={lang}
                onChange={(v) => setLang(v as SupportedLang)}
                data={[{ label: 'RU', value: 'ru' }, { label: 'EN', value: 'en' }]}
                aria-label="Язык распознавания"
              />

              <Tooltip label={experimentMode ? 'Выйти из режима эксперимента' : 'Режим эксперимента'}>
                <ActionIcon
                  variant={experimentMode ? 'filled' : 'light'}
                  color="violet"
                  size="sm"
                  onClick={handleToggleExperiment}
                  aria-label="Переключить режим эксперимента"
                  aria-pressed={experimentMode}
                >
                  <IconFlask size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </AppShell.Header>

        {/* ── Main ── */}
        <AppShell.Main
          style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)' }}
        >
          {/* Voice Bar */}
          <Paper
            shadow="xs"
            p="md"
            radius={0}
            style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
          >
            <Group align="flex-start" gap="lg" wrap="nowrap">
              <MicButton state={micState} onToggle={toggle} disabled={!isSupported} />
              <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                <TranscriptDisplay
                  transcript={lastTranscript}
                  interimTranscript={interimTranscript}
                  parseResult={lastParseResult}
                  isSupported={isSupported}
                />
                <Group gap={4} visibleFrom="xs">
                  <Text size="xs" c="dimmed">Горячие клавиши:</Text>
                  <Kbd size="xs">Space</Kbd>
                  <Text size="xs" c="dimmed">— микрофон,</Text>
                  <Kbd size="xs">Ctrl+Z</Kbd>
                  <Text size="xs" c="dimmed">— отмена</Text>
                </Group>
              </Stack>
            </Group>
          </Paper>

          {/* Workspace + Controls */}
          <Box style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Box style={{ flex: 1, overflow: 'auto' }}>
              <Workspace />
            </Box>

            <Paper
              withBorder
              radius={0}
              style={{
                width: 200,
                borderLeft: '1px solid var(--mantine-color-gray-3)',
                overflow: 'auto',
              }}
            >
              <Text size="xs" fw={600} p="sm" pb={4} c="dimmed">СВОЙСТВА</Text>
              <Divider />
              <ElementControls />
            </Paper>
          </Box>
        </AppShell.Main>

        {/* ── Experiment aside ── */}
        {experimentMode && session.isSessionActive && (
          <AppShell.Aside
            style={{ borderLeft: '1px solid var(--mantine-color-gray-3)', overflow: 'hidden' }}
          >
            <ScenarioPanel />
          </AppShell.Aside>
        )}
      </AppShell>

      {/* Experiment modals */}
      <OnboardingModal />
      <SessionSummary />

      {/* Feedback */}
      {lastCommandFeedback && (
        <>
          <CommandToast
            intent={lastCommandFeedback.parseResult.intent}
            actionResult={lastCommandFeedback.actionResult}
            trigger={lastCommandFeedback}
          />
          <AriaLiveRegion
            intent={lastCommandFeedback.parseResult.intent}
            actionResult={lastCommandFeedback.actionResult}
            lang={lang}
            trigger={lastCommandFeedback}
          />
        </>
      )}
    </>
  )
}
