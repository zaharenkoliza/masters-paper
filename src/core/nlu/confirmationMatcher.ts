import type { SupportedLang } from './types'

export type Confirmation = 'yes' | 'no' | null

// Кириллические буквы не входят в \w, поэтому обычный \b не работает на границе
// слова и конца строки/пробела — используем отрицательный лукахед вместо него
const RU_YES = /^(да|ага|угу|верно|точно|правильно|именно|так\s+и\s+есть|конечно|давай)(?![а-яёА-ЯЁ])/i
const RU_NO = /^(нет|неа|не\s+так|не\s+то|неправильно|неверно|отмена|не\s+надо)(?![а-яёА-ЯЁ])/i

const EN_YES = /^(yes|yeah|yep|yup|correct|right|sure|exactly|that'?s\s+right|confirm)\b/i
const EN_NO = /^(no|nope|nah|wrong|incorrect|cancel|not\s+that|negative)\b/i

// Распознаёт короткий утвердительный/отрицательный ответ на уточняющий вопрос
// («вы имели в виду…?»). Возвращает null, если фраза не похожа ни на «да», ни на «нет» —
// в этом случае она должна обрабатываться как обычная новая команда.
export function matchConfirmation(text: string, lang: SupportedLang): Confirmation {
  const normalized = text.trim().toLowerCase()
  const [yesRe, noRe] = lang === 'ru' ? [RU_YES, RU_NO] : [EN_YES, EN_NO]

  if (yesRe.test(normalized)) return 'yes'
  if (noRe.test(normalized)) return 'no'
  return null
}
