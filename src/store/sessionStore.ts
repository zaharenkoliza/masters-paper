import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LogEntry, SessionSummary } from '../core/logger/types'
import type { SupportedLang } from '../core/nlu/types'
import { buildSessionSummary } from '../core/logger/MetricsCalculator'
import { SCENARIOS } from '../experiment/scenarios'

function generateId(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

type SessionStore = {
  // Конфиг сессии
  participantId: string
  sessionId: string
  scenario: 1 | 2 | 3
  lang: SupportedLang
  isSessionActive: boolean
  isShowingOnboarding: boolean

  // Прогресс
  currentTaskIdx: number
  taskStartTime: number
  sessionStartTime: number
  taskAttempts: number      // попытки текущего задания
  hintUsed: boolean         // использована ли подсказка в текущем задании
  completedTaskIds: Set<string>
  taskTimes: number[]       // время выполнения каждого задания (мс)

  // Лог
  log: LogEntry[]

  // Сводка (заполняется при завершении)
  summary: SessionSummary | null

  // Действия
  openOnboarding: () => void
  closeOnboarding: () => void
  startSession: (participantId: string, scenario: 1 | 2 | 3, lang: SupportedLang) => void
  addLogEntry: (entry: LogEntry) => void
  markTaskComplete: () => void
  nextTask: () => void
  useHint: () => void
  endSession: () => void
  resetSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      participantId: '',
      sessionId: '',
      scenario: 1,
      lang: 'ru',
      isSessionActive: false,
      isShowingOnboarding: false,
      currentTaskIdx: 0,
      taskStartTime: 0,
      sessionStartTime: 0,
      taskAttempts: 0,
      hintUsed: false,
      completedTaskIds: new Set(),
      taskTimes: [],
      log: [],
      summary: null,

      openOnboarding: () => set({ isShowingOnboarding: true }),
      closeOnboarding: () => set({ isShowingOnboarding: false }),

      startSession: (participantId, scenario, lang) => {
        const now = Date.now()
        set({
          participantId,
          sessionId: generateId(),
          scenario,
          lang,
          isSessionActive: true,
          isShowingOnboarding: false,
          currentTaskIdx: 0,
          taskStartTime: now,
          sessionStartTime: now,
          taskAttempts: 0,
          hintUsed: false,
          completedTaskIds: new Set(),
          taskTimes: [],
          log: [],
          summary: null,
        })
      },

      addLogEntry: (entry) =>
        set((s) => {
          const updated = [...s.log, entry]
          // Инкрементируем счётчик попыток
          return { log: updated, taskAttempts: s.taskAttempts + 1 }
        }),

      markTaskComplete: () => {
        const s = get()
        const scenario = SCENARIOS[s.scenario]
        const task = scenario.tasks[s.currentTaskIdx]
        if (!task) return
        const elapsed = Date.now() - s.taskStartTime
        set((prev) => {
          const newCompleted = new Set(prev.completedTaskIds)
          newCompleted.add(task.id)
          return {
            completedTaskIds: newCompleted,
            taskTimes: [...prev.taskTimes, elapsed],
          }
        })
      },

      nextTask: () => {
        const s = get()
        const scenario = SCENARIOS[s.scenario]
        const nextIdx = s.currentTaskIdx + 1
        if (nextIdx >= scenario.tasks.length) {
          // Все задания выполнены — завершаем сессию
          get().endSession()
          return
        }
        set({
          currentTaskIdx: nextIdx,
          taskStartTime: Date.now(),
          taskAttempts: 0,
          hintUsed: false,
        })
      },

      useHint: () => set({ hintUsed: true }),

      endSession: () => {
        const s = get()
        const summary = buildSessionSummary(s.log, s.taskTimes)
        set({ isSessionActive: false, summary })
      },

      resetSession: () =>
        set({
          participantId: '',
          sessionId: '',
          isSessionActive: false,
          isShowingOnboarding: false,
          currentTaskIdx: 0,
          taskStartTime: 0,
          sessionStartTime: 0,
          taskAttempts: 0,
          hintUsed: false,
          completedTaskIds: new Set(),
          taskTimes: [],
          log: [],
          summary: null,
        }),
    }),
    {
      name: 'voicecanvas-session',
      // Set не сериализуется — преобразуем вручную
      partialize: (s) => ({
        ...s,
        completedTaskIds: [...s.completedTaskIds],
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SessionStore>),
        completedTaskIds: new Set(
          (persisted as { completedTaskIds?: string[] }).completedTaskIds ?? [],
        ),
      }),
    },
  ),
)
