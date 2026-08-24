import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '../render';
import type { AppState, Task } from '../types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'task-1',
    title: overrides.title ?? 'Buy groceries',
    completed: overrides.completed ?? false,
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00.000Z').toISOString(),
  };
}

function makeState(overrides: Partial<AppState> = {}): AppState {
  return {
    tasks: [],
    filter: 'all',
    editingId: null,
    error: null,
    ...overrides,
  };
}

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('div');
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('render — task list', () => {
  it('renders the correct number of <li> elements for a list of tasks', () => {
    const tasks = [
      makeTask({ id: '1', title: 'Task one' }),
      makeTask({ id: '2', title: 'Task two' }),
      makeTask({ id: '3', title: 'Task three' }),
    ];

    render(makeState({ tasks }), root);

    const items = root.querySelectorAll('#task-list li');
    expect(items).toHaveLength(3);
  });

  it('renders a single task with the correct title text', () => {
    const tasks = [makeTask({ title: 'Write tests' })];

    render(makeState({ tasks }), root);

    const titleSpan = root.querySelector('.task-title');
    expect(titleSpan?.textContent).toBe('Write tests');
  });
});

describe('render — completed task styling', () => {
  it('applies the "completed" class to the title span of a completed task', () => {
    const tasks = [makeTask({ completed: true })];

    render(makeState({ tasks }), root);

    const titleSpan = root.querySelector('.task-title');
    expect(titleSpan?.classList.contains('completed')).toBe(true);
  });

  it('does not apply the "completed" class for an incomplete task', () => {
    const tasks = [makeTask({ completed: false })];

    render(makeState({ tasks }), root);

    const titleSpan = root.querySelector('.task-title');
    expect(titleSpan?.classList.contains('completed')).toBe(false);
  });
});

describe('render — empty state', () => {
  it('shows the empty-state message when the task list is empty', () => {
    render(makeState({ tasks: [] }), root);

    const emptyState = root.querySelector('#empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState?.textContent).toBeTruthy();
  });

  it('does not show the task list <ul> when no tasks exist', () => {
    render(makeState({ tasks: [] }), root);

    const list = root.querySelector('#task-list');
    expect(list).toBeNull();
  });

  it('hides the empty-state element when tasks are present', () => {
    const tasks = [makeTask()];

    render(makeState({ tasks }), root);

    const emptyState = root.querySelector('#empty-state');
    expect(emptyState).toBeNull();
  });

  it('shows empty-state message when active filter matches no tasks', () => {
    // All tasks are completed, but filter is set to 'active'
    const tasks = [makeTask({ completed: true })];

    render(makeState({ tasks, filter: 'active' }), root);

    const emptyState = root.querySelector('#empty-state');
    expect(emptyState).not.toBeNull();
  });
});

describe('render — edit mode', () => {
  it('renders the form in edit mode when editingId is set', () => {
    const task = makeTask({ id: 'edit-me', title: 'Existing title' });

    render(makeState({ tasks: [task], editingId: 'edit-me' }), root);

    const saveBtn = root.querySelector('#save-task-btn');
    const cancelBtn = root.querySelector('#cancel-edit-btn');
    expect(saveBtn).not.toBeNull();
    expect(cancelBtn).not.toBeNull();
  });

  it('pre-fills the input with the editing task title', () => {
    const task = makeTask({ id: 'edit-me', title: 'Pre-filled value' });

    render(makeState({ tasks: [task], editingId: 'edit-me' }), root);

    const input = root.querySelector<HTMLInputElement>('#task-title-input');
    expect(input?.value).toBe('Pre-filled value');
  });

  it('does not render Save/Cancel buttons when not in edit mode', () => {
    render(makeState({ tasks: [makeTask()] }), root);

    expect(root.querySelector('#save-task-btn')).toBeNull();
    expect(root.querySelector('#cancel-edit-btn')).toBeNull();
  });

  it('renders the Add button in create mode', () => {
    render(makeState(), root);

    const addBtn = root.querySelector('#add-task-btn');
    expect(addBtn).not.toBeNull();
  });

  it('sets data-editing-id on the form matching the editingId', () => {
    const task = makeTask({ id: 'abc-123', title: 'Some task' });

    render(makeState({ tasks: [task], editingId: 'abc-123' }), root);

    const form = root.querySelector<HTMLFormElement>('#task-form');
    expect(form?.dataset.editingId).toBe('abc-123');
  });
});

describe('render — error banner', () => {
  it('renders the error banner when state.error is non-null', () => {
    render(makeState({ error: 'Something went wrong' }), root);

    const banner = root.querySelector('#error-banner');
    expect(banner).not.toBeNull();
  });

  it('displays the error message text inside the banner', () => {
    render(makeState({ error: 'Could not save tasks' }), root);

    const banner = root.querySelector('#error-banner');
    expect(banner?.textContent).toContain('Could not save tasks');
  });

  it('renders a dismiss button inside the error banner', () => {
    render(makeState({ error: 'An error' }), root);

    const dismissBtn = root.querySelector('#dismiss-error');
    expect(dismissBtn).not.toBeNull();
  });

  it('does not render the error banner when state.error is null', () => {
    render(makeState({ error: null }), root);

    const banner = root.querySelector('#error-banner');
    expect(banner).toBeNull();
  });
});

describe('render — filter bar', () => {
  it('renders three filter buttons', () => {
    render(makeState(), root);

    const filterBtns = root.querySelectorAll('#filter-bar .filter-btn');
    expect(filterBtns).toHaveLength(3);
  });

  it('marks the active filter button with the "active" class', () => {
    render(makeState({ filter: 'completed' }), root);

    const activeBtn = root.querySelector<HTMLButtonElement>(
      '#filter-bar button[data-filter="completed"]'
    );
    expect(activeBtn?.classList.contains('active')).toBe(true);
  });

  it('does not mark inactive filter buttons with the "active" class', () => {
    render(makeState({ filter: 'all' }), root);

    const activeBtn = root.querySelector<HTMLButtonElement>(
      '#filter-bar button[data-filter="completed"]'
    );
    expect(activeBtn?.classList.contains('active')).toBe(false);
  });
});
