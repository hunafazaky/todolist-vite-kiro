import './styles.css';
import { dispatch, getState, subscribe } from './store';
import { render } from './render';
import type { FilterOption } from './types';

// ── Bootstrap ───────────────────────────────────────────────────────────────

const appRoot = document.getElementById('app') as HTMLElement;
if (!appRoot) {
  throw new Error('Missing #app mount point in HTML');
}

// Initial render
render(getState(), appRoot);

// Re-render on every state change
subscribe((state) => {
  render(state, appRoot);
  // After re-render, restore focus to the title input if a validation error
  // was just set so the user can correct their input without clicking.
  if (state.error !== null || document.getElementById('task-title-error')?.textContent) {
    (document.getElementById('task-title-input') as HTMLInputElement | null)?.focus();
  }
});

// ── Event delegation ─────────────────────────────────────────────────────────
// All task-item events (toggle, edit, delete) bubble up to #app.
// Form events are also handled here via delegation to avoid re-binding after
// each re-render.

appRoot.addEventListener('submit', handleFormSubmit);
appRoot.addEventListener('click', handleClick);

// ── Handlers ─────────────────────────────────────────────────────────────────

function handleFormSubmit(event: Event): void {
  event.preventDefault();

  const form = (event.target as HTMLElement).closest<HTMLFormElement>('#task-form');
  if (!form) return;

  const input = form.querySelector<HTMLInputElement>('#task-title-input');
  if (!input) return;

  const rawTitle = input.value;
  const editingId = form.dataset.editingId ?? null;

  if (editingId) {
    // Edit mode — save the updated title
    dispatch({ type: 'EDIT_SAVE', payload: { id: editingId, title: rawTitle } });
  } else {
    // Create mode — add a new task
    dispatch({ type: 'ADD_TASK', payload: { title: rawTitle } });
  }

  // If the state now has an error (validation failure), surface it in the
  // inline error element that render.ts placed in the DOM.
  const errorEl = document.getElementById('task-title-error');
  if (errorEl) {
    const currentError = getState().error;
    if (currentError) {
      errorEl.textContent = currentError;
      // Clear the error from global state so the banner doesn't also show it,
      // but keep it visible inline.
      dispatch({ type: 'CLEAR_ERROR' });
    } else {
      errorEl.textContent = '';
    }
  }
}

function handleClick(event: Event): void {
  const target = event.target as HTMLElement;

  // ── Cancel edit ────────────────────────────────────────────────────────────
  if (target.closest('#cancel-edit-btn')) {
    dispatch({ type: 'EDIT_CANCEL' });
    return;
  }

  // ── Dismiss error banner ───────────────────────────────────────────────────
  if (target.closest('#dismiss-error')) {
    dispatch({ type: 'CLEAR_ERROR' });
    return;
  }

  // ── Filter buttons ─────────────────────────────────────────────────────────
  const filterBtn = target.closest<HTMLButtonElement>('.filter-btn');
  if (filterBtn?.dataset.filter) {
    dispatch({
      type: 'SET_FILTER',
      payload: { filter: filterBtn.dataset.filter as FilterOption },
    });
    return;
  }

  // ── Task-level actions (all carry data-id) ─────────────────────────────────

  // Toggle completion
  const toggleEl = target.closest<HTMLInputElement>('.task-toggle');
  if (toggleEl?.dataset.id) {
    dispatch({ type: 'TOGGLE_TASK', payload: { id: toggleEl.dataset.id } });
    return;
  }

  // Edit task
  const editBtn = target.closest<HTMLButtonElement>('.task-edit-btn');
  if (editBtn?.dataset.id) {
    dispatch({ type: 'EDIT_START', payload: { id: editBtn.dataset.id } });
    return;
  }

  // Delete task
  const deleteBtn = target.closest<HTMLButtonElement>('.task-delete-btn');
  if (deleteBtn?.dataset.id) {
    dispatch({ type: 'DELETE_TASK', payload: { id: deleteBtn.dataset.id } });
    return;
  }
}
