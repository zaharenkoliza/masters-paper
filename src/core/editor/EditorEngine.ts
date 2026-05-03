import type { EditorState, CanvasElement, ElementType } from './types'
import type { Slots } from '../nlu/types'
import { createElement } from './ElementFactory'

function mapElement(
  state: EditorState,
  id: string,
  updater: (el: CanvasElement) => CanvasElement,
): EditorState {
  return {
    ...state,
    elements: state.elements.map((el) => (el.id === id ? updater(el) : el)),
  }
}

export function addElement(
  state: EditorState,
  type: ElementType,
  slots: Partial<Slots>,
): EditorState {
  const el = createElement(type, slots)
  return {
    elements: [...state.elements, el],
    selectedId: el.id,
  }
}

export function changeColor(state: EditorState, elementId: string, color: string): EditorState {
  return mapElement(state, elementId, (el) => ({ ...el, color }))
}

export function changeText(state: EditorState, elementId: string, text: string): EditorState {
  return mapElement(state, elementId, (el) => ({ ...el, text }))
}

export function changeSize(
  state: EditorState,
  elementId: string,
  direction: 'bigger' | 'smaller',
): EditorState {
  return mapElement(state, elementId, (el) => ({
    ...el,
    fontSize: direction === 'bigger'
      ? Math.min(el.fontSize + 4, 72)
      : Math.max(el.fontSize - 4, 8),
  }))
}

export function deleteElement(state: EditorState, elementId: string): EditorState {
  const elements = state.elements.filter((el) => el.id !== elementId)
  return {
    elements,
    selectedId: state.selectedId === elementId ? null : state.selectedId,
  }
}

export function selectElement(state: EditorState, id: string | null): EditorState {
  return { ...state, selectedId: id }
}

export function selectByIndex(
  state: EditorState,
  type: ElementType | undefined,
  index: number | 'first' | 'last',
): EditorState {
  const pool = type
    ? state.elements.filter((el) => el.type === type)
    : state.elements

  let target: CanvasElement | undefined
  if (index === 'first') target = pool[0]
  else if (index === 'last') target = pool[pool.length - 1]
  else target = pool[index]

  if (!target) return state
  return selectElement(state, target.id)
}

export function changeFontWeight(
  state: EditorState,
  elementId: string,
  weight: 'bold' | 'normal',
): EditorState {
  return mapElement(state, elementId, (el) => ({ ...el, fontWeight: weight }))
}

export function changeFontStyle(
  state: EditorState,
  elementId: string,
  style: 'italic' | 'normal',
): EditorState {
  return mapElement(state, elementId, (el) => ({ ...el, fontStyle: style }))
}

export function changeTextAlign(
  state: EditorState,
  elementId: string,
  align: 'left' | 'center' | 'right',
): EditorState {
  return mapElement(state, elementId, (el) => ({ ...el, textAlign: align }))
}

export function clearAll(_state: EditorState): EditorState {
  return { elements: [], selectedId: null }
}

export function duplicateElement(state: EditorState, elementId: string): EditorState {
  const source = state.elements.find((el) => el.id === elementId)
  if (!source) return state
  const copy: CanvasElement = {
    ...source,
    id: `${source.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  }
  return {
    elements: [...state.elements, copy],
    selectedId: copy.id,
  }
}

export function moveElement(
  state: EditorState,
  elementId: string,
  direction: 'left' | 'right',
): EditorState {
  const idx = state.elements.findIndex((el) => el.id === elementId)
  if (idx === -1) return state

  const els = [...state.elements]
  const targetIdx = direction === 'left' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= els.length) return state

  // Swap
  const tmp = els[idx]!
  els[idx] = els[targetIdx]!
  els[targetIdx] = tmp
  return { ...state, elements: els }
}
