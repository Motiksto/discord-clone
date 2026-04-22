# Discord Clone - Tauri Desktop App

## Запуск в режиме разработки

### 1. Запустить бэкенд сервер

```bash
cd server
npm start
```

### 2. Запустить Tauri приложение

```bash
cd client
npm run tauri:dev
```

Приложение откроется в нативном окне без браузерных рамок.

## Сборка установщика

```bash
cd client
npm run tauri:build
```

Установщик будет создан в `client/src-tauri/target/release/bundle/`

## Особенности Tauri версии

- **Frameless окно** — без стандартных рамок браузера
- **Кастомный titlebar** — в цветах приложения (#0f0d16)
- **Кнопки управления окном:**
  - Свернуть (фиолетовая)
  - Развернуть/Восстановить (фиолетовая)
  - Закрыть (красная #ff2d55)
- **Размер окна:** 1280x800 (минимум 900x600)
- **Иконка:** Фиолетовая молния на тёмном фоне

## Переключение между браузером и Tauri

Приложение автоматически определяет, запущено ли оно в Tauri:
- В Tauri — показывается кастомный titlebar
- В браузере — стандартный вид без titlebar

## Требования

- **Rust** — для сборки Tauri
- **Node.js** — для фронтенда
- **Бэкенд сервер** — должен быть запущен отдельно

## Установка Rust (если не установлен)

**Windows:**
```bash
winget install Rustlang.Rust.MSVC
```

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Структура Tauri

```
client/
├── src-tauri/
│   ├── src/
│   │   └── main.rs          # Точка входа Rust
│   ├── icons/               # Иконки приложения
│   ├── Cargo.toml           # Зависимости Rust
│   ├── tauri.conf.json      # Конфигурация Tauri
│   └── build.rs             # Build script
├── src/
│   ├── components/
│   │   └── TitleBar.jsx     # Кастомный titlebar
│   └── App.jsx              # Определение Tauri
└── package.json
```

## Команды

- `npm run tauri:dev` — запуск в режиме разработки
- `npm run tauri:build` — сборка установщика
- `npm run tauri` — прямой доступ к Tauri CLI
