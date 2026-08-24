// Feature: todolist-app, Property 8: localStorage serialisation round-trip
import { describe, it, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { loadTasks, saveTasks } from '../storage';
import { arbitraryTaskList } from './arbitraries';

/**
 * Property 8: localStorage serialisation round-trip
 * Validates: Requirements 7.1, 7.2
 *
 * For any array of Task objects, serialising the array to localStorage and then
 * deserialising it must produce an array deeply equal to the original, with all
 * fields (id, title, completed, createdAt) intact.
 */

describe('Property 8: localStorage serialisation round-trip', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips any task list through localStorage without data loss', () => {
    fc.assert(
      fc.property(arbitraryTaskList, (tasks) => {
        // Set up a minimal in-memory localStorage stub
        const store: Record<string, string> = {};
        const mockLocalStorage = {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => { store[key] = value; },
          removeItem: (key: string) => { delete store[key]; },
          clear: () => { Object.keys(store).forEach(k => delete store[k]); },
          key: (index: number) => Object.keys(store)[index] ?? null,
          get length() { return Object.keys(store).length; },
        };

        vi.stubGlobal('localStorage', mockLocalStorage);

        // Write
        const saveError = saveTasks(tasks);

        // saveTasks must not throw and must return null on success
        if (saveError !== null) return false;

        // Read back
        const { tasks: loaded, error } = loadTasks();

        // No error expected
        if (error !== null) return false;

        // Deep equality: same length and every field of every task is intact
        if (loaded.length !== tasks.length) return false;

        for (let i = 0; i < tasks.length; i++) {
          const original = tasks[i];
          const restored = loaded[i];
          if (
            restored.id !== original.id ||
            restored.title !== original.title ||
            restored.completed !== original.completed ||
            restored.createdAt !== original.createdAt
          ) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
