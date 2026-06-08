import { useEffect } from 'react'
import { announce } from '../../core/accessibility/A11yAnnouncer'
import type { ActionResult } from '../../hooks/useEditorActions'
import type { KnownIntent } from '../../core/nlu/types'

const ANNOUNCE_RU: Record<KnownIntent, string> = {
  ADD_ELEMENT: 'Элемент добавлен',
  CHANGE_COLOR: 'Цвет изменён',
  CHANGE_TEXT: 'Текст изменён',
  CHANGE_SIZE: 'Размер изменён',
  CHANGE_FONT_WEIGHT: 'Начертание изменено',
  CHANGE_FONT_STYLE: 'Стиль шрифта изменён',
  CHANGE_TEXT_ALIGN: 'Выравнивание изменено',
  DELETE_ELEMENT: 'Элемент удалён',
  SELECT_ELEMENT: 'Элемент выбран',
  UNDO: 'Действие отменено',
  CLEAR_ALL: 'Холст очищен',
  DUPLICATE_ELEMENT: 'Элемент продублирован',
  MOVE_ELEMENT: 'Элемент перемещён',
  APPLY_STYLE_PRESET: 'Стиль применён',
  GROUP_ELEMENTS: 'Элементы сгруппированы',
  UNGROUP_ELEMENT: 'Группа разобрана',
}

const ANNOUNCE_EN: Record<KnownIntent, string> = {
  ADD_ELEMENT: 'Element added',
  CHANGE_COLOR: 'Color changed',
  CHANGE_TEXT: 'Text changed',
  CHANGE_SIZE: 'Size changed',
  CHANGE_FONT_WEIGHT: 'Font weight changed',
  CHANGE_FONT_STYLE: 'Font style changed',
  CHANGE_TEXT_ALIGN: 'Text alignment changed',
  DELETE_ELEMENT: 'Element deleted',
  SELECT_ELEMENT: 'Element selected',
  UNDO: 'Action undone',
  CLEAR_ALL: 'Canvas cleared',
  DUPLICATE_ELEMENT: 'Element duplicated',
  MOVE_ELEMENT: 'Element moved',
  APPLY_STYLE_PRESET: 'Style applied',
  GROUP_ELEMENTS: 'Elements grouped',
  UNGROUP_ELEMENT: 'Group disbanded',
}

type Props = {
  intent: KnownIntent | 'OUT_OF_DOMAIN'
  actionResult: ActionResult
  lang: 'ru' | 'en'
  trigger: unknown
}

export function AriaLiveRegion({ intent, actionResult, lang, trigger }: Props) {
  useEffect(() => {
    if (!trigger) return

    const table = lang === 'ru' ? ANNOUNCE_RU : ANNOUNCE_EN

    if (actionResult === 'success' && intent !== 'OUT_OF_DOMAIN') {
      announce(table[intent])
    } else if (actionResult === 'fail') {
      announce(lang === 'ru' ? 'Не удалось выполнить команду' : 'Command failed')
    } else if (actionResult === 'ood') {
      announce(lang === 'ru' ? 'Команда не распознана' : 'Command not recognized')
    }
  }, [trigger])

  return null
}
