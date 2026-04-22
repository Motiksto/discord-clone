# Discord Clone

Десктоп мессенджер с поддержкой личных чатов, групп, каналов и голосовых комнат.

## Типы общения

1. **Личные чаты (DM)** — переписка один на один
2. **Группы** — чат для нескольких людей, все участники могут писать, голосовые каналы
3. **Каналы** — только владелец/admin публикует сообщения, остальные читают (как Telegram-канал)

## Стек технологий

**Frontend:**
- React 18 + Vite
- Tailwind CSS (неоновая тёмная тема)
- Socket.io Client
- LiveKit (голосовые каналы)
- Tauri 2 (десктоп приложение)

**Backend:**
- Node.js + Express
- Socket.io
- SQLite + better-sqlite3
- JWT + bcrypt
- LiveKit Server SDK

## Установка

### 1. Установить зависимости

```bash
# Клиент
cd client
npm install

# Сервер
cd server
npm install
```

### 2. Настроить переменные окружения

**Сервер (`/server/.env`):**
```env
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_URL=wss://your-livekit-server.com
```

**Клиент (`/client/.env`):**
```env
# Локальный режим
VITE_SERVER_URL=http://localhost:3000

# Или через ngrok для удалённого доступа
# VITE_SERVER_URL=https://abc123.ngrok-free.app
```

### 3. Установить Rust (для Tauri)

**Windows:**
```bash
winget install Rustlang.Rust.MSVC
```

**macOS:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Запуск

### Вариант 1: Браузерная версия

```bash
# Терминал 1: Сервер
cd server
npm start

# Терминал 2: Клиент
cd client
npm run dev
```

Откройте `http://localhost:5173` в браузере.

### Вариант 2: Tauri Desktop App

```bash
# Терминал 1: Сервер
cd server
npm start

# Терминал 2: Tauri приложение
cd client
npm run tauri:dev
```

Откроется нативное десктоп окно с кастомным titlebar.

## Сборка установщика

```bash
cd client
npm run tauri:build
```

Установщик будет создан в `client/src-tauri/target/release/bundle/`

## Особенности Tauri версии

- ✅ **Frameless окно** — без стандартных браузерных рамок
- ✅ **Кастомный titlebar** — в цветах приложения (#0f0d16)
- ✅ **Кнопки управления:**
  - Свернуть (фиолетовая)
  - Развернуть/Восстановить (фиолетовая)
  - Закрыть (красная #ff2d55 с glow)
- ✅ **Размер окна:** 1280x800 (минимум 900x600)
- ✅ **Автоопределение:** показывает titlebar только в Tauri

## Удалённый доступ через ngrok

Чтобы дать доступ другу:

```bash
# 1. Запустить ngrok
ngrok http 3000

# 2. Скопировать URL (например: https://abc123.ngrok-free.app)

# 3. Обновить /client/.env
VITE_SERVER_URL=https://abc123.ngrok-free.app

# 4. Перезапустить клиент
cd client
npm run dev
# или
npm run tauri:dev
```

Подробнее: [NGROK.md](./NGROK.md)

## Структура проекта

```
discord-clone/
├── client/                    # React + Tauri
│   ├── src/
│   │   ├── components/
│   │   │   ├── TitleBar.jsx   # Кастомный titlebar
│   │   │   ├── VoiceChannel.jsx
│   │   │   └── SpaceSettings.jsx
│   │   ├── utils/
│   │   │   ├── api.js         # REST API
│   │   │   └── socket.js      # Socket.io
│   │   └── App.jsx
│   ├── src-tauri/             # Tauri Rust
│   │   ├── src/main.rs
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── .env
│   └── package.json
├── server/                    # Node.js
│   ├── server.js
│   ├── db.js
│   ├── auth.js
│   ├── .env
│   └── package.json
├── README.md
├── TAURI.md                   # Tauri инструкции
└── NGROK.md                   # ngrok инструкции
```

## База данных

- `users` — пользователи с ролями
- `spaces` — группы/каналы
- `space_members` — участники с ролями (owner/admin/member)
- `text_channels` — текстовые каналы
- `voice_channels` — голосовые каналы (только в группах)
- `direct_chats` — личные диалоги
- `messages` — универсальные сообщения

## Система ролей

**В группах:**
- **Owner** — полный доступ
- **Admin** — управление каналами, кик, публикация
- **Member** — чтение и запись

**В каналах:**
- **Owner/Admin** — публикация сообщений
- **Member** — только чтение

## API Endpoints

- `POST /auth/register` — регистрация
- `POST /auth/login` — вход
- `GET /spaces` — список чатов
- `GET /spaces/:id/channels` — каналы (text + voice)
- `POST /spaces/:id/channels` — создать канал
- `DELETE /channels/:id` — удалить канал
- `GET /channels/:id/messages` — сообщения
- `POST /livekit/token` — токен для голосового канала
- `GET /dm` — личные диалоги
- `PATCH /space_members/:id/role` — изменить роль
- `DELETE /space_members/:id` — кикнуть

## Socket.io события

- `join_channel` / `join_dm` — присоединиться
- `send_message` — отправить сообщение
- `new_message` — получить сообщение
- `typing` — индикатор печати
- `user_status` — статус (online/offline)

## Дизайн

**Тёмная неоновая тема:**
- Фон: #0d0d0f, #12101a, #0f0d16
- Акценты: фиолетовый #9d4edd, красный #ff2d55
- Неоновое свечение (glow эффекты)
- Шрифт: Inter

## Команды

```bash
# Разработка (браузер)
npm run dev

# Разработка (Tauri)
npm run tauri:dev

# Сборка (браузер)
npm run build

# Сборка (Tauri установщик)
npm run tauri:build
```

## Документация

- [TAURI.md](./TAURI.md) — подробная инструкция по Tauri
- [NGROK.md](./NGROK.md) — настройка удалённого доступа

## Следующие шаги

- Загрузка файлов и изображений
- Screen sharing в голосовых каналах
- Реакции на сообщения
- End-to-end шифрование для DM
- Поиск по сообщениям
- Push уведомления
