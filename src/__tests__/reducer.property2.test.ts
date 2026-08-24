// Feature: todolist-app, Property 2: Whitespace-only and empty titles are rejected

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTaskList, arbitraryWhitespaceTitle } from './arbitraries';

/**
 * Validates: Requirements 1.3
 *
 * For any string composed entirely of whitespace characters (including the empty
 * string), dispatching ADD_TASK with that title must leave the task list unchanged
 * (same length, same task IDs in the same order).
 */
describe('Property 2: Whitespace-only and empty titles are rejected', () => {
  it('leaves the task list unchanged for any whitespace-only or empty title', () => {
    fc.assert(
      fc.property(arbitraryTaskList, arbitraryWhitespaceTitle, (tasks, title) => {
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

        // Every task must be the same object at the same position (no mutation)
        for (let i = 0; i < tasks.length; i++) {
          if (nextState.tasks[i].id !== tasks[i].id) return false;
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
