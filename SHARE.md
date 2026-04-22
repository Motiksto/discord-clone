# 🌍 Как дать доступ друзьям

## Вариант 1: ngrok (Рекомендуется)

### Шаг 1: Установить ngrok

**Windows:**
```bash
choco install ngrok
```

Или скачайте с [ngrok.com](https://ngrok.com/download)

### Шаг 2: Запустить ngrok туннель

Откройте **новый терминал** и выполните:

```bash
ngrok http 3000
```

Вы увидите:
```
ngrok                                                                    

Session Status                online
Account                       your-account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Скопируйте URL:** `https://abc123.ngrok-free.app`

### Шаг 3: Обновить клиент

Остановите клиент (Ctrl+C в терминале) и измените `client/.env`:

```env
VITE_SERVER_URL=https://abc123.ngrok-free.app
```

### Шаг 4: Перезапустить клиент

```bash
cd client
npm run dev
```

### Шаг 5: Поделиться ссылкой

Отправьте друзьям:
```
http://localhost:3001
```

**Важно:** Друзья должны:
1. Склонировать репозиторий
2. Установить зависимости: `cd client && npm install`
3. Создать `client/.env` с вашим ngrok URL
4. Запустить: `npm run dev`

---

## Вариант 2: Деплой на хостинг (Постоянный доступ)

### Для сервера:

**Railway.app** (бесплатно):
1. Зарегистрируйтесь на [railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий
4. Выберите папку `server`
5. Railway автоматически деплоит

**Render.com** (бесплатно):
1. Зарегистрируйтесь на [render.com](https://render.com)
2. New → Web Service
3. Подключите GitHub
4. Build Command: `cd server && npm install`
5. Start Command: `cd server && npm start`

### Для клиента:

**Vercel** (бесплатно):
1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. Import Project
3. Выберите папку `client`
4. Добавьте переменную окружения:
   - `VITE_SERVER_URL` = URL вашего сервера
5. Deploy

**Netlify** (бесплатно):
1. Зарегистрируйтесь на [netlify.com](https://netlify.com)
2. New site from Git
3. Build command: `cd client && npm run build`
4. Publish directory: `client/dist`
5. Environment variables: `VITE_SERVER_URL`

---

## Вариант 3: Локальная сеть (Только для друзей в той же сети)

### Шаг 1: Узнать свой IP

**Windows:**
```bash
ipconfig
```

Найдите `IPv4 Address`, например: `192.168.1.100`

**macOS/Linux:**
```bash
ifconfig
```

### Шаг 2: Обновить клиент

Измените `client/.env`:

```env
VITE_SERVER_URL=http://192.168.1.100:3000
```

### Шаг 3: Запустить с доступом из сети

```bash
cd client
npm run dev -- --host
```

### Шаг 4: Поделиться ссылкой

Отправьте друзьям:
```
http://192.168.1.100:3001
```

**Важно:** Работает только если друзья в той же WiFi сети!

---

## Вариант 4: Tauri установщик (Десктоп приложение)

### Шаг 1: Собрать установщик

```bash
cd client
npm run tauri:build
```

Установщик будет в: `client/src-tauri/target/release/bundle/`

### Шаг 2: Поделиться файлом

Отправьте друзьям:
- **Windows:** `.msi` или `.exe`
- **macOS:** `.dmg`
- **Linux:** `.deb` или `.AppImage`

**Важно:** Друзья должны указать ваш ngrok URL в настройках приложения!

---

## Рекомендация

**Для тестирования с друзьями:**
→ Используйте **ngrok** (Вариант 1)

**Для постоянного использования:**
→ Задеплойте на **Railway + Vercel** (Вариант 2)

**Для локальной вечеринки:**
→ Используйте **локальную сеть** (Вариант 3)

---

## Текущая конфигурация

Ваш сервер сейчас запущен на:
- **Локально:** http://localhost:3000
- **Клиент:** http://localhost:3001

Чтобы дать доступ друзьям, выполните **Вариант 1** (ngrok) ☝️
