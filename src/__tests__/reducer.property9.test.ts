// Feature: todolist-app, Property 9: deletion removes exactly one task

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTask } from './arbitraries';

/**
 * Validates: Requirements 4.2
 *
 * For any task list containing at least one task, dispatching DELETE_TASK for a
 * valid task ID must:
 *   - Reduce the task list length by exactly 1
 *   - Remove the targeted task so it no longer appears in the resulting list
 */
describe('Property 9: Deletion removes exactly one task', () => {
  it('removes exactly one task and leaves no trace of the deleted task', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryTask, { minLength: 1 }),
        (tasks) => {
          // Pick the first task as the target to delete (list has at least 1 task)
          const targetTask = tasks[0];

          const initialState: AppState = {
            tasks,
            filter: 'all',
            editingId: null,
            error: null,
          };

          const nextState = reducer(initialState, {
            type: 'DELETE_TASK',
            payload: { id: targetTask.id },
          });

          // Length is exactly one less than before
          if (nextState.tasks.length !== tasks.length - 1) return false;

          // The deleted task is no longer present
          if (nextState.tasks.some(t => t.id === targetTask.id)) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
