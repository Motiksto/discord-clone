# 🚀 Инструкция по запуску Discord Clone

## Требования

- **Node.js** 18+ ([скачать](https://nodejs.org/))
- **Rust** (для Tauri) ([установка](#установка-rust))
- **LiveKit сервер** (опционально, для голосовых каналов)

---

## 📦 Установка

### 1. Клонировать репозиторий

```bash
cd E:/Claude/discord-clone
```

### 2. Установить зависимости

**Сервер:**
```bash
cd server
npm install
```

**Клиент:**
```bash
cd client
npm install
```

### 3. Настроить переменные окружения

**Сервер (`server/.env`):**
```env
# LiveKit (опционально, для голосовых каналов)
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_URL=wss://your-livekit-server.com

# Или используйте бесплатный LiveKit Cloud:
# https://cloud.livekit.io/
```

**Клиент (`client/.env`):**
```env
# Локальный режим (по умолчанию)
VITE_SERVER_URL=http://localhost:3000
```

---

## 🌐 Запуск в браузере

### Шаг 1: Запустить сервер

```bash
cd server
npm start
```

Вы увидите:
```
Server running on http://localhost:3000
```

### Шаг 2: Запустить клиент

Откройте **новый терминал**:

```bash
cd client
npm run dev
```

Вы увидите:
```
VITE v5.2.11  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Шаг 3: Открыть в браузере

Откройте: **http://localhost:5173**

---

## 🖥️ Запуск Tauri (десктоп приложение)

### Установка Rust

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

После установки перезапустите терминал.

### Запуск

**Шаг 1: Запустить сервер**
```bash
cd server
npm start
```

**Шаг 2: Запустить Tauri**

Откройте **новый терминал**:

```bash
cd client
npm run tauri:dev
```

Откроется нативное десктоп окно с кастомным titlebar.

---

## 🌍 Удалённый доступ через ngrok

Чтобы дать доступ другу к вашему серверу:

### 1. Установить ngrok

**Windows:**
```bash
choco install ngrok
```

**macOS:**
```bash
brew install ngrok
```

**Linux:**
```bash
snap install ngrok
```

### 2. Запустить сервер

```bash
cd server
npm start
```

### 3. Запустить ngrok

Откройте **новый терминал**:

```bash
ngrok http 3000
```

Вы увидите:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

Скопируйте URL (например: `https://abc123.ngrok-free.app`)

### 4. Обновить клиент

Измените `client/.env`:

```env
VITE_SERVER_URL=https://abc123.ngrok-free.app
```

### 5. Перезапустить клиент

```bash
cd client
npm run dev
# или
npm run tauri:dev
```

Теперь ваш друг может использовать тот же URL и подключиться к вашему серверу!

---

## 📱 Первый запуск

### 1. Регистрация

- Откройте приложение
- Введите **username** и **password** (минимум 6 символов)
- Нажмите **Register**

### 2. Создание сервера

- Нажмите **+** в левой панели
- Выберите тип:
  - **Group** — все могут писать, есть голосовые каналы
  - **Channel** — только owner/admin публикуют

### 3. Создание каналов

- Нажмите **⚙️** (настройки) рядом с названием сервера
- Вкладка **Channels**
- Введите название и выберите тип (Text/Voice)
- Нажмите **Create**

### 4. Приглашение друзей

- Откройте настройки сервера
- Скопируйте **invite code**
- Отправьте другу
- Друг вводит код в поле приглашения

---

## 🎯 Основные функции

### Типы общения

1. **Личные чаты (DM)** — переписка один на один
2. **Группы** — все участники могут писать, голосовые каналы
3. **Каналы** — только owner/admin публикуют (как Telegram)

### Роли

- **Owner** — полный доступ
- **Admin** — управление каналами, кик, публикация
- **Member** — чтение и запись (в группах), только чтение (в каналах)

### Статусы

- 🟢 **Online** — активен
- 🟡 **Away** — нет на месте
- 🔴 **DND** — не беспокоить
- ⚫ **Offline** — не в сети

### Реакции

- Наведите на сообщение
- Нажмите **😊** (эмодзи)
- Выберите реакцию
- Фиолетовое свечение = вы реагировали

### Голосовые каналы

- Доступны только в **группах**
- Нажмите на голосовой канал 🔊
- Управление: микрофон, видео, отключение
- Неоновая рамка вокруг говорящих

### Поиск

- Нажмите 🔍 в верхней панели
- Введите запрос
- Результаты с фиолетовым highlight

---

## 🛠️ Команды

```bash
# Разработка (браузер)
cd client && npm run dev

# Разработка (Tauri)
cd client && npm run tauri:dev

# Сборка (браузер)
cd client && npm run build

# Сборка (Tauri установщик)
cd client && npm run tauri:build
```

---

## 🐛 Решение проблем

### Сервер не запускается

**Проблема:** `Error: listen EADDRINUSE: address already in use :::3000`

**Решение:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Клиент не подключается

**Проблема:** `Socket connection error`

**Решение:**
1. Проверьте, что сервер запущен
2. Проверьте `VITE_SERVER_URL` в `client/.env`
3. Перезапустите клиент после изменения `.env`

### Tauri не собирается

**Проблема:** `error: could not compile`

**Решение:**
1. Убедитесь, что Rust установлен: `rustc --version`
2. Обновите Rust: `rustup update`
3. Очистите кэш: `cd client/src-tauri && cargo clean`

### Голосовые каналы не работают

**Проблема:** `Failed to generate LiveKit token`

**Решение:**
1. Проверьте `server/.env` — заполнены ли LiveKit credentials
2. Зарегистрируйтесь на [LiveKit Cloud](https://cloud.livekit.io/)
3. Скопируйте API Key, Secret и URL

---

## 📚 Документация

- [README.md](./README.md) — общая информация
- [TAURI.md](./TAURI.md) — Tauri инструкции
- [NGROK.md](./NGROK.md) — удалённый доступ
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) — новые функции

---

## 🎨 Дизайн

**Тёмная неоновая тема:**
- Фон: #0d0d0f, #12101a, #0f0d16
- Акценты: фиолетовый #9d4edd, красный #ff2d55
- Неоновое свечение (glow эффекты)
- Шрифт: Inter

---

## ✅ Готово!

Теперь вы можете:
- ✅ Создавать группы и каналы
- ✅ Приглашать друзей по ссылке
- ✅ Общаться в текстовых и голосовых каналах
- ✅ Реагировать на сообщения эмодзи
- ✅ Искать по сообщениям
- ✅ Управлять ролями участников
- ✅ Использовать в браузере или как десктоп приложение

**Приятного использования! 🚀**
