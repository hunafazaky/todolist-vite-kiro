// Feature: todolist-app, Property 3: Title length boundary enforcement

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTaskList } from './arbitraries';

/**
 * Validates: Requirements 1.5
 *
 * For any title whose trimmed length exceeds 255 characters, dispatching ADD_TASK
 * must leave the task list unchanged (same length, same task IDs in the same order).
 *
 * Note: the length check applies to the trimmed title because the app always
 * stores the trimmed value. We filter the arbitrary to ensure the trimmed form
 * still exceeds 255 chars, matching what validation.ts enforces.
 */
describe('Property 3: Title length boundary enforcement', () => {
  it('leaves the task list unchanged for any title whose trimmed length exceeds 255 characters', () => {
    fc.assert(
      fc.property(
        arbitraryTaskList,
        // Generate strings whose trimmed length also exceeds 255 characters so
        // they are definitively too long after the app trims them.
        fc.string({ minLength: 256 }).filter(s => s.trim().length > 255),
        (tasks, title) => {
          const initialState: AppState = {
            tasks,
            filter: 'all',
            editingId: null,
            error: null,
          };

          const nextState = reducer(initialState, {
            type: 'ADD_TASK',
            payload: { title },
          });

          // Task list must remain the same length
          if (nextState.tasks.length !== tasks.length) return false;

          // Every task must be at the same position with the same ID (no mutation)
          for (let i = 0; i < tasks.length; i++) {
            if (nextState.tasks[i].id !== tasks[i].id) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
