# Discord Clone - Улучшения

## Добавленные функции

### 1. Реакции на сообщения
- **Эмодзи пикер** — 8 популярных эмодзи (👍 ❤️ 😂 😮 😢 🔥 🎉 👏)
- **Счётчик реакций** — показывает количество каждой реакции
- **Неоновый highlight** — фиолетовое свечение если ты реагировал
- **Hover на сообщении** — показывает кнопку добавления реакции

### 2. Статусы пользователей
- **Online** (зелёный) — активен
- **Away** (жёлтый) — нет на месте
- **DND** (красный) — не беспокоить
- **Offline** (серый) — не в сети
- **Точка статуса** — на аватаре с лёгким glow эффектом

### 3. Приглашение по ссылке
- **Генерация кода** — автоматически при создании группы/канала
- **GET /invite/:code** — присоединение по коду
- **Проверка прав** — только участники могут приглашать

### 4. Бейдж непрочитанных
- **Фиолетовый кружок** — с числом непрочитанных
- **На каналах** — показывает новые сообщения
- **На диалогах** — показывает непрочитанные DM
- **Автообновление** — при получении новых сообщений

### 5. Поиск по сообщениям
- **Иконка лупы** — в верхней панели
- **Поиск по содержимому** — LIKE запрос в SQLite
- **Выделение результатов** — фиолетовый highlight с glow
- **Быстрый доступ** — Ctrl+F (в будущем)

### 6. Анимации
- **Появление сообщений** — fade + slide снизу (0.3s)
- **Hover на сообщениях** — показывает кнопки реакции и удаления
- **Плавные переходы** — все hover эффекты с transition
- **Без белых вспышек** — только фиолетово-красные неоновые цвета

## База данных

**Новые таблицы:**
```sql
-- Реакции
CREATE TABLE message_reactions (
  id INTEGER PRIMARY KEY,
  message_id INTEGER,
  user_id INTEGER,
  emoji TEXT,
  created_at DATETIME
);

-- Обновлённые поля
ALTER TABLE users ADD COLUMN custom_status TEXT;
ALTER TABLE spaces ADD COLUMN invite_code TEXT UNIQUE;
ALTER TABLE space_members ADD COLUMN last_read_message_id INTEGER;
ALTER TABLE direct_chats ADD COLUMN user1_last_read INTEGER;
ALTER TABLE direct_chats ADD COLUMN user2_last_read INTEGER;
```

## API Endpoints

**Статусы:**
- `PATCH /users/status` — обновить статус

**Приглашения:**
- `POST /invite/:code` — присоединиться по коду

**Реакции:**
- `POST /messages/:id/reactions` — добавить реакцию
- `DELETE /messages/:id/reactions/:emoji` — удалить реакцию
- `GET /messages/:id/reactions` — получить реакции

**Поиск:**
- `GET /channels/:id/search?q=query` — поиск в канале
- `GET /dm/:id/search?q=query` — поиск в DM

**Прочитанные:**
- `POST /read` — отметить как прочитанное

**Удаление:**
- `DELETE /messages/:id` — удалить своё сообщение

## Компоненты

**Новые:**
- `EmojiPicker.jsx` — выбор эмодзи для реакций
- `StatusIndicator.jsx` — точка статуса с glow
- `UnreadBadge.jsx` — фиолетовый бейдж с числом
- `SearchBar.jsx` — поиск по сообщениям

**Обновлённые:**
- `ChatArea.jsx` — реакции, поиск, анимации
- `ChannelList.jsx` — бейджи непрочитанных
- `index.css` — анимации, статусы, highlight

## Стили

**Новые CSS классы:**
```css
.status-online   /* зелёный с glow */
.status-away     /* жёлтый с glow */
.status-dnd      /* красный с glow */
.status-offline  /* серый без glow */
.message-enter   /* анимация появления */
.search-highlight /* фиолетовый highlight */
```

## Использование

### Реакции
```jsx
<EmojiPicker onSelect={handleReaction} onClose={closeP icker} />
```

### Статусы
```jsx
<StatusIndicator status="online" size="md" />
```

### Бейджи
```jsx
<UnreadBadge count={5} />
```

### Поиск
```jsx
<SearchBar onSearch={handleSearch} onClose={closeSearch} />
```

## Цветовая схема

Все элементы используют единую неоновую тему:
- Фиолетовый #9d4edd — основной акцент
- Красный #ff2d55 — опасные действия
- Зелёный #22c55e — online статус
- Жёлтый #eab308 — away статус
- Без белых вспышек — только тёмные тона с неоновым glow
