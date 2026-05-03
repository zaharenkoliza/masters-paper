import type { Scenario } from './types'

export const scenario2: Scenario = {
  id: 2,
  title: {
    ru: 'Составные команды',
    en: 'Composite Commands',
  },
  description: {
    ru: 'Более сложные задания: сочетайте несколько голосовых команд для достижения результата.',
    en: 'More complex tasks: combine multiple voice commands to achieve the goal.',
  },
  tasks: [
    {
      id: 's2-t1',
      instruction: {
        ru: 'Добавьте синюю кнопку с текстом «Старт»',
        en: 'Add a blue button with text "Start"',
      },
      hint: {
        ru: '«Добавь синюю кнопку» → потом «Измени текст на Старт»',
        en: '"Add a blue button" → then "Change text to Start"',
      },
      targetIntents: ['ADD_ELEMENT', 'CHANGE_TEXT'],
      completionCheck: (state) =>
        state.elements.some(
          (e) => e.type === 'button' && e.color === '#3b82f6' && e.text === 'Старт',
        ),
    },
    {
      id: 's2-t2',
      instruction: {
        ru: 'Выберите первую кнопку и сделайте текст жирным',
        en: 'Select the first button and make it bold',
      },
      hint: {
        ru: '«Выбери первую кнопку» → «Сделай жирным»',
        en: '"Select the first button" → "Make bold"',
      },
      targetIntents: ['SELECT_ELEMENT', 'CHANGE_FONT_WEIGHT'],
      completionCheck: (state) => {
        const buttons = state.elements.filter((e) => e.type === 'button')
        return buttons.length > 0 && buttons.some((e) => e.fontWeight === 'bold')
      },
    },
    {
      id: 's2-t3',
      instruction: {
        ru: 'Добавьте текстовый блок и выровняйте по центру',
        en: 'Add a text block and center-align it',
      },
      hint: {
        ru: '«Добавь текст» → «Выровняй по центру»',
        en: '"Add text" → "Align center"',
      },
      targetIntents: ['ADD_ELEMENT', 'CHANGE_TEXT_ALIGN'],
      completionCheck: (state) =>
        state.elements.some((e) => e.type === 'text' && e.textAlign === 'center'),
    },
    {
      id: 's2-t4',
      instruction: {
        ru: 'Очистите холст и добавьте два разных элемента',
        en: 'Clear the canvas and add two different elements',
      },
      hint: {
        ru: '«Очисти всё» → «Добавь кнопку» → «Добавь заголовок»',
        en: '"Clear all" → "Add button" → "Add heading"',
      },
      targetIntents: ['CLEAR_ALL', 'ADD_ELEMENT'],
      completionCheck: (state) => {
        const types = new Set(state.elements.map((e) => e.type))
        return types.size >= 2
      },
    },
  ],
}
