// Feature: todolist-app, Property 7: Filter correctness — Completed

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { render } from '../render';
import { arbitraryTaskList } from './arbitraries';
import type { AppState } from '../types';

/**
 * Property 7: Filter correctness — Completed
 *
 * For any task list, when the active filter is "Completed":
 *   - Every task rendered in the list must have `completed === true`
 *   - Every task in the full list with `completed === true` must appear in the rendered list
 *
 * Validates: Requirements 6.4
 */
describe('Property 7: Filter correctness — Completed', () => {
  it('completed filter shows only complete tasks and includes all of them', () => {
    fc.assert(
      fc.property(arbitraryTaskList, (tasks) => {
        const state: AppState = {
          tasks,
          filter: 'completed',
          editingId: null,
          error: null,
        };

        const root = document.createElement('div');
        render(state, root);

        const completedTasksInStore = tasks.filter((t) => t.completed);
        const renderedItems = root.querySelectorAll('.task-item');

        // All rendered task items must correspond to completed tasks
        for (const item of renderedItems) {
          const id = (item as HTMLElement).dataset.id;
          const matchingTask = tasks.find((t) => t.id === id);
          expect(matchingTask).toBeDefined();
          expect(matchingTask!.completed).toBe(true);
        }

        // All completed tasks in the store must be rendered
        expect(renderedItems.length).toBe(completedTasksInStore.length);

        for (const task of completedTasksInStore) {
          const rendered = root.querySelector(`.task-item[data-id="${task.id}"]`);
          expect(rendered).not.toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });
});
