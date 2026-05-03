export {
  addElement,
  changeColor,
  changeText,
  changeSize,
  deleteElement,
  selectElement,
  selectByIndex,
  changeFontWeight,
  changeFontStyle,
  changeTextAlign,
  clearAll,
  duplicateElement,
  moveElement,
} from './EditorEngine'
export { createElement } from './ElementFactory'
export { UndoManager } from './UndoManager'
export type { CanvasElement, EditorState, ElementType } from './types'
export { INITIAL_EDITOR_STATE } from './types'
