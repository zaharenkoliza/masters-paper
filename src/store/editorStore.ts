import { create } from 'zustand'
import type { EditorState, CanvasElement, ElementType } from '../core/editor/types'
import type { Slots, StylePreset } from '../core/nlu/types'
import {
  addElement,
  changeColor,
  changeText,
  changeSize,
  deleteElement,
  selectElement,
  selectByIndex,
  clearAll,
  changeFontWeight,
  changeFontStyle,
  changeTextAlign,
  duplicateElement,
  moveElement,
  applyStylePreset,
  groupElements,
  ungroupElement,
} from '../core/editor/EditorEngine'
import { UndoManager } from '../core/editor/UndoManager'
import { INITIAL_EDITOR_STATE } from '../core/editor/types'

const undoManager = new UndoManager()

function snapshot(s: EditorState): EditorState {
  return { elements: s.elements, selectedId: s.selectedId }
}

type EditorStore = EditorState & {
  addElement: (type: ElementType, slots: Partial<Slots>) => void
  changeColor: (elementId: string, color: string) => void
  changeText: (elementId: string, text: string) => void
  changeSize: (elementId: string, direction: 'bigger' | 'smaller') => void
  changeFontWeight: (elementId: string, weight: 'bold' | 'normal') => void
  changeFontStyle: (elementId: string, style: 'italic' | 'normal') => void
  changeTextAlign: (elementId: string, align: 'left' | 'center' | 'right') => void
  deleteElement: (elementId: string) => void
  duplicateElement: (elementId: string) => void
  moveElement: (elementId: string, direction: 'left' | 'right' | 'start' | 'end') => void
  applyStylePreset: (elementId: string, preset: StylePreset) => void
  groupElements: (count: number) => void
  ungroupElement: (elementId: string) => void
  selectElement: (id: string | null) => void
  selectByIndex: (type: ElementType | undefined, index: number | 'first' | 'last') => void
  clearAll: () => void
  undo: () => void
  getSelected: () => CanvasElement | null
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...INITIAL_EDITOR_STATE,

  addElement: (type, slots) =>
    set((s) => { undoManager.push(snapshot(s)); return addElement(s, type, slots) }),

  changeColor: (elementId, color) =>
    set((s) => { undoManager.push(snapshot(s)); return changeColor(s, elementId, color) }),

  changeText: (elementId, text) =>
    set((s) => { undoManager.push(snapshot(s)); return changeText(s, elementId, text) }),

  changeSize: (elementId, direction) =>
    set((s) => { undoManager.push(snapshot(s)); return changeSize(s, elementId, direction) }),

  changeFontWeight: (elementId, weight) =>
    set((s) => { undoManager.push(snapshot(s)); return changeFontWeight(s, elementId, weight) }),

  changeFontStyle: (elementId, style) =>
    set((s) => { undoManager.push(snapshot(s)); return changeFontStyle(s, elementId, style) }),

  changeTextAlign: (elementId, align) =>
    set((s) => { undoManager.push(snapshot(s)); return changeTextAlign(s, elementId, align) }),

  deleteElement: (elementId) =>
    set((s) => { undoManager.push(snapshot(s)); return deleteElement(s, elementId) }),

  duplicateElement: (elementId) =>
    set((s) => { undoManager.push(snapshot(s)); return duplicateElement(s, elementId) }),

  moveElement: (elementId, direction) =>
    set((s) => { undoManager.push(snapshot(s)); return moveElement(s, elementId, direction) }),

  applyStylePreset: (elementId, preset) =>
    set((s) => { undoManager.push(snapshot(s)); return applyStylePreset(s, elementId, preset) }),

  groupElements: (count) =>
    set((s) => { undoManager.push(snapshot(s)); return groupElements(s, count) }),

  ungroupElement: (elementId) =>
    set((s) => { undoManager.push(snapshot(s)); return ungroupElement(s, elementId) }),

  selectElement: (id) =>
    set((s) => selectElement(s, id)),

  selectByIndex: (type, index) =>
    set((s) => selectByIndex(s, type, index)),

  clearAll: () =>
    set((s) => { undoManager.push(snapshot(s)); return clearAll(s) }),

  undo: () =>
    set(() => {
      const prev = undoManager.undo()
      return prev ?? {}
    }),

  getSelected: () => {
    const { elements, selectedId } = get()
    return elements.find((el) => el.id === selectedId) ?? null
  },
}))
