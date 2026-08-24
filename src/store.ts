import { AppState, Action } from './types';
import { reducer } from './reducer';
import { loadTasks, saveTasks } from './storage';

type Listener = (state: AppState) => void;

const initialState: AppState = {
  tasks: [],
  filter: 'all',
  editingId: null,
  error: null,
};

let state: AppState = initialState;
const listeners: Set<Listener> = new Set();

function notify(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

/**
 * Dispatch an action: run it through the reducer, persist tasks to
 * localStorage, and notify all subscribers of the new state.
 */
export function dispatch(action: Action): void {
  state = reducer(state, action);

  // Persist after every mutation that could change tasks
  const saveError = saveTasks(state.tasks);
  if (saveError) {
    // Surface the save failure without altering in-memory tasks
    state = { ...state, error: saveError.message };
  }

  notify();
}

/**
 * Subscribe to state changes. Returns an unsubscribe function.
 */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Return the current state snapshot.
 */
export function getState(): AppState {
  return state;
}

// --- Module initialisation ---
// Hydrate from localStorage on module load. If data was malformed,
// carry the error forward into state so the render layer can display it.
(function init() {
  const { tasks, error } = loadTasks();

  // Seed the task list
  dispatch({ type: 'HYDRATE', payload: { tasks } });

  // If loading produced an error, surface it in state
  if (error) {
    state = { ...state, error };
    notify();
  }
})();
