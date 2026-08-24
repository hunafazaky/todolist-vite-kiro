// Feature: todolist-app, Property 6: Filter correctness — Active

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { render } from '../render';
import type { AppState } from '../types';
import { arbitraryTaskList } from './arbitraries';

/**
 * Property 6: Filter correctness — Active
 *
 * For any task list, when the active filter is "Active":
 *   1. Every task rendered must have completed === false.
 *   2. Every task in the full list with completed === false must be rendered.
 *
 * Validates: Requirements 6.3
 */
describe('Property 6: Active filter shows only incomplete tasks', () => {
  it('renders only incomplete tasks and includes all incomplete tasks when filter is "active"', () => {
    fc.assert(
      fc.property(arbitraryTaskList, (tasks) => {
        const state: AppState = {
          tasks,
          filter: 'active',
          editingId: null,
          error: null,
        };

        const root = document.createElement('div');
        render(state, root);

        // Collect IDs of rendered task items
        const renderedIds = Array.from(
          root.querySelectorAll<HTMLElement>('li.task-item')
        ).map((li) => li.dataset.id as string);

        const incompleteTasks = tasks.filter((t) => !t.completed);
        const incompleteIds = incompleteTasks.map((t) => t.id);

        // 1. Every rendered task must be incomplete (completed === false)
        for (const id of renderedIds) {
          const task = tasks.find((t) => t.id === id);
          if (!task) return false; // rendered unknown task — violation
          if (task.completed !== false) return false;
        }

        // 2. Every incomplete task must appear in the rendered list
        for (const id of incompleteIds) {
          if (!renderedIds.includes(id)) return false;
        }

        return true;
      }),
      { numRuns: 100 }
    );
  });
});
