# Implementation Plan: Todo List App

## Overview

Implement a client-side single-page Todo List app using Vanilla TypeScript, Vite, and Vitest. The implementation follows a unidirectional data-flow architecture. Tasks are ordered so that foundational types and pure logic are built first, then persistence, then the store, then the render layer, and finally the entry-point wiring. Property-based tests (fast-check) are placed immediately after the code they cover.

---

## Tasks

- [x] 1. Scaffold project structure and shared types
  - Initialise a Vite + TypeScript project (`npm create vite@latest`)
  - Install dependencies: `vitest`, `fast-check`, `@vitest/ui` (dev)
  - Create `src/types.ts` with `Task`, `FilterOption`, `AppState`, and `Action` interfaces and type aliases exactly as specified in the design
  - Create `src/index.html` with a minimal shell (header, `#app` mount point, filter bar placeholder)
  - _Requirements: 1.1, 2.1, 2.2_

- [x] 2. Implement validation module
  - [x] 2.1 Create `src/validation.ts`
    - Export `validateTitle(raw: string): string | null` — returns trimmed title on success, an error string on failure
    - Enforce: non-empty after trim, length ≤ 255 characters
    - _Requirements: 1.3, 1.5, 5.3, 5.4_

  - [x] 2.2 Write unit tests for `validation.ts`
    - Test: empty string, single space, tab/newline-only string → error
    - Test: 255-char string → valid
    - Test: 256-char string → error
    - Test: valid title with leading/trailing whitespace → trimmed value returned
    - _Requirements: 1.3, 1.5_

- [x] 3. Implement reducer
  - [x] 3.1 Create `src/reducer.ts`
    - Export `reducer(state: AppState, action: Action): AppState` as a pure function
    - Handle all nine `Action` variants: `ADD_TASK`, `DELETE_TASK`, `TOGGLE_TASK`, `EDIT_START`, `EDIT_SAVE`, `EDIT_CANCEL`, `SET_FILTER`, `HYDRATE`, `CLEAR_ERROR`
    - `ADD_TASK`: validate title via `validateTitle`; on failure set `error` and leave tasks unchanged; on success prepend new task with UUID v4, `completed: false`, and `createdAt: new Date().toISOString()`
    - `TOGGLE_TASK` / `DELETE_TASK`: no-op when ID is not found
    - `EDIT_SAVE`: validate new title; update only `title` field, leave `id`, `completed`, `createdAt` untouched
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.2, 3.3, 4.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 3.2 Write property test — Property 1: valid task creation prepends to list
    - **Property 1: Valid task creation prepends to list**
    - **Validates: Requirements 1.2, 1.4, 2.1**
    - Use arbitraries: `arbitraryTaskList`, `arbitraryTitle`

  - [x] 3.3 Write property test — Property 2: whitespace-only titles rejected
    - **Property 2: Whitespace-only and empty titles are rejected**
    - **Validates: Requirements 1.3**
    - Use arbitraries: `arbitraryTaskList`, `arbitraryWhitespaceTitle`

  - [x] 3.4 Write property test — Property 3: titles exceeding 255 chars rejected
    - **Property 3: Title length boundary enforcement**
    - **Validates: Requirements 1.5**
    - Use arbitraries: `arbitraryTaskList`, `fc.string({ minLength: 256 })`

  - [x] 3.5 Write property test — Property 4: toggle is its own inverse
    - **Property 4: Toggle is its own inverse (round-trip)**
    - **Validates: Requirements 3.2, 3.3**
    - Use arbitraries: `arbitraryTask`

  - [x] 3.6 Write property test — Property 5: edit preserves identity and metadata
    - **Property 5: Edit preserves identity and metadata**
    - **Validates: Requirements 5.3**
    - Use arbitraries: `arbitraryTask`, `arbitraryTitle`

  - [x] 3.7 Write property test — Property 9: deletion removes exactly one task
    - **Property 9: Deletion removes exactly one task**
    - **Validates: Requirements 4.2**
    - Use arbitraries: `fc.array(arbitraryTask, { minLength: 1 })`

  - [x] 3.8 Write unit tests for `reducer.ts`
    - One test per action type with representative inputs
    - Boundary cases: toggle complete ↔ incomplete; edit with valid vs invalid title; `HYDRATE` replaces task list; `CLEAR_ERROR` resets error field
    - Guard tests: `TOGGLE_TASK` and `DELETE_TASK` with unknown IDs leave state unchanged
    - _Requirements: 1.2, 1.3, 3.2, 3.3, 4.2, 5.3, 5.4_

