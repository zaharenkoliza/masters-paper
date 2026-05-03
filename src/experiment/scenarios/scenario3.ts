import type { Scenario } from './types'

export const scenario3: Scenario = {
  id: 3,
  title: {
    ru: 'Свободное задание',
    en: 'Free Exploration',
  },
  description: {
    ru: 'Создайте небольшой интерфейс самостоятельно, используя только голос. Никаких ограничений.',
    en: 'Create a small interface on your own using only voice. No restrictions.',
  },
  tasks: [
    {
      id: 's3-t1',
      instruction: {
        ru: 'Создайте интерфейс: добавьте хотя бы 3 элемента разных типов',
        en: 'Create an interface: add at least 3 elements of different types',
      },
      hint: {
        ru: 'Попробуйте: кнопку, заголовок, поле ввода и текст',
        en: 'Try: button, heading, input field, and text',
      },
      targetIntents: ['ADD_ELEMENT'],
      completionCheck: (state) => {
        const types = new Set(state.elements.map((e) => e.type))
        return state.elements.length >= 3 && types.size >= 3
      },
    },
    {
      id: 's3-t2',
      instruction: {
        ru: 'Настройте внешний вид: измените цвет и стиль хотя бы одного элемента',
        en: 'Customize appearance: change color and style of at least one element',
      },
      hint: {
        ru: 'Выберите элемент и скажите «Сделай синим», «Сделай жирным»',
        en: 'Select element and say "Make it blue", "Make bold"',
      },
      targetIntents: ['CHANGE_COLOR', 'CHANGE_FONT_WEIGHT', 'CHANGE_FONT_STYLE'],
      completionCheck: (state) =>
        state.elements.some(
          (e) => e.color !== null || e.fontWeight === 'bold' || e.fontStyle === 'italic',
        ),
    },
    {
      id: 's3-t3',
      instruction: {
        ru: 'Исправьте ошибку: отмените одно из последних действий',
        en: 'Fix a mistake: undo one of your last actions',
      },
      hint: {
        ru: '«Отмена» или Ctrl+Z',
        en: '"Undo" or Ctrl+Z',
      },
      targetIntents: ['UNDO'],
      completionCheck: null,
    },
  ],
}
