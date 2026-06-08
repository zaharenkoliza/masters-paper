# VoiceCanvas

Веб-приложение для создания пользовательских интерфейсов голосовыми командами. Ориентировано на людей с ограниченными двигательными возможностями: голос полностью заменяет мышь и клавиатуру.

Одновременно является экспериментальным стендом для магистерской ВКР по теме **«Эффективность голосового интерфейса в low-code средах»** (ИТМО, 2026).

---

## Демонстрация

```
Пользователь: «Добавь синюю кнопку»
              → кнопка появляется на холсте

Пользователь: «Сделай жирным»
              → шрифт выбранного элемента становится жирным

Пользователь: «Очисти всё»
              → холст очищается
```

Поддерживаемые языки распознавания: **русский** и **английский**.

---

## Технологии

| Слой | Технология |
|---|---|
| UI | React 18 + TypeScript (strict) |
| Сборка | Vite |
| Компоненты | Mantine v7 |
| Состояние | Zustand |
| Распознавание речи | Web Speech API (встроен в Chrome) |
| NLU (быстрый путь) | RegExp-паттерны (~0 мс) |
| NLU (fallback) | `@xenova/transformers` — `paraphrase-multilingual-MiniLM-L12-v2` (WASM, quantized) |
| Backend | — (статика, нет сервера) |

---

## Архитектура

```
src/
├── core/                    # Чистый TypeScript — нет зависимостей от React/Mantine
│   ├── asr/                 # SpeechRecognizer — обёртка над Web Speech API
│   ├── nlu/                 # IntentMatcher — parseIntentAsync(text, lang) → ParseResult
│   │   ├── patterns/        # RU и EN паттерны (RegExp + SlotExtractor)
│   │   ├── normalizers.ts   # Нормализация цвета, типа элемента, индекса
│   │   ├── IntentMatcher.ts # parseIntent (regex, sync) + parseIntentAsync (cascade)
│   │   └── TransformerFallback.ts  # @xenova/transformers, косинусное сходство, кэш эмбеддингов
│   ├── editor/              # EditorEngine — чистые функции над EditorState
│   │   ├── EditorEngine.ts  # add, changeColor, changeText, changeSize, ...
│   │   ├── ElementFactory.ts
│   │   └── UndoManager.ts
│   ├── logger/              # Метрики эксперимента
│   │   ├── MetricsCalculator.ts  # WER (Левенштейн), TSR, FASR, RetryRate, OOD%
│   │   ├── SessionLogger.ts      # Создание LogEntry
│   │   └── exporters/            # JSON и CSV экспорт
│   └── accessibility/       # A11yAnnouncer — aria-live регион
│
├── store/                   # Zustand stores — связывают core с UI
│   ├── editorStore.ts       # elements[], selectedId, history (UndoManager)
│   ├── sessionStore.ts      # participantId, scenario, log[], task tracking
│   └── settingsStore.ts     # lang, experimentMode (persisted)
│
├── hooks/                   # React hooks — тонкий слой над core + store
│   ├── useSpeechRecognition.ts  # ASR состояние и toggle
│   ├── useEditorActions.ts      # Диспетчер KnownIntent → store action
│   └── useVoiceCommand.ts       # Главный pipeline: ASR → NLU → action → log
│
├── components/
│   ├── Editor/              # Workspace, CanvasElement, ElementControls
│   ├── Voice/               # MicButton, TranscriptDisplay, CommandToast
│   ├── Experiment/          # OnboardingModal, ScenarioPanel, TaskCard, SessionSummary
│   └── Accessibility/       # AriaLiveRegion
│
└── experiment/
    └── scenarios/           # Определения сценариев и заданий (scenario1/2/3)
```

### Ключевые архитектурные принципы

1. **`core/` — zero React.** Никаких `useState`, никаких импортов из React. Бизнес-логика тестируется независимо от браузера.

2. **Однонаправленный поток данных:**
   ```
   Голос → SpeechRecognizer → parseIntentAsync → EditorEngine → Zustand → React UI
                                    │                               ↓
                               regex (0 мс)                  SessionLogger
                                    │ OOD?
                              TransformerFallback
                           (paraphrase-MiniLM, ~100 мс)
   ```

3. **Иммутабельное состояние редактора.** `EditorEngine` принимает `EditorState` и возвращает новый `EditorState`. `UndoManager` — просто стек снапшотов.

4. **`experiment/` изолирован от `core/`.** Продукт работает без экспериментального режима. Логирование подключается снаружи через события, не встроено в бизнес-логику.

5. **Каскадный NLU.** `parseIntentAsync` сначала пробует regex (детерминированный, 0 мс, `confidence = 1`, `detectedVia: 'regex'`). Трансформер загружается лениво и подключается только если regex не сработал. После разогрева — ~100–300 мс. Модель кэширует эмбеддинги эталонных фраз в памяти на весь сеанс.

   Скор косинусного сходства трансформера сам по себе ненадёжен как граница между «понятно» и «непонятно» — посторонние фразы нередко получают более высокий скор, чем настоящие команды редактора (см. `TransformerFallback.ts`). Поэтому: ниже порога `SIMILARITY_THRESHOLD` (0.52) фраза считается вне домена (`detectedVia: 'ood'`, тост «Команда не распознана»), а **выше порога — никогда не выполняется автоматически**: каскад всегда переспрашивает («Вы имели в виду…?», `detectedVia: 'clarify'`) и ждёт голосового подтверждения «да»/«нет» (`confirmationMatcher.ts`). Любая ошибка загрузки/инференса модели (сеть, WASM, кэш) перехватывается и трактуется как `OUT_OF_DOMAIN` — пользователь в любом случае получает видимую и озвученную реакцию, а не тишину.

