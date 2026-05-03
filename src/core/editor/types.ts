import type { ElementType } from '../nlu/types'

export type { ElementType }

export type CanvasElement = {
  id: string
  type: ElementType
  text: string
  color: string | null
  fontSize: number
  fontWeight: 'bold' | 'normal'
  fontStyle: 'italic' | 'normal'
  textAlign: 'left' | 'center' | 'right'
  createdAt: number
}

export type EditorState = {
  elements: CanvasElement[]
  selectedId: string | null
}

export const INITIAL_EDITOR_STATE: EditorState = {
  elements: [],
  selectedId: null,
}
