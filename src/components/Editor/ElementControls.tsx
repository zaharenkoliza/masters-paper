import {
  Stack,
  Text,
  Group,
  Badge,
  ActionIcon,
  Tooltip,
  ColorSwatch,
  Divider,
} from '@mantine/core'
import {
  IconBold,
  IconItalic,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconPlus,
  IconMinus,
  IconTrash,
  IconCopy,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react'
import { useEditorStore } from '../../store/editorStore'

const ELEMENT_LABELS: Record<string, string> = {
  button: 'Кнопка',
  heading: 'Заголовок',
  input: 'Поле ввода',
  text: 'Текст',
  container: 'Контейнер',
}

export function ElementControls() {
  const store = useEditorStore()
  const selected = store.getSelected()

  if (!selected) {
    return (
      <Text size="xs" c="dimmed" ta="center" py="xs">
        Выберите элемент, чтобы редактировать
      </Text>
    )
  }

  const id = selected.id

  return (
    <Stack gap="xs" p="sm">
      <Group justify="space-between">
        <Group gap="xs">
          <Badge size="sm" variant="light">{ELEMENT_LABELS[selected.type] ?? selected.type}</Badge>
          {selected.color && <ColorSwatch color={selected.color} size={16} />}
        </Group>
        <Text size="xs" c="dimmed">{selected.fontSize}px</Text>
      </Group>

      <Divider />

      {/* Размер шрифта */}
      <Group gap="xs">
        <Text size="xs" c="dimmed" w={60}>Размер</Text>
        <Tooltip label="Уменьшить">
          <ActionIcon size="sm" variant="default" onClick={() => store.changeSize(id, 'smaller')} aria-label="Уменьшить шрифт">
            <IconMinus size={12} />
          </ActionIcon>
        </Tooltip>
        <Text size="xs" w={28} ta="center">{selected.fontSize}</Text>
        <Tooltip label="Увеличить">
          <ActionIcon size="sm" variant="default" onClick={() => store.changeSize(id, 'bigger')} aria-label="Увеличить шрифт">
            <IconPlus size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Начертание */}
      <Group gap="xs">
        <Text size="xs" c="dimmed" w={60}>Стиль</Text>
        <Tooltip label="Жирный">
          <ActionIcon
            size="sm"
            variant={selected.fontWeight === 'bold' ? 'filled' : 'default'}
            onClick={() => store.changeFontWeight(id, selected.fontWeight === 'bold' ? 'normal' : 'bold')}
            aria-label="Жирный"
            aria-pressed={selected.fontWeight === 'bold'}
          >
            <IconBold size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Курсив">
          <ActionIcon
            size="sm"
            variant={selected.fontStyle === 'italic' ? 'filled' : 'default'}
            onClick={() => store.changeFontStyle(id, selected.fontStyle === 'italic' ? 'normal' : 'italic')}
            aria-label="Курсив"
            aria-pressed={selected.fontStyle === 'italic'}
          >
            <IconItalic size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Выравнивание */}
      <Group gap="xs">
        <Text size="xs" c="dimmed" w={60}>Выравн.</Text>
        {(['left', 'center', 'right'] as const).map((align) => {
          const Icon = align === 'left' ? IconAlignLeft : align === 'center' ? IconAlignCenter : IconAlignRight
          return (
            <Tooltip key={align} label={align}>
              <ActionIcon
                size="sm"
                variant={selected.textAlign === align ? 'filled' : 'default'}
                onClick={() => store.changeTextAlign(id, align)}
                aria-label={`Выравнивание ${align}`}
                aria-pressed={selected.textAlign === align}
              >
                <Icon size={12} />
              </ActionIcon>
            </Tooltip>
          )
        })}
      </Group>

      <Divider />

      {/* Действия */}
      <Group gap="xs" justify="center">
        <Tooltip label="Переместить влево">
          <ActionIcon size="sm" variant="default" onClick={() => store.moveElement(id, 'left')} aria-label="Переместить влево">
            <IconArrowLeft size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Переместить вправо">
          <ActionIcon size="sm" variant="default" onClick={() => store.moveElement(id, 'right')} aria-label="Переместить вправо">
            <IconArrowRight size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Дублировать">
          <ActionIcon size="sm" variant="default" onClick={() => store.duplicateElement(id)} aria-label="Дублировать элемент">
            <IconCopy size={12} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Удалить">
          <ActionIcon size="sm" color="red" variant="light" onClick={() => store.deleteElement(id)} aria-label="Удалить элемент">
            <IconTrash size={12} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  )
}
