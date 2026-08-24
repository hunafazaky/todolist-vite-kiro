import type { AppState, FilterOption } from './types';

/**
 * Pure render function: reads `state` and rebuilds the UI inside `root`.
 * No imports from store.ts — all event wiring is done in main.ts.
 *
 * DOM structure emitted into `root`:
 *   #error-banner          (only when state.error !== null)
 *   #task-form-section     task form (create or edit mode)
 *   #filter-bar            three filter buttons
 *   #task-list-section     <ul> of task items or empty-state <p>
 */
export function render(state: AppState, root: HTMLElement): void {
  root.innerHTML = '';

  // ── Error banner ──────────────────────────────────────────────────────────
  if (state.error !== null) {
    root.appendChild(buildErrorBanner(state.error));
  }

  // ── Task form ─────────────────────────────────────────────────────────────
  root.appendChild(buildTaskForm(state));

  // ── Filter bar ────────────────────────────────────────────────────────────
  root.appendChild(buildFilterBar(state.filter));

  // ── Task list ─────────────────────────────────────────────────────────────
  root.appendChild(buildTaskList(state));
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildErrorBanner(message: string): HTMLElement {
  const banner = document.createElement('div');
  banner.id = 'error-banner';
  banner.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent = message;

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.id = 'dismiss-error';
  dismiss.setAttribute('aria-label', 'Dismiss error');
  dismiss.textContent = '✕';

  banner.appendChild(text);
  banner.appendChild(dismiss);
  return banner;
}

function buildTaskForm(state: AppState): HTMLElement {
  const section = document.createElement('section');
  section.id = 'task-form-section';

  const editingTask =
    state.editingId !== null
      ? state.tasks.find((t) => t.id === state.editingId) ?? null
      : null;

  const isEditMode = editingTask !== null;

  const form = document.createElement('form');
  form.id = 'task-form';
  form.setAttribute('novalidate', '');
  if (isEditMode && editingTask) {
    form.dataset.editingId = editingTask.id;
  }

  // Title input
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'task-title-input';
  input.name = 'title';
  input.placeholder = isEditMode ? 'Edit task title…' : 'Add a new task…';
  input.maxLength = 255;
  input.setAttribute('aria-label', 'Task title');
  if (isEditMode && editingTask) {
    input.value = editingTask.title;
  }

  // Inline validation error (hidden by default)
  const validationError = document.createElement('p');
  validationError.id = 'task-title-error';
  validationError.className = 'validation-error';
  validationError.setAttribute('aria-live', 'polite');
  // Shown dynamically by main.ts when needed; starts empty
  validationError.textContent = '';

  // Action buttons row
  const actions = document.createElement('div');
  actions.className = 'form-actions';

  if (isEditMode) {
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.id = 'cancel-edit-btn';
    cancelBtn.textContent = 'Cancel';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.id = 'save-task-btn';
    saveBtn.textContent = 'Save';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);
  } else {
    const addBtn = document.createElement('button');
    addBtn.type = 'submit';
    addBtn.id = 'add-task-btn';
    addBtn.textContent = 'Add';

    actions.appendChild(addBtn);
  }

  form.appendChild(input);
  form.appendChild(validationError);
  form.appendChild(actions);
  section.appendChild(form);
  return section;
}

function buildFilterBar(activeFilter: FilterOption): HTMLElement {
  const nav = document.createElement('nav');
  nav.id = 'filter-bar';
  nav.setAttribute('aria-label', 'Filter tasks');

  const filters: { label: string; value: FilterOption }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  for (const { label, value } of filters) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-btn' + (value === activeFilter ? ' active' : '');
    btn.dataset.filter = value;
    btn.textContent = label;
    if (value === activeFilter) {
      btn.setAttribute('aria-current', 'true');
    }
    nav.appendChild(btn);
  }

  return nav;
}

function buildTaskList(state: AppState): HTMLElement {
  const section = document.createElement('section');
  section.id = 'task-list-section';

  const filteredTasks = state.tasks.filter((task) => {
    if (state.filter === 'active') return !task.completed;
    if (state.filter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Tasks are already stored most-recently-created first (index 0 = newest),
  // so no additional sort is needed — just render in array order.

  if (filteredTasks.length === 0) {
    const empty = document.createElement('p');
    empty.id = 'empty-state';
    empty.textContent =
      state.filter === 'all'
        ? 'No tasks yet. Add one above!'
        : state.filter === 'active'
        ? 'No active tasks.'
        : 'No completed tasks.';
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement('ul');
  list.id = 'task-list';
  list.setAttribute('aria-label', 'Task list');

  for (const task of filteredTasks) {
    list.appendChild(buildTaskItem(task));
  }

  section.appendChild(list);
  return section;
}

function buildTaskItem(task: {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}): HTMLElement {
  const li = document.createElement('li');
  li.className = 'task-item' + (task.completed ? ' task-item--completed' : '');
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-toggle';
  checkbox.checked = task.completed;
  checkbox.dataset.id = task.id;
  checkbox.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

  // Title
  const titleSpan = document.createElement('span');
  titleSpan.className = 'task-title' + (task.completed ? ' completed' : '');
  titleSpan.textContent = task.title;

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'task-edit-btn';
  editBtn.dataset.id = task.id;
  editBtn.setAttribute('aria-label', `Edit task "${task.title}"`);
  editBtn.textContent = 'Edit';

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'task-delete-btn';
  deleteBtn.dataset.id = task.id;
  deleteBtn.setAttribute('aria-label', `Delete task "${task.title}"`);
  deleteBtn.textContent = 'Delete';

  li.appendChild(checkbox);
  li.appendChild(titleSpan);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  return li;
}
