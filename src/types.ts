export interface Task {
  id: string;        // UUID v4, generated at creation time
  title: string;     // trimmed, 1–255 characters
  completed: boolean; // false on creation
  createdAt: string; // ISO 8601 string (new Date().toISOString())
}

export type FilterOption = 'all' | 'active' | 'completed';

export interface AppState {
  tasks: Task[];             // ordered: most recently created first
  filter: FilterOption;      // currently active filter
  editingId: string | null;  // ID of task in edit mode, or null
  error: string | null;      // transient error message, or null
}

export type Action =
  | { type: 'ADD_TASK';    payload: { title: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'TOGGLE_TASK'; payload: { id: string } }
  | { type: 'EDIT_START';  payload: { id: string } }
  | { type: 'EDIT_SAVE';   payload: { id: string; title: string } }
  | { type: 'EDIT_CANCEL' }
  | { type: 'SET_FILTER';  payload: { filter: FilterOption } }
  | { type: 'HYDRATE';     payload: { tasks: Task[] } }
  | { type: 'CLEAR_ERROR' };
