// Feature: todolist-app, Property 5: edit preserves identity and metadata

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTask, arbitraryTitle } from './arbitraries';

/**
 * Validates: Requirements 5.3
 *
 * For any task and any valid new title, dispatching EDIT_SAVE must update only
 * the task's title and leave the task's id, completed status, and createdAt
 * timestamp unchanged.
 */
describe('Property 5: Edit preserves identity and metadata', () => {
  it('EDIT_SAVE updates only the title and leaves id, completed, and createdAt unchanged', () => {
    fc.assert(
      fc.property(arbitraryTask, arbitraryTitle, (task, newTitle) => {
        const initialState: AppState = {
          tasks: [task],
          filter: 'all',
          editingId: task.id,
          error: null,
        };

        const afterEdit = reducer(initialState, {
          type: 'EDIT_SAVE',
          payload: { id: task.id, title: newTitle },
        });

        const updatedTask = afterEdit.tasks.find(t => t.id === task.id);

        // Task must still exist
        if (!updatedTask) return false;

        // Title must be updated to the trimmed new title
        if (updatedTask.title !== newTitle.trim()) return false;

        // id must be unchanged
        if (updatedTask.id !== task.id) return false;

        // completed status must be unchanged
        if (updatedTask.completed !== task.completed) return false;

        // createdAt must be unchanged
        if (updatedTask.createdAt !== task.createdAt) return false;

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
