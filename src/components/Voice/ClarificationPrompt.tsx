import { useEffect } from 'react'
import { notifications } from '@mantine/notifications'
import { IconHelpCircle } from '@tabler/icons-react'
import { announceAssertive } from '../../core/accessibility/A11yAnnouncer'
import type { KnownIntent, SupportedLang } from '../../core/nlu/types'
import type { ClarificationState } from '../../hooks/useVoiceCommand'

const INTENT_LABELS_RU: Record<KnownIntent, string> = {
  ADD_ELEMENT: 'добавить элемент',
  CHANGE_COLOR: 'изменить цвет',
  CHANGE_TEXT: 'изменить текст',
  CHANGE_SIZE: 'изменить размер',
  CHANGE_FONT_WEIGHT: 'изменить начертание',
  CHANGE_FONT_STYLE: 'изменить стиль шрифта',
  CHANGE_TEXT_ALIGN: 'изменить выравнивание',
  DELETE_ELEMENT: 'удалить элемент',
  SELECT_ELEMENT: 'выбрать элемент',
  UNDO: 'отменить действие',
  CLEAR_ALL: 'очистить холст',
  DUPLICATE_ELEMENT: 'продублировать элемент',
  MOVE_ELEMENT: 'переместить элемент',
  APPLY_STYLE_PRESET: 'применить стиль',
  GROUP_ELEMENTS: 'сгруппировать элементы',
  UNGROUP_ELEMENT: 'разгруппировать элемент',
}

const INTENT_LABELS_EN: Record<KnownIntent, string> = {
  ADD_ELEMENT: 'add an element',
  CHANGE_COLOR: 'change the color',
  CHANGE_TEXT: 'change the text',
  CHANGE_SIZE: 'change the size',
  CHANGE_FONT_WEIGHT: 'change the font weight',
  CHANGE_FONT_STYLE: 'change the font style',
  CHANGE_TEXT_ALIGN: 'change the text alignment',
  DELETE_ELEMENT: 'delete the element',
  SELECT_ELEMENT: 'select an element',
  UNDO: 'undo the last action',
  CLEAR_ALL: 'clear the canvas',
  DUPLICATE_ELEMENT: 'duplicate the element',
  MOVE_ELEMENT: 'move the element',
  APPLY_STYLE_PRESET: 'apply a style preset',
  GROUP_ELEMENTS: 'group elements',
  UNGROUP_ELEMENT: 'ungroup the element',
}

const NOTIFICATION_ID = 'voice-clarification'

type Props = {
  clarification: ClarificationState
  lang: SupportedLang
}

export function ClarificationPrompt({ clarification, lang }: Props) {
  useEffect(() => {
    if (!clarification) {
      notifications.hide(NOTIFICATION_ID)
      return
    }

    const ruLabel = INTENT_LABELS_RU[clarification.result.intent]
    notifications.show({
      id: NOTIFICATION_ID,
      title: 'Уточнение',
      message: `Вы имели в виду: «${ruLabel}»? Скажите «да» — выполнить, «нет» — отменить.`,
      color: 'violet',
      icon: <IconHelpCircle size={16} />,
      autoClose: false,
      withCloseButton: false,
      position: 'bottom-right',
    })

    const labels = lang === 'ru' ? INTENT_LABELS_RU : INTENT_LABELS_EN
    const label = labels[clarification.result.intent]
    announceAssertive(
      lang === 'ru'
        ? `Не уверена, что расслышала верно. Вы хотели ${label}? Скажите «да» или «нет».`
        : `I'm not sure I heard that right. Did you want to ${label}? Say "yes" or "no".`,
    )

    return () => { notifications.hide(NOTIFICATION_ID) }
  }, [clarification, lang])

  return null
}
