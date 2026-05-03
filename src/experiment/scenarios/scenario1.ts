import type { Scenario } from './types'

export const scenario1: Scenario = {
  id: 1,
  title: {
    ru: 'Базовые команды',
    en: 'Basic Commands',
  },
  description: {
    ru: 'Познакомьтесь с голосовым редактором: добавляйте элементы, меняйте цвет, удаляйте.',
    en: 'Get familiar with the voice editor: add elements, change colors, delete.',
  },
  tasks: [
    {
      id: 's1-t1',
      instruction: {
        ru: 'Добавьте кнопку на холст',
        en: 'Add a button to the canvas',
      },
      hint: {
        ru: '«Добавь кнопку»',
        en: '"Add a button"',
      },
      targetIntents: ['ADD_ELEMENT'],
      completionCheck: (state) => state.elements.some((e) => e.type === 'button'),
    },
    {
      id: 's1-t2',
      instruction: {
        ru: 'Измените цвет кнопки на красный',
        en: 'Change the button color to red',
      },
      hint: {
        ru: '«Сделай красным» или «Измени цвет на красный»',
        en: '"Make it red" or "Change color to red"',
      },
      targetIntents: ['CHANGE_COLOR'],
      completionCheck: (state) =>
        state.elements.some((e) => e.type === 'button' && e.color === '#ef4444'),
    },
    {
      id: 's1-t3',
      instruction: {
        ru: 'Добавьте заголовок',
        en: 'Add a heading',
      },
      hint: {
        ru: '«Добавь заголовок»',
        en: '"Add a heading"',
      },
      targetIntents: ['ADD_ELEMENT'],
      completionCheck: (state) => state.elements.some((e) => e.type === 'heading'),
    },
    {
      id: 's1-t4',
      instruction: {
        ru: 'Удалите выбранный элемент',
        en: 'Delete the selected element',
      },
      hint: {
        ru: '«Удали» (сначала выберите элемент кликом)',
        en: '"Delete" (click to select element first)',
      },
      targetIntents: ['DELETE_ELEMENT'],
      completionCheck: null,
    },
    {
      id: 's1-t5',
      instruction: {
        ru: 'Отмените п��следнее действие',
        en: 'Undo the last action',
      },
      hint: {
        ru: '«Отмена» или «Отмени»',
        en: '"Undo"',
      },
      targetIntents: ['UNDO'],
      completionCheck: null,
    },
  ],
}