- [x] 4. Checkpoint — pure logic validated
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement persistence module
  - [x] 5.1 Create `src/storage.ts`
    - Export `loadTasks(): Task[]` — reads `"todolist-app-tasks"` from `localStorage`; returns `[]` on `null`; on malformed JSON catches the error and returns `[]` after setting an error signal
    - Export `saveTasks(tasks: Task[]): void` — writes `JSON.stringify(tasks)` inside a `try/catch`; on quota / security error surfaces via returned `Error` value (do not throw)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 5.2 Write property test — Property 8: localStorage serialisation round-trip
    - **Property 8: localStorage serialisation round-trip**
    - **Validates: Requirements 7.1, 7.2**
    - Use arbitraries: `arbitraryTaskList`
    - Mock `localStorage` (use `vitest` `vi.stubGlobal`)

  - [x] 5.3 Write unit tests for `storage.ts`
    - Mock `localStorage` with `vi.stubGlobal`
    - Test: successful write → `localStorage.setItem` called with serialised tasks
    - Test: quota-exceeded error → error returned, no throw
    - Test: `null` read → empty array, no error
    - Test: malformed-JSON read → empty array, error signal returned
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Implement store
  - [x] 6.1 Create `src/store.ts`
    - Maintain internal `AppState` with initial defaults (`tasks: []`, `filter: 'all'`, `editingId: null`, `error: null`)
    - Export `dispatch(action: Action): void` — runs reducer, saves tasks via `storage.saveTasks`, notifies subscribers
    - Export `subscribe(listener: (state: AppState) => void): () => void` — returns unsubscribe function
    - Export `getState(): AppState`
    - On module initialisation call `storage.loadTasks()` and dispatch `HYDRATE` to seed state; if `loadTasks` returns an error signal, dispatch `ADD_ERROR` (or set error via a `HYDRATE` variant)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. Implement render layer
  - [x] 7.1 Create `src/render.ts`
    - Export `render(state: AppState, root: HTMLElement): void`
    - Render task form (create mode vs edit mode based on `state.editingId`)
    - Render filter bar with correct active tab
    - Render task list filtered by `state.filter` in reverse chronological order
    - Render empty-state message when filtered list is empty
    - Render error banner when `state.error !== null`
    - Apply `text-decoration: line-through` CSS class to completed task titles
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Write property test — Property 6: Active filter shows only incomplete tasks
    - **Property 6: Filter correctness — Active**
    - **Validates: Requirements 6.3**
    - Use arbitraries: `arbitraryTaskList`

  - [x] 7.3 Write property test — Property 7: Completed filter shows only complete tasks
    - **Property 7: Filter correctness — Completed**
    - **Validates: Requirements 6.4**
    - Use arbitraries: `arbitraryTaskList`

  - [x] 7.4 Write unit tests for `render.ts` (DOM snapshots)
    - Use `vitest` with `jsdom` environment (`@vitest/browser` or `happy-dom`)
    - Test: given a state with tasks, rendered list has correct number of `<li>` elements
    - Test: completed task has strikethrough class
    - Test: empty task list shows empty-state message
    - Test: `editingId` non-null renders form in edit mode (pre-filled input, Save + Cancel buttons)
    - Test: `error` non-null renders error banner
    - _Requirements: 2.2, 2.3, 3.2, 5.2, 7.4_

- [x] 8. Checkpoint — render layer validated
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Wire entry point and event handlers
  - [x] 9.1 Create `src/main.ts`
    - Import store and render
    - Call `render(store.getState(), appRoot)` on initial load
    - Subscribe to store: re-render on every state change
    - Attach DOM event listeners for:
      - Task form submit → dispatch `ADD_TASK` or `EDIT_SAVE` depending on mode
      - Cancel button click → dispatch `EDIT_CANCEL`
      - Edit button click → dispatch `EDIT_START`
      - Delete button click → dispatch `DELETE_TASK`
      - Checkbox / toggle click → dispatch `TOGGLE_TASK`
      - Filter button click → dispatch `SET_FILTER`
      - Error banner dismiss (if applicable) → dispatch `CLEAR_ERROR`
    - Use event delegation on the task list container for task-level events
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4_

- [x] 10. Apply CSS styling
  - [x] 10.1 Create `src/styles.css`
    - Style task form (input, buttons, inline validation error)
    - Style task list items (checkbox, title, edit/delete buttons)
    - Style completed task title with `text-decoration: line-through`
    - Style filter bar with active-tab highlight
    - Style empty-state message
    - Style error banner
    - Import `styles.css` in `main.ts`
    - _Requirements: 1.1, 2.2, 3.2, 6.1_

- [x] 11. Final checkpoint — full integration
  - Ensure all tests pass (`npx vitest run`), ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- All property-based tests must run a minimum of 100 iterations (fast-check default is 100; no override needed unless specified)
- Each property-based test file must include the header comment: `// Feature: todolist-app, Property N: <property_text>`
- The five shared arbitraries (`arbitraryTitle`, `arbitraryWhitespaceTitle`, `arbitraryTask`, `arbitraryTaskList`, `arbitraryValidFilter`) should be defined once in `src/__tests__/arbitraries.ts` and imported by all property test files
- `localStorage` is mocked in tests using `vi.stubGlobal`; restore with `vi.unstubAllGlobals()` in `afterEach`
- UUID generation in `ADD_TASK` may use `crypto.randomUUID()` (available in all modern browsers and Node 14.17+)
- The `jsdom` or `happy-dom` environment must be configured in `vitest.config.ts` for DOM snapshot tests

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "6.1"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "7.4", "9.1"] },
    { "id": 8, "tasks": ["10.1"] }
  ]
}
```
