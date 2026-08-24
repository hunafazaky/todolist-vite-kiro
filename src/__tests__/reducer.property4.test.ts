// Feature: todolist-app, Property 4: toggle is its own inverse (round-trip)

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTask } from './arbitraries';

/**
 * Validates: Requirements 3.2, 3.3
 *
 * For any task, toggling its completion status twice must return the task to
 * its original completion status, leaving all other fields (id, title,
 * createdAt) unchanged.
 */
describe('Property 4: Toggle is its own inverse (round-trip)', () => {
  it('double-toggle restores original completed status and leaves other fields unchanged', () => {
    fc.assert(
      fc.property(arbitraryTask, (task) => {
        const initialState: AppState = {
          tasks: [task],
          filter: 'all',
          editingId: null,
          error: null,
        };

        const afterFirstToggle = reducer(initialState, {
          type: 'TOGGLE_TASK',
          payload: { id: task.id },
        });

        const afterSecondToggle = reducer(afterFirstToggle, {
          type: 'TOGGLE_TASK',
          payload: { id: task.id },
        });

        const finalTask = afterSecondToggle.tasks[0];

        // completed must be restored to original value
        if (finalTask.completed !== task.completed) return false;

        // All other fields must be unchanged
        if (finalTask.id !== task.id) return false;
        if (finalTask.title !== task.title) return false;
        if (finalTask.createdAt !== task.createdAt) return false;

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
