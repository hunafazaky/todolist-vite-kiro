// Feature: todolist-app, Property 1: valid task creation prepends to list

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { reducer } from '../reducer';
import type { AppState } from '../types';
import { arbitraryTaskList, arbitraryTitle } from './arbitraries';

/**
 * Validates: Requirements 1.2, 1.4, 2.1
 *
 * For any existing task list and any valid title, dispatching ADD_TASK must:
 *   - Increase the task list length by exactly 1
 *   - Place the new task at index 0 (prepended)
 *   - Retain all original tasks at their prior relative positions (shifted by 1)
 *   - Set the new task's completed to false
 *   - Set the new task's title to the trimmed version of the input
 */
describe('Property 1: Valid task creation prepends to list', () => {
  it('prepends a new task and preserves existing tasks', () => {
    fc.assert(
      fc.property(arbitraryTaskList, arbitraryTitle, (tasks, title) => {
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

        // Length is exactly one greater
        if (nextState.tasks.length !== tasks.length + 1) return false;

        const newTask = nextState.tasks[0];

        // New task is at index 0
        if (!newTask) return false;

        // New task has completed: false
        if (newTask.completed !== false) return false;

        // New task title equals trimmed input
        if (newTask.title !== title.trim()) return false;

        // All original tasks are present at shifted positions
        for (let i = 0; i < tasks.length; i++) {
          if (nextState.tasks[i + 1].id !== tasks[i].id) return false;
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
