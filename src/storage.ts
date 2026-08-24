import type { Task } from './types';

const STORAGE_KEY = 'todolist-app-tasks';

export interface LoadResult {
  tasks: Task[];
  error: string | null;
}

/**
 * Reads the task list from localStorage.
 * - Returns tasks and null error on success.
 * - Returns empty array and null error when no data exists (null).
 * - Returns empty array and an error message when JSON is malformed.
 */
export function loadTasks(): LoadResult {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    return { tasks: [], error: null };
  }

  try {
    const tasks = JSON.parse(raw) as Task[];
    return { tasks, error: null };
  } catch {
    return {
      tasks: [],
      error: 'Saved data could not be loaded. Starting with an empty task list.',
    };
  }
}

/**
 * Writes the task list to localStorage.
 * - Returns null on success.
 * - Returns an Error object (does not throw) when the write fails
 *   (e.g., quota exceeded or security restrictions).
 */
export function saveTasks(tasks: Task[]): Error | null {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return null;
  } catch (e) {
    return e instanceof Error
      ? e
      : new Error('Failed to save tasks to local storage.');
  }
}
