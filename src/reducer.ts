import { AppState, Action, Task } from './types';
import { validateTitle } from './validation';

/**
 * Pure state-transition function.
 * No side effects — all I/O (localStorage, DOM) happens outside this module.
 */
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TASK': {
      const result = validateTitle(action.payload.title);
      const trimmed = action.payload.title.trim();

      // validateTitle returns the trimmed title on success, or an error message on failure.
      // Success: result equals the trimmed string and is non-empty with valid length.
      const isValid =
        trimmed.length > 0 &&
        trimmed.length <= 255 &&
        result === trimmed;

      if (!isValid) {
        // result is an error message string
        return { ...state, error: result as string };
      }

      const newTask: Task = {
        id: crypto.randomUUID(),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        tasks: [newTask, ...state.tasks],
        error: null,
      };
    }

    case 'DELETE_TASK': {
      const exists = state.tasks.some(t => t.id === action.payload.id);
      if (!exists) {
        // No-op: ID not found
        return state;
      }

      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload.id),
      };
    }

    case 'TOGGLE_TASK': {
      const exists = state.tasks.some(t => t.id === action.payload.id);
      if (!exists) {
        // No-op: ID not found
        return state;
      }

      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, completed: !t.completed }
            : t
        ),
      };
    }

    case 'EDIT_START': {
      return {
        ...state,
        editingId: action.payload.id,
        error: null,
      };
    }

    case 'EDIT_SAVE': {
      const result = validateTitle(action.payload.title);
      const trimmed = action.payload.title.trim();

      const isValid =
        trimmed.length > 0 &&
        trimmed.length <= 255 &&
        result === trimmed;

      if (!isValid) {
        // Retain edit mode; set error
        return { ...state, error: result as string };
      }

      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id
            ? { ...t, title: trimmed }
            : t
        ),
        editingId: null,
        error: null,
      };
    }

    case 'EDIT_CANCEL': {
      return {
        ...state,
        editingId: null,
        error: null,
      };
    }

    case 'SET_FILTER': {
      return {
        ...state,
        filter: action.payload.filter,
      };
    }

    case 'HYDRATE': {
      return {
        ...state,
        tasks: action.payload.tasks,
      };
    }

    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null,
      };
    }

    default: {
      // Exhaustive check — TypeScript will error if a case is unhandled
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
