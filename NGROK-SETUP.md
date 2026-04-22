# 🌐 Настройка ngrok для удалённого доступа

## ⚠️ ngrok требует регистрацию (бесплатно)

### Шаг 1: Зарегистрироваться

Откройте: **https://dashboard.ngrok.com/signup**

Зарегистрируйтесь через:
- GitHub
- Google
- Email

### Шаг 2: Получить authtoken

После регистрации откройте: **https://dashboard.ngrok.com/get-started/your-authtoken**

Скопируйте ваш токен (выглядит так):
```
2abc123def456ghi789jkl012mno345pqr678stu
```

### Шаг 3: Установить authtoken

Выполните в терминале:

```bash
./ngrok config add-authtoken YOUR_TOKEN_HERE
```

Замените `YOUR_TOKEN_HERE` на ваш токен.

### Шаг 4: Запустить туннель

```bash
./ngrok http 3000
```

Вы увидите:
```
ngrok                                                                    

Session Status                online
Account                       your-email@example.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Скопируйте URL:** `https://abc123.ngrok-free.app`

### Шаг 5: Обновить клиент

Остановите клиент (найдите терминал с Vite и нажмите Ctrl+C)

Измените `E:\Claude\discord-clone\client\.env`:

```env
VITE_SERVER_URL=https://abc123.ngrok-free.app
```

### Шаг 6: Перезапустить клиент

```bash
cd E:\Claude\discord-clone\client
npm run dev
```

---

## 📱 Как поделиться с друзьями

### Вариант А: Друзья запускают локально

**Отправьте друзьям:**

1. **Ссылку на репозиторий** (если на GitHub)
2. **Ваш ngrok URL:** `https://abc123.ngrok-free.app`

**Что им нужно сделать:**

```bash
# 1. Склонировать проект
git clone <your-repo-url>
cd discord-clone/client

# 2. Установить зависимости
npm install

# 3. Создать .env файл
echo VITE_SERVER_URL=https://abc123.ngrok-free.app > .env

# 4. Запустить
npm run dev
```

Откроют: `http://localhost:5173`

---

### Вариант Б: Деплой клиента (проще для друзей)

**Vercel (бесплатно, 5 минут):**

1. Зарегистрируйтесь на [vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. Выберите папку `client`
4. Environment Variables:
   - Name: `VITE_SERVER_URL`
   - Value: `https://abc123.ngrok-free.app`
5. Deploy

Получите ссылку типа: `https://discord-clone.vercel.app`

**Отправьте друзьям эту ссылку** — они просто откроют в браузере!

---

## 🎯 Текущий статус

✅ **Сервер запущен:** http://localhost:3000  
✅ **Клиент запущен:** http://localhost:3001  
✅ **ngrok скачан:** готов к настройке  

**Следующий шаг:** Зарегистрируйтесь на ngrok и выполните Шаг 3 ☝️

---

## 💡 Альтернатива без ngrok

Если не хотите регистрироваться на ngrok, используйте:

**LocalTunnel (без регистрации):**

```bash
npm install -g localtunnel
lt --port 3000
```

Получите URL типа: `https://random-name.loca.lt`

Используйте его вместо ngrok URL в `.env`

---

## 📞 Нужна помощь?

- **ngrok документация:** https://ngrok.com/docs
- **Vercel документация:** https://vercel.com/docs
- **LocalTunnel:** https://github.com/localtunnel/localtunnel
