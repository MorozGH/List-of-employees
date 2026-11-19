# DESIGN.md — «Список сотрудников»

Дизайн-контракт для UI. Сложный дизайн по заданию не требуется: цель — аккуратный, читаемый интерфейс без визуального шума.

## Направление

Нейтральный светлый интерфейс в духе небольших админ-панелей: контент по центру, ограниченная ширина, ясная иерархия. Без UI-библиотек — обычный CSS с дизайн-токенами в CSS-переменных.

## Токены (CSS custom properties)

```css
:root {
  /* Цвет */
  --color-bg: #f6f7f9;
  --color-surface: #ffffff;
  --color-border: #e2e5ea;
  --color-text: #1c1f24;
  --color-text-muted: #6b7280;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  /* Типографика */
  --font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;

  /* Отступы (шаг 4px) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Прочее */
  --radius: 8px;
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.08);
  --layout-max-width: 960px;
}
```

## Компоненты

- **Button** — primary (заливка `--color-primary`) и secondary (обводка); disabled-состояние обязательно.
- **Input / Select** — единая высота 40px, border `--color-border`, focus-ring `--color-primary`; label над полем; ошибка под полем цветом `--color-danger`.
- **Card** — поверхность `--color-surface`, `--radius`, `--shadow-card`; контейнеры форм и списка.
- **Table / List** — список сотрудников: ФИО (акцент), должность, отдел (badge). Пустое состояние — явный текст, не пустая таблица.
- **Header** — название приложения слева, email пользователя и «Выйти» справа.

## Правила

- Do: все цвета, отступы и радиусы — только через токены; состояния hover/focus/disabled у интерактивных элементов; контраст текста не ниже WCAG AA.
- Don't: инлайн-стили, произвольные hex-цвета в компонентах, UI-библиотеки (по заданию — обычный CSS).

## Экраны

1. **Auth** — переключение Вход / Регистрация, email + пароль, ошибки валидации под полями.
2. **Employees** — панель поиска (по ФИО) и фильтра (отдел), кнопка «Добавить сотрудника», список, форма добавления (ФИО, должность, отдел — все обязательны).