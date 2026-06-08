import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconX, IconQuestionMark } from '@tabler/icons-react'
import type { ActionResult } from '../../hooks/useEditorActions'
import type { KnownIntent } from '../../core/nlu/types'

const INTENT_RU: Record<KnownIntent, string> = {
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

type Props = {
  intent: KnownIntent | 'OUT_OF_DOMAIN'
  actionResult: ActionResult
  trigger: unknown
}

export function CommandToast({ intent, actionResult, trigger }: Props) {
  useEffect(() => {
    if (!trigger) return

    if (actionResult === 'success' && intent !== 'OUT_OF_DOMAIN') {
      notifications.show({
        message: INTENT_RU[intent],
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 2000,
        position: 'bottom-right',
      })
    } else if (actionResult === 'fail') {
      notifications.show({
        message: 'Не удалось выполнить. Попробуйте ещё раз',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 2000,
        position: 'bottom-right',
      })
    } else if (actionResult === 'ood') {
      notifications.show({
        message: 'Команда не распознана',
        color: 'yellow',
        icon: <IconQuestionMark size={16} />,
        autoClose: 2000,
        position: 'bottom-right',
      })
    }
  }, [trigger])

  return null
}
