import type { EditorState } from './types'

const MAX_HISTORY = 50

export class UndoManager {
  private history: EditorState[] = []

  push(state: EditorState): void {
    this.history.push(state)
    if (this.history.length > MAX_HISTORY) {
      this.history.shift()
    }
  }

  undo(): EditorState | null {
    return this.history.pop() ?? null
  }

  canUndo(): boolean {
    return this.history.length > 0
  }

  clear(): void {
    this.history = []
  }
}
