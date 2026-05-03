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
| Backend | — (статика, нет сервера) |

---

## Архитектура

```
src/
├── core/                    # Чистый TypeScript — нет зависимостей от React/Mantine
│   ├── asr/                 # SpeechRecognizer — обёртка над Web Speech API
│   ├── nlu/                 # IntentMatcher — parseIntent(text, lang) → ParseResult
│   │   ├── patterns/        # RU и EN паттерны (RegExp + SlotExtractor)
│   │   └── normalizers.ts   # Нормализация цвета, типа элемента, индекса
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
   Голос → SpeechRecognizer → IntentMatcher → EditorEngine → Zustand → React UI
                                                           ↓
                                                     SessionLogger
   ```

3. **Иммутабельное состояние редактора.** `EditorEngine` принимает `EditorState` и возвращает новый `EditorState`. `UndoManager` — просто стек снапшотов.

4. **`experiment/` изолирован от `core/`.** Продукт работает без экспериментального режима. Логирование подключается снаружи через события, не встроено в бизнес-логику.

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

### Навигация
| Русский | English |
|---|---|
| «Выбери первую кнопку» | «Select the first button» |
| «Выбери последний» | «Select the last» |
| «Удали» | «Delete» |
| «Отмена» | «Undo» |
| «Очисти всё» | «Clear all» |

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
  extractedSlots: object     // Извлечённые слоты
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