---

## Поддерживаемые команды

### Добавление элементов
| Русский | English |
|---|---|
| «Добавь кнопку» | «Add a button» |
| «Создай заголовок» | «Create a heading» |
| «Вставь поле ввода» | «Insert an input» |
| «Добавь синюю кнопку» | «Add a blue button» |

Типы элементов: **button**, **heading**, **input**, **text**, **container**

### Изменение свойств (нужен выбранный элемент)
| Русский | English |
|---|---|
| «Сделай красным» | «Make it red» |
| «Измени цвет на синий» | «Change color to blue» |
| «Измени текст на Привет» | «Change text to Hello» |
| «Увеличь» / «Уменьши» | «Make bigger» / «Make smaller» |
| «Сделай жирным» | «Make bold» |
| «Сделай курсивом» | «Make italic» |
| «Выровняй по центру» | «Align center» |
| «Примени стиль заголовка / акцент / приглушённый / выделение» | «Apply heading / accent / subtle / highlight style» |

### Перемещение, дублирование, группировка
| Русский | English |
|---|---|
| «Перемести влево / вправо / в начало / в конец» | «Move left / right / to start / to end» |
| «Продублируй элемент» | «Duplicate the element» |
| «Сгруппируй последние два элемента» | «Group the last two elements» |
| «Разгруппируй элемент» | «Ungroup the element» |

### Навигация
| Русский | English |
|---|---|
| «Выбери первую кнопку» | «Select the first button» |
| «Выбери последний» | «Select the last» |
| «Удали» | «Delete» |
| «Отмена» | «Undo» |
| «Очисти всё» | «Clear all» |

### Составные команды
Несколько действий в одной фразе через «и» / «затем» / запятую — каждый сегмент распознаётся независимо:

| Русский | English |
|---|---|
| «Добавь кнопку и сделай её синей» | «Add a button and make it blue» |
| «Выбери заголовок, увеличь и сделай жирным» | «Select the heading, make it bigger and bold» |

### Уточнение неясных команд («вы имели в виду…?»)
Если каскад распознал фразу, но недостаточно уверенно (скор трансформера ниже порога автоматического выполнения), система не выполняет действие молча — она переспрашивает и ждёт подтверждения голосом:

```
Пользователь: «сделай так чтобы было хорошо»
Система:      «Уточнение: Вы имели в виду — изменить размер? Скажите «да» или «нет»

Пользователь: «нет»
Система:      команда отменена, действие не выполняется
```

Подтверждение распознаётся коротким ответом — «да/ага/точно/именно» / «нет/не то/отмена» (RU), «yes/yeah/correct» / «no/nope/cancel» (EN). Любой другой ответ трактуется как новая команда.

### Горячие клавиши
| Клавиша | Действие |
|---|---|
| `Space` | Включить / выключить микрофон |
| `Ctrl+Z` | Отменить действие |

---

## Метрики эксперимента

`MetricsCalculator.ts` реализует следующие метрики как чистые функции:

| Метрика | Описание |
|---|---|
| **WER** | Word Error Rate — расстояние Левенштейна на уровне слов между транскриптом и эталонной фразой |
| **TSR** | Task Success Rate — доля заданий, выполненных хотя бы раз |
| **FASR** | First Attempt Success Rate — доля заданий, выполненных с первой попытки |
| **Retry Rate** | Среднее количество попыток на задание |
| **OOD%** | Доля команд, не распознанных системой (out-of-domain) |
| **Avg Latency** | Средняя задержка распознавания речи (мс) |

---

## Установка и запуск

```bash
# Клонировать репозиторий
git clone <repo-url>
cd voice-app

# Установить зависимости
npm install

# Запустить dev-сервер
npm run dev
# → http://localhost:5173/~eozakharenko/voicecanvas/

# Production-сборка
npm run build
# → dist/
```

> **Требование:** браузер Chrome (Web Speech API поддерживается только в нём).

---

## Развёртывание на se.ifmo.ru

```bash
npm run build
# Загрузить содержимое dist/ в ~/public_html/voicecanvas/ на сервере
```

База пути настроена в `vite.config.ts`:
```ts
base: '/~eozakharenko/voicecanvas/'
```

---

## Структура данных эксперимента

Каждая голосовая команда в режиме эксперимента записывается как `LogEntry`:

```typescript
type LogEntry = {
  participantId: string      // ID участника
  sessionId: string          // ID сессии
  timestamp: string          // ISO 8601
  lang: 'ru' | 'en'
  scenario: 1 | 2 | 3
  taskIdx: number
  taskAttempt: number
  isFirstAttempt: boolean
  rawTranscript: string      // Текст из Web Speech API
  latencyMs: number
  detectedIntent: string     // Распознанный интент
  detectedVia: 'regex' | 'clarify' | 'ood'  // Источник классификации
  extractedSlots: object     // Извлечённые слоты
  confidence: number         // 1.0 для regex, косинусное сходство для transformer
  transformerScore: number | null  // Сырой скор модели (null для regex-пути)
  wer: number                // Word Error Rate [0, 1]
  referenceText: string      // Эталонная фраза для WER
  actionResult: 'success' | 'fail' | 'ood'
  errorType: string | null
  elementCount: number
  taskElapsedMs: number
}
```

Экспорт по завершении сессии — **JSON** и **CSV** (UTF-8 с BOM для Excel).

---

## Сценарии эксперимента

| Сценарий | Название | Кол-во заданий |
|---|---|---|
| 1 | Базовые команды | 5 |
| 2 | Составные команды | 4 |
| 3 | Свободное задание | 3 |

---

## Лицензия

Учебный проект. ИТМО, 2026.
