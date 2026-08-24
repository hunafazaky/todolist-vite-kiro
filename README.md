# Todo List App

A lightweight, browser-based task management application built as a Dicoding front-end submission. It runs entirely in the browser with no backend — tasks are persisted to `localStorage` so they survive page refreshes.

---

## Key Features

- **Add tasks** — Create tasks with a title validated to be non-empty and at most 255 characters.
- **Edit tasks** — Inline editing mode with Save and Cancel actions.
- **Delete tasks** — Remove any task from the list permanently.
- **Toggle completion** — Mark tasks as complete or active with a checkbox.
- **Filter view** — Switch between All, Active, and Completed views without losing data.
- **LocalStorage persistence** — Task state is saved and restored automatically across sessions.
- **Inline validation errors** — User-friendly messages appear next to the input field on invalid submission.
- **Error banner** — Global dismissible banner surfaces storage failures.
- **Unidirectional state management** — Predictable state flow via a pure reducer and a centralized store.

---

## Installation and Execution

**Prerequisites:** Node.js 18 or later and npm.

```bash
# 1. Clone the repository
git clone <repository-url>
cd learn-dicoding

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Other Commands

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview

# Run all tests (single pass)
npm test

# Run tests in watch mode
npm run test:watch

# Open the Vitest UI
npm run test:ui
```

---

## Folder Structure

```
learn-dicoding/
├── index.html               # HTML entry point and app mount
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── src/
    ├── main.ts              # Bootstrap, event delegation
    ├── store.ts             # Centralized state container
    ├── reducer.ts           # Pure state-transition function
    ├── render.ts            # DOM rendering (state -> UI)
    ├── storage.ts           # localStorage read/write helpers
    ├── validation.ts        # Title validation logic
    ├── types.ts             # Shared TypeScript types and interfaces
    ├── styles.css           # Application styles
    └── __tests__/
        ├── arbitraries.ts
        ├── reducer.unit.test.ts
        ├── reducer.property1-4,9.test.ts
        ├── render.unit.test.ts
        ├── render.property6-7.test.ts
        ├── storage.unit.test.ts
        ├── storage.property8.test.ts
        ├── validation.test.ts
        └── property5-edit-preserves-metadata.test.ts
```

---

## Technologies Used

| Technology | Role |
|---|---|
| TypeScript 5 | Application language with strict mode |
| Vite 6 | Development server and production bundler |
| Vitest 3 | Test runner |
| fast-check 3 | Property-based testing |
| happy-dom | DOM environment for tests |
| localStorage API | Client-side task persistence |
| Web Crypto API | UUID generation (`crypto.randomUUID`) |