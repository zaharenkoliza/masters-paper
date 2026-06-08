import { useEditorStore } from '../store/editorStore'
import type { KnownIntent, Slots } from '../core/nlu/types'
import type { ElementType } from '../core/editor/types'

export type ActionResult = 'success' | 'fail' | 'ood'

export function useEditorActions() {
  const store = useEditorStore()

  function dispatchIntent(intent: KnownIntent, slots: Partial<Slots>): ActionResult {
    // Читаем выделенный элемент заново (не из снимка рендера) — в составной
    // команде предыдущий сегмент мог только что изменить выделение
    const selectedId = useEditorStore.getState().selectedId

    switch (intent) {
      case 'ADD_ELEMENT': {
        const type: ElementType = slots.elementType ?? 'button'
        store.addElement(type, slots)
        return 'success'
      }

      case 'CHANGE_COLOR': {
        if (!selectedId || !slots.color) return 'fail'
        store.changeColor(selectedId, slots.color)
        return 'success'
      }

      case 'CHANGE_TEXT': {
        if (!selectedId || slots.text === undefined) return 'fail'
        store.changeText(selectedId, slots.text)
        return 'success'
      }

      case 'CHANGE_SIZE': {
        if (!selectedId || !slots.sizeDirection) return 'fail'
        store.changeSize(selectedId, slots.sizeDirection)
        return 'success'
      }

      case 'CHANGE_FONT_WEIGHT': {
        if (!selectedId || !slots.fontWeight) return 'fail'
        store.changeFontWeight(selectedId, slots.fontWeight)
        return 'success'
      }

      case 'CHANGE_FONT_STYLE': {
        if (!selectedId || !slots.fontStyle) return 'fail'
        store.changeFontStyle(selectedId, slots.fontStyle)
        return 'success'
      }

      case 'CHANGE_TEXT_ALIGN': {
        if (!selectedId || !slots.textAlign) return 'fail'
        store.changeTextAlign(selectedId, slots.textAlign)
        return 'success'
      }

      case 'DELETE_ELEMENT': {
        if (!selectedId) return 'fail'
        store.deleteElement(selectedId)
        return 'success'
      }

      case 'SELECT_ELEMENT': {
        if (slots.index === undefined) return 'fail'
        store.selectByIndex(slots.elementType, slots.index)
        return 'success'
      }

      case 'UNDO': {
        store.undo()
        return 'success'
      }

      case 'CLEAR_ALL': {
        store.clearAll()
        return 'success'
      }

      case 'DUPLICATE_ELEMENT': {
        if (!selectedId) return 'fail'
        store.duplicateElement(selectedId)
        return 'success'
      }

      case 'MOVE_ELEMENT': {
        if (!selectedId || !slots.moveDirection) return 'fail'
        store.moveElement(selectedId, slots.moveDirection)
        return 'success'
      }

      case 'APPLY_STYLE_PRESET': {
        if (!selectedId || !slots.stylePreset) return 'fail'
        store.applyStylePreset(selectedId, slots.stylePreset)
        return 'success'
      }

      case 'GROUP_ELEMENTS': {
        if (!slots.groupSize || slots.groupSize < 2) return 'fail'
        store.groupElements(slots.groupSize)
        return 'success'
      }

      case 'UNGROUP_ELEMENT': {
        if (!selectedId) return 'fail'
        store.ungroupElement(selectedId)
        return 'success'
      }
    }
  }

  return { dispatchIntent }
}
