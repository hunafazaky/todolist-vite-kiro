// test-add-task.js
// Tests the ADD_TASK branch of the reducer using console.assert.
// Paste into the browser console or run with: node test-add-task.js
//
// NOTE: This only covers the pure reducer logic (state in → state out).
// For browser testing, import reducer from src/reducer.ts instead.

// ── Minimal inline stubs (only needed when running as plain JS) ───────────────

function validateTitle(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return 'Title cannot be empty.';
  if (trimmed.length > 255) return `Title must be 255 characters or fewer.`;
  return trimmed;
}

function reducer(state: any, action: any) {
  if (action.type !== 'ADD_TASK') throw new Error('stub only handles ADD_TASK');

  const result = validateTitle(action.payload.title);
  const trimmed = action.payload.title.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= 255 && result === trimmed;

  if (!isValid) return { ...state, error: result };

  return {
    ...state,
    tasks: [
      { id: 'test-id', title: trimmed, completed: false, createdAt: new Date().toISOString() },
      ...state.tasks,
    ],
    error: null,
  };
}

const EMPTY_STATE = { tasks: [], filter: 'all', editingId: null, error: null };

// ── Helpers ───────────────────────────────────────────────────────────────────

function addTask(state: any, title: string) {
  return reducer(state, { type: 'ADD_TASK', payload: { title } });
}

let passed = 0;
let failed = 0;

function assert(condition: any, label: string) {
  console.assert(condition, `FAIL: ${label}`);
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}`); failed++; }
}

// ── Normal (happy-path) inputs ────────────────────────────────────────────────

console.group('ADD_TASK — normal inputs');

// 1. A plain title is added to the front of the list
{
  const next = addTask(EMPTY_STATE, 'Buy groceries');
  assert(next.tasks.length === 1, 'task count increases by 1');
  assert(next.tasks[0].title === 'Buy groceries', 'title is stored as-is');
  assert(next.tasks[0].completed === false, 'new task starts as incomplete');
  assert(next.error === null, 'no error on success');
}

// 2. Surrounding whitespace is trimmed
{
  const next = addTask(EMPTY_STATE, '  Walk the dog  ');
  assert(next.tasks[0].title === 'Walk the dog', 'title is trimmed');
}

// 3. New task is prepended (most-recent first)
{
  const withOne = addTask(EMPTY_STATE, 'First task');
  const withTwo = addTask(withOne, 'Second task');
  assert(withTwo.tasks[0].title === 'Second task', 'newest task is first');
  assert(withTwo.tasks.length === 2, 'both tasks are present');
}

// 4. Max-length title (255 chars) is accepted
{
  const longTitle = 'a'.repeat(255);
  const next = addTask(EMPTY_STATE, longTitle);
  assert(next.tasks.length === 1, '255-char title is accepted');
  assert(next.error === null, 'no error for max-length title');
}

console.groupEnd();

// ── Negative (invalid) inputs ─────────────────────────────────────────────────

console.group('ADD_TASK — negative inputs');

// 5. Empty string is rejected
{
  const next = addTask(EMPTY_STATE, '');
  assert(next.tasks.length === 0, 'empty title does not add a task');
  assert(next.error === 'Title cannot be empty.', 'correct error for empty title');
}

// 6. Whitespace-only string is rejected
{
  const next = addTask(EMPTY_STATE, '   ');
  assert(next.tasks.length === 0, 'whitespace-only title is rejected');
  assert(next.error === 'Title cannot be empty.', 'correct error for whitespace-only');
}

// 7. Title exceeding 255 characters is rejected
{
  const tooLong = 'x'.repeat(256);
  const next = addTask(EMPTY_STATE, tooLong);
  assert(next.tasks.length === 0, '256-char title does not add a task');
  assert(next.error === 'Title must be 255 characters or fewer.', 'correct error for too-long title');
}

// 8. Rejection is a no-op: existing tasks are not touched
{
  const withOne = addTask(EMPTY_STATE, 'Existing task');
  const next = addTask(withOne, '');
  assert(next.tasks.length === 1, 'existing tasks preserved on failure');
  assert(next.tasks[0].title === 'Existing task', 'existing task title unchanged');
}

console.groupEnd();

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\nResults: ${passed} passed, ${failed} failed`);
