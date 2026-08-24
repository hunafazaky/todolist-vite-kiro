import { describe, it, expect } from 'vitest';
import { reducer } from '../reducer';
import { AppState, Task } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Default title',
    completed: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const initialState: AppState = {
  tasks: [],
  filter: 'all',
  editingId: null,
  error: null,
};

function stateWithTasks(...tasks: Task[]): AppState {
  return { ...initialState, tasks };
}

// ---------------------------------------------------------------------------
// ADD_TASK
// ---------------------------------------------------------------------------

describe('ADD_TASK', () => {
  it('prepends a new task with the trimmed title, completed=false, and a createdAt timestamp', () => {
    const state = stateWithTasks(makeTask({ id: 'existing', title: 'Old task' }));
    const next = reducer(state, { type: 'ADD_TASK', payload: { title: '  Buy milk  ' } });

    expect(next.tasks).toHaveLength(2);
    expect(next.tasks[0].title).toBe('Buy milk');
    expect(next.tasks[0].completed).toBe(false);
    expect(next.tasks[0].createdAt).toBeTruthy();
    expect(typeof next.tasks[0].id).toBe('string');
    // existing task is still there at index 1
    expect(next.tasks[1].id).toBe('existing');
    expect(next.error).toBeNull();
  });

  it('sets error and leaves tasks unchanged when title is empty', () => {
    const state = stateWithTasks(makeTask());
    const next = reducer(state, { type: 'ADD_TASK', payload: { title: '' } });

    expect(next.tasks).toHaveLength(1);
    expect(next.error).not.toBeNull();
  });

  it('sets error and leaves tasks unchanged when title is whitespace-only', () => {
    const state = stateWithTasks(makeTask());
    const next = reducer(state, { type: 'ADD_TASK', payload: { title: '   ' } });

    expect(next.tasks).toHaveLength(1);
    expect(next.error).not.toBeNull();
  });

  it('sets error and leaves tasks unchanged when title exceeds 255 characters', () => {
    const longTitle = 'a'.repeat(256);
    const state = stateWithTasks();
    const next = reducer(state, { type: 'ADD_TASK', payload: { title: longTitle } });

    expect(next.tasks).toHaveLength(0);
    expect(next.error).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// DELETE_TASK
// ---------------------------------------------------------------------------

describe('DELETE_TASK', () => {
  it('removes the task with the matching ID', () => {
    const t1 = makeTask({ id: 'a', title: 'Task A' });
    const t2 = makeTask({ id: 'b', title: 'Task B' });
    const state = stateWithTasks(t1, t2);
    const next = reducer(state, { type: 'DELETE_TASK', payload: { id: 'a' } });

    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].id).toBe('b');
  });

  it('is a no-op when the ID does not exist (guard test)', () => {
    const state = stateWithTasks(makeTask({ id: 'a' }));
    const next = reducer(state, { type: 'DELETE_TASK', payload: { id: 'unknown-id' } });

    expect(next).toBe(state); // exact same reference — no state change
  });
});

// ---------------------------------------------------------------------------
// TOGGLE_TASK
// ---------------------------------------------------------------------------

describe('TOGGLE_TASK', () => {
  it('sets completed=true when task is currently incomplete', () => {
    const task = makeTask({ id: 'a', completed: false });
    const state = stateWithTasks(task);
    const next = reducer(state, { type: 'TOGGLE_TASK', payload: { id: 'a' } });

    expect(next.tasks[0].completed).toBe(true);
  });

  it('sets completed=false when task is currently complete', () => {
    const task = makeTask({ id: 'a', completed: true });
    const state = stateWithTasks(task);
    const next = reducer(state, { type: 'TOGGLE_TASK', payload: { id: 'a' } });

    expect(next.tasks[0].completed).toBe(false);
  });

  it('round-trip: toggling twice returns to original completion status', () => {
    const task = makeTask({ id: 'a', completed: false });
    const state = stateWithTasks(task);
    const after1 = reducer(state, { type: 'TOGGLE_TASK', payload: { id: 'a' } });
    const after2 = reducer(after1, { type: 'TOGGLE_TASK', payload: { id: 'a' } });

    expect(after2.tasks[0].completed).toBe(false);
  });

  it('is a no-op when the ID does not exist (guard test)', () => {
    const state = stateWithTasks(makeTask({ id: 'a' }));
    const next = reducer(state, { type: 'TOGGLE_TASK', payload: { id: 'unknown-id' } });

    expect(next).toBe(state); // exact same reference — no state change
  });
});

// ---------------------------------------------------------------------------
// EDIT_START
// ---------------------------------------------------------------------------

describe('EDIT_START', () => {
  it('sets editingId to the given task ID and clears any existing error', () => {
    const state = { ...initialState, error: 'some error' };
    const next = reducer(state, { type: 'EDIT_START', payload: { id: 'task-1' } });

    expect(next.editingId).toBe('task-1');
    expect(next.error).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// EDIT_SAVE
// ---------------------------------------------------------------------------

describe('EDIT_SAVE', () => {
  it('updates only the title; preserves id, completed, and createdAt', () => {
    const task = makeTask({ id: 'a', title: 'Old title', completed: true, createdAt: '2024-01-01T00:00:00.000Z' });
    const state = { ...stateWithTasks(task), editingId: 'a' };
    const next = reducer(state, { type: 'EDIT_SAVE', payload: { id: 'a', title: '  New title  ' } });

    expect(next.tasks[0].title).toBe('New title');
    expect(next.tasks[0].id).toBe('a');
    expect(next.tasks[0].completed).toBe(true);
    expect(next.tasks[0].createdAt).toBe('2024-01-01T00:00:00.000Z');
    expect(next.editingId).toBeNull();
    expect(next.error).toBeNull();
  });

  it('sets error and leaves task unchanged when title is empty', () => {
    const task = makeTask({ id: 'a', title: 'Original' });
    const state = { ...stateWithTasks(task), editingId: 'a' };
    const next = reducer(state, { type: 'EDIT_SAVE', payload: { id: 'a', title: '' } });

    expect(next.tasks[0].title).toBe('Original');
    expect(next.error).not.toBeNull();
    // edit mode is retained so user can correct input
    expect(next.editingId).toBe('a');
  });

  it('sets error and leaves task unchanged when title is whitespace-only', () => {
    const task = makeTask({ id: 'a', title: 'Original' });
    const state = { ...stateWithTasks(task), editingId: 'a' };
    const next = reducer(state, { type: 'EDIT_SAVE', payload: { id: 'a', title: '   \t\n  ' } });

    expect(next.tasks[0].title).toBe('Original');
    expect(next.error).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// EDIT_CANCEL
// ---------------------------------------------------------------------------

describe('EDIT_CANCEL', () => {
  it('clears editingId and error without modifying tasks', () => {
    const task = makeTask({ id: 'a' });
    const state = { ...stateWithTasks(task), editingId: 'a', error: 'some error' };
    const next = reducer(state, { type: 'EDIT_CANCEL' });

    expect(next.editingId).toBeNull();
    expect(next.error).toBeNull();
    expect(next.tasks).toEqual(state.tasks);
  });
});

// ---------------------------------------------------------------------------
// SET_FILTER
// ---------------------------------------------------------------------------

describe('SET_FILTER', () => {
  it('updates filter to "active"', () => {
    const next = reducer(initialState, { type: 'SET_FILTER', payload: { filter: 'active' } });
    expect(next.filter).toBe('active');
  });

  it('updates filter to "completed"', () => {
    const next = reducer(initialState, { type: 'SET_FILTER', payload: { filter: 'completed' } });
    expect(next.filter).toBe('completed');
  });

  it('updates filter back to "all"', () => {
    const state = { ...initialState, filter: 'active' as const };
    const next = reducer(state, { type: 'SET_FILTER', payload: { filter: 'all' } });
    expect(next.filter).toBe('all');
  });
});

// ---------------------------------------------------------------------------
// HYDRATE
// ---------------------------------------------------------------------------

describe('HYDRATE', () => {
  it('replaces the task list with the payload tasks', () => {
    const existing = makeTask({ id: 'old', title: 'Old task' });
    const hydrated = makeTask({ id: 'new', title: 'Hydrated task' });
    const state = stateWithTasks(existing);
    const next = reducer(state, { type: 'HYDRATE', payload: { tasks: [hydrated] } });

    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].id).toBe('new');
  });

  it('sets tasks to empty array when hydrated with an empty list', () => {
    const state = stateWithTasks(makeTask());
    const next = reducer(state, { type: 'HYDRATE', payload: { tasks: [] } });

    expect(next.tasks).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CLEAR_ERROR
// ---------------------------------------------------------------------------

describe('CLEAR_ERROR', () => {
  it('resets error field to null', () => {
    const state = { ...initialState, error: 'Something went wrong' };
    const next = reducer(state, { type: 'CLEAR_ERROR' });

    expect(next.error).toBeNull();
  });

  it('is a no-op on tasks, filter, and editingId', () => {
    const task = makeTask();
    const state = { tasks: [task], filter: 'active' as const, editingId: 'task-1', error: 'err' };
    const next = reducer(state, { type: 'CLEAR_ERROR' });

    expect(next.tasks).toEqual(state.tasks);
    expect(next.filter).toBe('active');
    expect(next.editingId).toBe('task-1');
  });
});
