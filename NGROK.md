# Переключение между локальным и удалённым режимом

## Локальный режим (по умолчанию)

Для работы на одном компьютере используйте локальный режим.

**`/client/.env`:**
```env
VITE_SERVER_URL=http://localhost:3000
```

Запустите сервер и клиент:
```bash
# Терминал 1
cd server
npm start

# Терминал 2
cd client
npm run dev
```

## Удалённый доступ через ngrok

Чтобы дать доступ другу к вашему серверу:

### Шаг 1: Установить ngrok

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

### Шаг 2: Запустить сервер

```bash
cd server
npm start
```

Сервер должен работать на `http://localhost:3000`

### Шаг 3: Запустить ngrok туннель

В новом терминале:
```bash
ngrok http 3000
```

Вы увидите:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

Скопируйте URL (например: `https://abc123.ngrok-free.app`)

### Шаг 4: Обновить клиент

Измените `/client/.env`:
```env
VITE_SERVER_URL=https://abc123.ngrok-free.app
```

### Шаг 5: Перезапустить клиент

```bash
cd client
npm run dev
```

Теперь:
- Вы можете открыть клиент локально
- Ваш друг может открыть клиент у себя (с тем же `VITE_SERVER_URL`)
- Все подключатся к вашему серверу через ngrok

## Что использует VITE_SERVER_URL

✅ **REST API** (`/client/src/utils/api.js`)
- Все fetch запросы: `/auth/login`, `/spaces`, `/channels`, `/dm`, `/livekit/token`

✅ **Socket.io** (`/client/src/utils/socket.js`)
- WebSocket подключение для real-time сообщений

✅ **LiveKit** (`/client/src/components/VoiceChannel.jsx`)
- Получение токена через `/livekit/token`

## Важно

- **Сервер должен быть запущен** на вашем компьютере
- **ngrok туннель должен быть активен** (не закрывайте терминал с ngrok)
- **Перезапустите клиент** после изменения `.env`
- **Один URL для всех** — все участники используют один и тот же `VITE_SERVER_URL`

## Возврат к локальному режиму

Измените `/client/.env` обратно:
```env
VITE_SERVER_URL=http://localhost:3000
```

Перезапустите клиент:
```bash
cd client
npm run dev
```
