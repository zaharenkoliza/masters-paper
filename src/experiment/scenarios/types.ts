import type { KnownIntent, SupportedLang } from '../../core/nlu/types'
import type { EditorState } from '../../core/editor/types'

export type Task = {
  id: string
  instruction: Record<SupportedLang, string>
  hint: Record<SupportedLang, string>
  // Интенты, которые засчитываются как попытка выполнения этого задания
  targetIntents: KnownIntent[]
  // Проверка завершённости по состоянию редактора (если null — ручное подтверждение)
  completionCheck: ((state: EditorState) => boolean) | null
}

export type Scenario = {
  id: 1 | 2 | 3
  title: Record<SupportedLang, string>
  description: Record<SupportedLang, string>
  tasks: Task[]
}
